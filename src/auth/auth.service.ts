import { Acao } from '@/generated/prisma/enums';
import { AuditoriaService } from '@/modules/auditoria/auditoria.service';
import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';
import { QueryEmpresaFilterDto } from '@/modules/empresa/dto/query-empresa.dto';
import { EmpresaService } from '@/modules/empresa/empresa.service';
import { UsuarioService } from '@/modules/usuario/usuario.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  ResponseAuthDto,
  ResponseUsuarioAutenticar,
} from './dto/response-auth.dto';
import { Auth } from './entities/auth.entity';
import {
  QueryBagdeEnterpriceDto,
  QueryUsuarioFilterDto,
} from '@/modules/usuario/dto/query-usuario.dto';
import { GenerateTokenService } from './jwt-generate-token/jwt-generate-token.service';
import {
  AutenticarAcaoDto,
  LoginColaboradorDto,
  LoginTagAtivoDto,
} from './dto/create-auth.dto';
import { AuthUser } from './entities/auth-user.interface';

const MENSAGEM_CREDENCIAIS_INVALIDAS = 'Credenciais inválidas.';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly usuario: UsuarioService,
    private readonly empresa: EmpresaService,
    private readonly auditoria: AuditoriaService,
    private readonly generateToken: GenerateTokenService,
  ) {}

  // OBTER O PERFIL - criar entidade usuario para tipar o retorno -
  async findProfile(id: string): Promise<ResponseAuthDto> {
    const usuario = await this.usuario.findOne(id);
    if (!usuario) throw new UnauthorizedException();
    return plainToClass(ResponseAuthDto, usuario);
  }

  // LOGIN DO USUARIO COLABORADOR
  login(dto: LoginColaboradorDto): Promise<string> {
    return this.autenticar(dto.codEmpresa, { cracha: dto.cracha }, dto.senha);
  }

  // LOGIN DO USUARIO DISPOSITIVO
  loginTag(dto: LoginTagAtivoDto): Promise<string> {
    return this.autenticar(dto.codEmpresa, { codigo: dto.codigo }, dto.senha);
  }

  // FUNÇÃO DE AUTENTICAÇÃO DOS DOIS LOGINS
  private async autenticar(
    codEmpresa: number,
    identificador: Pick<QueryUsuarioFilterDto, 'cracha' | 'codigo'>,
    senha: string,
  ): Promise<string> {
    const empresaFiltro: QueryEmpresaFilterDto = { codigo: codEmpresa };
    const empresa = await this.empresa.findEnterpriceOne(empresaFiltro);

    const usuario = await this.usuario.findOneBadgeAndEnterprice({
      ...identificador,
      empresaId: empresa.id,
    });

    if (!usuario) {
      this.logger.warn('Tentativa de login com credenciais inválidas.');
      throw new UnauthorizedException(MENSAGEM_CREDENCIAIS_INVALIDAS);
    }

    const senhaValida = await this.usuario.compareHash(senha, usuario.senha);
    if (!senhaValida) {
      this.logger.warn('Tentativa de login com credenciais inválidas.');
      throw new UnauthorizedException(MENSAGEM_CREDENCIAIS_INVALIDAS);
    }

    if (!usuario.perfilId || !usuario.empresaId) {
      this.logger.warn('Usuário sem perfil ou empresa vinculados.');
      throw new UnauthorizedException(MENSAGEM_CREDENCIAIS_INVALIDAS);
    }

    const dadosToken: Auth = {
      userId: usuario.id,
      perfil: usuario.perfilId,
      empresa: usuario.empresaId,
      versaoToken: usuario.versaoToken,
    };
    const token = await this.generateToken.generateToken(dadosToken);

    const dadosAuditoria: CreateAuditoriaDto = {
      entidade: 'AUTH',
      registroId: usuario.id,
      acao: Acao.LOGIN,
      dadosRegistrados: JSON.stringify({
        perfil: usuario.perfilId,
        empresa: usuario.empresaId,
      }),
      empresaId: usuario.empresaId,
      registradoPorId: usuario.id,
    };
    await this.auditoria.create(dadosAuditoria);

    this.logger.log('Login realizado com sucesso.');
    return token;
  }

  // LOGOUT DO USUARIO TODOS
  async logout(usuario: AuthUser): Promise<void> {
    const atual = await this.usuario.findOne(usuario.userId);
    if (!atual) throw new UnauthorizedException();

    await this.usuario.incrementarVersaoToken(atual.id, atual.versaoToken);

    const dadosAuditoria: CreateAuditoriaDto = {
      entidade: 'AUTH',
      registroId: atual.id,
      acao: Acao.LOGOUT,
      dadosRegistrados: JSON.stringify({
        perfil: usuario.perfil,
        empresa: usuario.empresa,
      }),
      empresaId: usuario.empresa,
      registradoPorId: usuario.userId,
    };
    await this.auditoria.create(dadosAuditoria);
    this.logger.log(TYPES_NOTICES.LOGOUT);
  }

  async authenticateAction(
    dto: AutenticarAcaoDto,
  ): Promise<ResponseUsuarioAutenticar> {
    const { cracha, pin, empresaId } = dto;
    const query = {
      cracha: cracha,
      empresaId: empresaId,
    } as QueryBagdeEnterpriceDto;
    const usuario = await this.usuario.findOneBadgeAndEnterprice(query);
    const pinValida = await this.usuario.compareHash(pin, usuario.pin);
    if (!pinValida) {
      this.logger.warn('Tentativa de autenticação com credenciais inválidas.');
      throw new UnauthorizedException(MENSAGEM_CREDENCIAIS_INVALIDAS);
    }
    const usuarioAutenticado = {
      id: usuario.id,
      cracha: usuario.cracha!,
      perfil: usuario.perfil?.descricao!,
    };
    //this.logger.debug(usuarioAutenticado);
    return usuarioAutenticado;
  }
}
