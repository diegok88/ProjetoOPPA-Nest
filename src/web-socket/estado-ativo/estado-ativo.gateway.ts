import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { CreateEstadoAtivoDto } from './dto/create-estado-ativo.dto';
import { UpdateEstadoAtivoDto } from './dto/update-estado-ativo.dto';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { CORS_ORIGINS } from '@/config/cors-origins';
import { WsJwtGuard } from '@/auth/guards/ws-jwt.guard';
import { WsRolesGuard } from '@/auth/guards/ws-roles.guard';
import { AuthSessionService } from '@/auth/guards/auth-session.service';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { OnEvent } from '@nestjs/event-emitter';
import { EstadoAtivoService } from './estado-ativo.service';
import type {
  CronometroTickEvent,
  EstadoTrocadoEvent,
} from './estado-ativo.service';
import type { AuthUser } from '@/auth/entities/auth-user.interface';
import type { EstadoAtivo } from './entities/estado-ativo.entity';

const SALA_SUPERVISAO = 'supervisao';
const PERFIS_SUPERVISAO: string[] = [ROLES.SUP1, ROLES.GER1, ROLES.ADN1];
const salaAtivo = (tagAtivoId: string): string => `ativo:${tagAtivoId}`;

@WebSocketGateway({
  namespace: 'estado-ativo',
  cors: { origin: CORS_ORIGINS, credentials: true },
})
@UseGuards(WsJwtGuard, WsRolesGuard)
export class EstadoAtivoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EstadoAtivoGateway.name);

  constructor(
    private readonly estadoAtivoService: EstadoAtivoService,
    private readonly session: AuthSessionService,
  ) {}

  /**
   * Autentica uma vez por conexão. A sala é definida no servidor a partir do
   * tagAtivoId do usuário; o cliente não escolhe o ativo.
   * EM72T e EM72D têm tokens diferentes, mas o mesmo tagAtivoId: mesma sala.
   */
  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.auth?.token as string | undefined;
    const user = token ? await this.session.authenticateToken(token) : null;

    if (!user) {
      this.logger.warn(`Conexão recusada: ${client.id}`);
      client.disconnect(true);
      return;
    }

    const tagAtivoId = await this.estadoAtivoService.buscarTagAtivoDoUsuario(
      user.userId,
    );

    client.data.user = user;
    client.data.tagAtivoId = tagAtivoId;

    let estadoAtual: EstadoAtivo | null = null;

    if (tagAtivoId) {
      client.join(salaAtivo(tagAtivoId));
      // Garante o timer a partir do estado aberto atual (restart, reenvio, reconexão)
      estadoAtual =
        await this.estadoAtivoService.garantirContadorDoAtivo(tagAtivoId);
    }
    if (PERFIS_SUPERVISAO.includes(user.perfil)) {
      client.join(SALA_SUPERVISAO);
    }

    client.emit('ativoIdentificado', { ativo: tagAtivoId });

    /* ===== CORREÇÃO: ponto de partida para o cliente =====
     * Sem isto, o front fica sem referência até um estadoAtivoTrocado chegar
     * (que só ocorre em um create). Aqui o cliente recebe o estado aberto e
     * o tempo já decorrido calculado do dataInicial — inicializa do estado atual. */
    if (estadoAtual) {
      client.emit('estadoAtivoAtual', estadoAtual);

      client.emit('cronometroTick', {
        ativo: estadoAtual.tagAtivoId,
        id: estadoAtual.id,
        tipoEstado: String(estadoAtual.tipoEstado).toUpperCase(),
        tempo: Math.floor(
          (Date.now() - estadoAtual.dataInicial.getTime()) / 1000,
        ),
      });

      this.logger.log(
        `Estado atual enviado na conexão: ativo ${estadoAtual.tagAtivoId} ` +
          `(${String(estadoAtual.tipoEstado).toUpperCase()}, tempo decorrido ` +
          `${Math.floor((Date.now() - estadoAtual.dataInicial.getTime()) / 1000)}s)`,
      );
    }

    if (tagAtivoId) {
      const [historico, contador] = await Promise.all([
        this.estadoAtivoService.historicoDoDiaAtual(tagAtivoId),
        this.estadoAtivoService.counterEstados(tagAtivoId),
      ]);
      client.emit('historicoAtualizado', historico);
      client.emit('estadoContador', contador);
    }

    this.logger.log(
      `Cliente conectado: ${client.id} (${user.userId}) ativo=${tagAtivoId}`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /** Dispositivo (DIS1) registra uma mudança de estado */
  @Roles(ROLES.DIS1)
  @SubscribeMessage('createEstadoAtivo')
  create(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateEstadoAtivoDto,
  ) {
    const user = client.data.user as AuthUser;
    return this.estadoAtivoService.create(dto);
  }

  /** Estado atual do ativo do próprio socket (terminal ao conectar/reconectar) */
  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('buscarEstadoAtivoCliente')
  async buscarEstadoAtivoCliente(@ConnectedSocket() client: Socket) {
    const tagAtivoId = client.data.tagAtivoId as string | null;
    if (!tagAtivoId) return null;
    return this.estadoAtivoService.garantirContadorDoAtivo(tagAtivoId);
  }

  /** Lista simples dos estados abertos */
  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('listarEstadoAtivos')
  listarEstadoAtivos() {
    return this.estadoAtivoService.listarEstadoAtivos();
  }

  /**
   * Histórico de estados finalizados do dia/turno atual.
   * Terminal: apenas do próprio ativo. Sem tagAtivoId vinculado: todos.
   */
  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('historicoEstadoAtivo')
  async historicoEstadoAtivo(@ConnectedSocket() client: Socket) {
    const tagAtivoId = client.data.tagAtivoId as string | null;
    return this.estadoAtivoService.historicoDoDiaAtual(tagAtivoId ?? undefined);
  }

  /** Lista filtrada/paginada com o findAll do service */
  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('findAllEstadoAtivo')
  findAll(@ConnectedSocket() client: Socket, @MessageBody() setorId: string) {
    const user = client.data.user as AuthUser;
    return this.estadoAtivoService.findAll({
      usuarioId: user.userId,
      perfilId: user.perfil,
      setorId,
      status: true,
      incluir: 'todos_parcial',
      decisao: 'listar',
    });
  }

  /** Contador de estados do dia/turno (carga inicial e sob demanda) */
  @Roles(ROLES.TER1)
  @SubscribeMessage('buscarContadorEstado')
  async buscarContadorEstado(@ConnectedSocket() client: Socket) {
    const tagAtivoId = client.data.tagAtivoId as string | null;
    return this.estadoAtivoService.counterEstados(tagAtivoId ?? undefined);
  }

  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('findOneEstadoAtivo')
  findOne(@MessageBody() id: string) {
    return this.estadoAtivoService.findOne(id);
  }

  /** Retoma os contadores a partir do banco */
  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('reiniciarContadorEstado')
  reiniciarContadorEstado() {
    return this.estadoAtivoService.reiniciarContador();
  }

  @Roles(ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('updateEstadoAtivo')
  update(@MessageBody() dto: UpdateEstadoAtivoDto) {
    return this.estadoAtivoService.update(dto.id, dto);
  }

  @Roles(ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('removeEstadoAtivo')
  remove(@MessageBody() id: string) {
    return this.estadoAtivoService.remove(id);
  }

  /**
   * Troca de estado: terminal do ativo e supervisão recebem a troca, e em
   * seguida o histórico atualizado do dia/turno — a lista se atualiza sozinha.
   */
  @OnEvent('estado.trocado')
  async onEstadoTrocado(payload: EstadoTrocadoEvent): Promise<void> {
    this.server
      .to([salaAtivo(payload.ativo), SALA_SUPERVISAO])
      .emit('estadoAtivoTrocado', payload);

    // Contador por duração do próprio ativo (terminal)
    const contadorAtivo = await this.estadoAtivoService.counterEstados(
      payload.ativo,
    );
    this.server
      .to(salaAtivo(payload.ativo))
      .emit('estadoContador', contadorAtivo);

    // Contador geral (supervisão)
    const contadorGeral = await this.estadoAtivoService.counterEstados();
    this.server.to(SALA_SUPERVISAO).emit('estadoContador', contadorGeral);

    // Histórico do próprio ativo (terminal)
    const historicoAtivo = await this.estadoAtivoService.historicoDoDiaAtual(
      payload.ativo,
    );
    this.server
      .to(salaAtivo(payload.ativo))
      .emit('historicoAtualizado', historicoAtivo);

    // Histórico de todos os ativos (supervisão)
    const historicoGeral = await this.estadoAtivoService.historicoDoDiaAtual();
    this.server.to(SALA_SUPERVISAO).emit('historicoAtualizado', historicoGeral);
  }

  /** Tempo decorrido calculado no servidor */
  @OnEvent('cronometro.tick')
  onCronometroTick(payload: CronometroTickEvent): void {
    this.server
      .to([salaAtivo(payload.ativo), SALA_SUPERVISAO])
      .emit('cronometroTick', payload);
  }
}
