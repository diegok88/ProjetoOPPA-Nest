import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { BadRequestException, Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { CORS_ORIGINS } from '@/config/cors-origins';
import { WsJwtGuard } from '@/auth/guards/ws-jwt.guard';
import { WsRolesGuard } from '@/auth/guards/ws-roles.guard';
import { AuthSessionService } from '@/auth/guards/auth-session.service';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { PerfilService } from '@/modules/perfil/perfil.service';
import type { AuthUser } from '@/auth/entities/auth-user.interface';
import { SolicitacoesService } from './solicitacoes.service';
import type { SolicitacaoEvento } from './solicitacoes.service';
import { CreateSolicitacoesDto } from './dto/create-solicitacoes.dto';
import { QuerySolicitacoesFilterDto } from './dto/query-solicitacoes.dto';
import { ResponderSolicitacoesDto } from './dto/response-solicitacoes.dto';
import { ehPerfilReceptor } from './entities/query-solicitacoes.const';

const SALA_GESTAO = 'gestao:solicitacoes';

const salaUsuario = (usuarioId: string): string => `usuario:${usuarioId}`;

/** Sala do posto/máquina — é por aqui que o terminal recebe os eventos. */
const salaTag = (tagAtivoId: string): string => `tag:${tagAtivoId}`;

/* ==================== NORMALIZAÇÃO ==================== */

function extrairId(valor: unknown, campo = 'solicitação'): string {
  if (typeof valor === 'string' && valor.trim()) return valor.trim();

  if (Array.isArray(valor)) {
    throw new BadRequestException(`Identificador da ${campo} inválido`);
  }

  if (valor && typeof valor === 'object') {
    const id = (valor as { id?: unknown }).id;
    if (typeof id === 'string' && id.trim()) return id.trim();
  }

  throw new BadRequestException(`Identificador da ${campo} inválido`);
}

function extrairTexto(valor: unknown, campo: string): string | undefined {
  if (!valor || typeof valor !== 'object') return undefined;
  const bruto = (valor as Record<string, unknown>)[campo];
  return typeof bruto === 'string' && bruto.trim() ? bruto.trim() : undefined;
}

/** Tag do ativo do usuário autenticado (vinda do token). */
function tagDoUsuario(user: AuthUser | null | undefined): string | undefined {
  const bruto = (
    user as unknown as Record<string, unknown> | null | undefined
  )?.['tagAtivoId'];
  return typeof bruto === 'string' && bruto.trim() ? bruto.trim() : undefined;
}

/* ==================== PAYLOADS ==================== */

interface EscopoContadorDto {
  solicitadoId?: string;
  solicitanteId?: string;
  tagAtivoId?: string;
}

type MarcarVisualizadaPayload =
  | string[]
  | { ids: string[]; solicitadoId?: string; tagAtivoId?: string };

type CancelarPayload = string | { id: string; solicitanteId?: string };
type ReabrirPayload = string | { id: string };
type ResponderPayload = ResponderSolicitacoesDto & { solicitadoId?: string };

@WebSocketGateway({
  namespace: 'solicitacoes',
  cors: { origin: CORS_ORIGINS, credentials: true },
})
@UseGuards(WsJwtGuard, WsRolesGuard)
export class SolicitacoesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SolicitacoesGateway.name);

  constructor(
    private readonly solicitacoesService: SolicitacoesService,
    private readonly session: AuthSessionService,
    private readonly perfilService: PerfilService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.auth?.token as string | undefined;
    const user = token ? await this.session.authenticateToken(token) : null;

    if (!user) {
      this.logger.warn(`Conexão recusada: ${client.id}`);
      client.disconnect(true);
      return;
    }

    client.data.user = user;
    client.join(salaUsuario(user.userId));

    /* ---------- terminal: entra na sala da tag do ativo ---------- */
    const tagAtivoId = tagDoUsuario(user);
    if (tagAtivoId) {
      client.join(salaTag(tagAtivoId));
      this.logger.log(`Cliente ${client.id} entrou em ${salaTag(tagAtivoId)}`);
    } else {
      this.logger.warn(
        `Cliente ${client.id} (${user.userId}) sem tagAtivoId no token — ` +
          `aguardando o evento entrarNaTag.`,
      );
    }

    try {
      const perfil = await this.perfilService.findOne(user.perfil);
      if (!perfil) {
        this.logger.warn(
          `Perfil não encontrado para ${user.userId}: ${user.perfil}`,
        );
      } else {
        client.data.perfil = perfil;
        if (perfil.status !== false && ehPerfilReceptor(perfil)) {
          client.join(SALA_GESTAO);
          this.logger.log(
            `Cliente ${client.id} entrou em ${SALA_GESTAO} ` +
              `(${perfil.descricao} - ${perfil.nivel})`,
          );
        }
      }
    } catch (erro) {
      this.logger.warn(
        `Falha ao resolver perfil de ${user.userId}: ${String(erro)}`,
      );
    }

    client.emit(
      'solicitacaoContador',
      await this.solicitacoesService.contar(user.userId, tagAtivoId),
    );

    this.logger.log(
      `Cliente conectado: ${client.id} (${user.userId})` +
        (tagAtivoId ? ` | tag: ${tagAtivoId}` : ''),
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /* ==================== SALAS ==================== */

  /** O cliente declara sua tag explicitamente (reforça o que veio no token). */
  @Roles(ROLES.OPE1, ROLES.TER1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1, ROLES.DIS1)
  @SubscribeMessage('entrarNaTag')
  entrarNaTag(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: { tagAtivoId?: string },
  ) {
    const user = client.data.user as AuthUser;
    const tagAtivoId = payload?.tagAtivoId?.trim() || tagDoUsuario(user);

    if (!tagAtivoId) {
      this.logger.warn(
        `[entrarNaTag] sem tag — cliente ${client.id} (${user.userId})`,
      );
      return { entrou: false, sala: null };
    }

    client.join(salaTag(tagAtivoId));
    this.logger.log(
      `[entrarNaTag] cliente ${client.id} entrou em ${salaTag(tagAtivoId)}`,
    );

    return { entrou: true, sala: salaTag(tagAtivoId) };
  }

  /* ==================== ESCRITA ==================== */

  @Roles(ROLES.OPE1, ROLES.TER1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('createSolicitacao')
  create(@MessageBody() dto: CreateSolicitacoesDto) {
    this.logger.debug(
      `[create] tagAtivoId recebido: ${dto?.tagAtivoId ?? 'AUSENTE'}`,
    );
    return this.solicitacoesService.create(dto);
  }

  @Roles(ROLES.OPE1, ROLES.TER1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('responderSolicitacao')
  responder(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: ResponderPayload,
  ) {
    const user = client.data.user as AuthUser;
    const ator = extrairTexto(dto, 'solicitadoId') ?? user.userId;
    return this.solicitacoesService.responder(ator, dto);
  }

  @Roles(ROLES.OPE1, ROLES.TER1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('cancelarSolicitacao')
  cancelar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CancelarPayload,
  ) {
    const user = client.data.user as AuthUser;
    const id = extrairId(payload);
    const ator = extrairTexto(payload, 'solicitanteId') ?? user.userId;
    return this.solicitacoesService.cancelar(ator, id);
  }

  @Roles(ROLES.SUP1, ROLES.GER1, ROLES.ADN1)
  @SubscribeMessage('reabrirSolicitacao')
  reabrir(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReabrirPayload,
  ) {
    const user = client.data.user as AuthUser;
    const id = extrairId(payload);
    return this.solicitacoesService.reabrir(user.userId, id);
  }

  /* ==================== LEITURA ==================== */

  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1, ROLES.TER1)
  @SubscribeMessage('findAllSolicitacoes')
  findAllPagination(@MessageBody() query: QuerySolicitacoesFilterDto) {
    return this.solicitacoesService.findAllPagination(query);
  }

  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1, ROLES.TER1)
  @SubscribeMessage('listarSolicitacoes')
  findAllList(@MessageBody() query: QuerySolicitacoesFilterDto) {
    return this.solicitacoesService.findAllList(query);
  }

  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1, ROLES.TER1)
  @SubscribeMessage('findOneSolicitacao')
  findOne(@MessageBody() payload: unknown) {
    return this.solicitacoesService.findOne(extrairId(payload));
  }

  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1, ROLES.TER1)
  @SubscribeMessage('marcarSolicitacaoVisualizada')
  marcarVisualizada(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MarcarVisualizadaPayload,
  ) {
    const user = client.data.user as AuthUser;

    const brutos = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.ids)
        ? payload.ids
        : [];

    const ids = brutos
      .map((item) => {
        try {
          return extrairId(item);
        } catch {
          return null;
        }
      })
      .filter((item): item is string => !!item);

    const solicitadoId = extrairTexto(payload, 'solicitadoId') ?? user.userId;
    const tagAtivoId =
      extrairTexto(payload, 'tagAtivoId') ?? tagDoUsuario(user);

    if (ids.length === 0) return { marcadas: 0 };

    return this.solicitacoesService.marcarVisualizada(
      solicitadoId,
      ids,
      tagAtivoId,
    );
  }

  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1, ROLES.TER1)
  @SubscribeMessage('contarSolicitacoes')
  contar(
    @ConnectedSocket() client: Socket,
    @MessageBody() escopo?: EscopoContadorDto,
  ) {
    const user = client.data.user as AuthUser;
    const tagAtivoId = escopo?.tagAtivoId ?? tagDoUsuario(user);
    const alvo = escopo?.solicitadoId ?? escopo?.solicitanteId ?? user.userId;
    return this.solicitacoesService.contar(alvo, tagAtivoId);
  }

  @Roles(ROLES.OPE1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1, ROLES.TER1)
  @SubscribeMessage('listarTiposSolicitacao')
  listarTipos() {
    return this.solicitacoesService.listarTipos();
  }

  @Roles(ROLES.OPE1, ROLES.TER1, ROLES.SUP1, ROLES.GER1, ROLES.ADN1, ROLES.DIS1)
  @SubscribeMessage('listarTagsAtivoAlocadas')
  listarTagsAtivoAlocadas(@ConnectedSocket() client: Socket) {
    const user = client.data.user as AuthUser;
    return this.solicitacoesService.listarTagsAtivoAlocadas(user.userId);
  }

  /* ==================== PUSH ==================== */

  /**
   * REGRA DE OURO: cada destinatário recebe UM único evento por ação.
   *
   * O `.to()` encadeado deduplica salas DENTRO do mesmo emit. Por isso o
   * supervisor, o autor e o posto vão juntos num emit só.
   *
   *   CRIADA      -> 'solicitacaoCriada'      (destino + posto)
   *   VISUALIZADA -> 'solicitacaoVisualizada' (somente destino)
   *   demais      -> 'solicitacaoAtualizada'  (destino + posto + autor)
   *
   * `origemSupervisor` viaja junto do objeto (computed no service), e é o
   * que o terminal usa para dizer "o supervisor..." em vez de texto genérico.
   */
  @OnEvent('solicitacao.alterada')
  async onSolicitacaoAlterada(payload: SolicitacaoEvento): Promise<void> {
    const { solicitacao, acao } = payload;

    const tagAtivoId = solicitacao.tagAtivoId ?? null;

    const salaDestino = salaUsuario(solicitacao.solicitadoId);
    const salaAutor = solicitacao.solicitanteId
      ? salaUsuario(solicitacao.solicitanteId)
      : null;
    const salaPosto = tagAtivoId ? salaTag(tagAtivoId) : null;

    this.logger.log(
      `[push] ${acao} · id=${solicitacao.id} · tag=${tagAtivoId ?? 'NULL'} · ` +
        `solicitado=${solicitacao.solicitadoId} · ` +
        `solicitante=${solicitacao.solicitanteId ?? 'null'} · ` +
        `origemSupervisor=${solicitacao.origemSupervisor ?? false}`,
    );

    if (!tagAtivoId) {
      this.logger.warn(
        `[push] solicitação ${solicitacao.id} SEM tagAtivoId — ` +
          `o terminal não será notificado. Verifique o create/DTO.`,
      );
    }

    /* ---------- 1. Criação: destino + posto (é a pendente que aparece) ---------- */
    if (acao === 'CRIADA') {
      let destino = this.server.to(salaDestino);
      if (salaPosto) destino = destino.to(salaPosto);
      destino.emit('solicitacaoCriada', solicitacao);
    } else if (acao === 'VISUALIZADA') {
      /* ---------- 2. Leitura: só o dono, sem eco ao posto ---------- */
      this.server.to(salaDestino).emit('solicitacaoVisualizada', solicitacao);
    } else {
      /* ---------- 3. Resposta/cancelamento/reabertura: um único emit ---------- */
      let destino = this.server.to(salaDestino);
      if (salaPosto) destino = destino.to(salaPosto);
      if (salaAutor) destino = destino.to(salaAutor);
      destino.emit('solicitacaoAtualizada', solicitacao);
    }

    /* ---------- 4. Painel de gestão ---------- */
    this.server.to(SALA_GESTAO).emit('solicitacaoPainel', solicitacao);

    /* ---------- 5. Contadores ---------- */
    const usuarios = new Set<string>([solicitacao.solicitadoId]);
    if (solicitacao.solicitanteId) usuarios.add(solicitacao.solicitanteId);

    await Promise.all(
      [...usuarios].map(async (usuarioId) => {
        this.server
          .to(salaUsuario(usuarioId))
          .emit(
            'solicitacaoContador',
            await this.solicitacoesService.contar(usuarioId),
          );
      }),
    );

    if (tagAtivoId) {
      this.server
        .to(salaTag(tagAtivoId))
        .emit(
          'solicitacaoContador',
          await this.solicitacoesService.contar(
            solicitacao.solicitadoId,
            tagAtivoId,
          ),
        );
    }
  }
}
