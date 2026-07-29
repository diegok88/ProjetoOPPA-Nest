import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '../auditoria/dto/update-auditoria.dto';
import { QueryUsuarioDto } from '../usuario/dto/query-usuario.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { Auth } from '@/auth/entities/auth.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Perfil } from './entities/perfil.entity';
import { QueryPerfilFilterDto } from './dto/query-perfil.dto';

@Injectable()
export class PerfilService {
  private logger = new Logger(PerfilService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usuario: UsuarioService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // CRIAR PERFIL
  async create(
    autenticado: Auth,
    createPerfilDto: CreatePerfilDto,
  ): Promise<Perfil> {
    try {
      const criarPerfil = await this.prisma.$transaction(async (tx) => {
        const { userId, empresa } = autenticado;
        const criar = await tx.perfil.create({
          data: createPerfilDto,
        });

        const dados = ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'PERFIL',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: empresa,
          registradoPorId: userId,
        };

        await this.auditoria.create(dadosAuditoria, tx);

        return criar;
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarPerfil;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  // LISTAR PERFIS
  async findAll(query: QueryPerfilFilterDto): Promise<Perfil[]> {
    try {
      const condicao: Prisma.PerfilWhereInput = {};
      if (query.codigo) condicao.codigo = query.codigo;
      if (query.descricao) condicao.descricao = query.descricao;
      if (query.status) condicao.status = query.status;

      const listarPerfis = await this.prisma.perfil.findMany({
        where: condicao,
      });

      if (listarPerfis.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listarPerfis;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  // BUSCAR PERFIL PELO ID
  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Perfil> {
    try {
      const client = tx ?? this.prisma;
      const buscarPerfil = await client.perfil.findUnique({
        where: { id: id },
      });
      if (!buscarPerfil) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscarPerfil;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONE');
      throw error;
    }
  }
  // ATUALIZAÇÃO DO PERFIL PELO ID
  async update(
    id: string,
    autenticado: Auth,
    updatePerfilDto: UpdatePerfilDto,
  ): Promise<Perfil> {
    try {
      const atualizarPerfil = await this.prisma.$transaction(async (tx) => {
        const buscar = await this.findOne(id, tx);

        const antes = ExtractDataAuditoria(buscar);

        const atualizar = await tx.perfil.update({
          where: { id: id },
          data: updatePerfilDto,
        });

        if (!atualizar) {
          this.logger.warn(TYPES_NOTICES.NOT_FOUND);
          throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
        }

        const depois = ExtractDataAuditoria(atualizar);

        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'PERFIL',
          registroId: id,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.update(dadosAuditoria, tx);

        return atualizar;
      });

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarPerfil;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }
  // INATIVAÇÃO DO PERFIL PELO ID
  async deactive(id: string, autenticado: Auth): Promise<Perfil> {
    try {
      const inativarPerfil = await this.prisma.$transaction(async (tx) => {
        const dadosVerificar: QueryUsuarioDto = {
          perfilId: id,
          campos: 'perfilId',
        };

        const verificar = await this.usuario.findAll(dadosVerificar, tx);

        if (verificar.length > 0) {
          this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
          throw new UnauthorizedException(TYPES_NOTICES.EMPTY_LIST);
        }

        const buscar = await this.findOne(id, tx);

        const antes = ExtractDataAuditoria(buscar);

        const inativar = await tx.perfil.update({
          where: { id: id },
          data: { status: false },
        });

        if (!inativar) {
          this.logger.warn(`Perfil id ${id} não foi encontrado.`);
          throw new NotFoundException();
        }

        const depois = ExtractDataAuditoria(inativar);

        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'PERFIL',
          registroId: id,
          acao: Acao.DEACTIVATE,
          antes: antes,
          depois: depois,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.update(dadosAuditoria, tx);

        return inativar;
      });

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarPerfil;
    } catch (error) {
      this.logger.error(`Falha ao inativar o perfil`);
      throw error;
    }
  }
  // DELETE DO PERFIL PELO ID
  async remove(id: string, autenticado: Auth): Promise<Perfil> {
    try {
      const deletarPerfil = await this.prisma.$transaction(async (tx) => {
        const verificar = await this.findOne(id, tx);

        const dados = ExtractDataAuditoria(verificar);

        if (verificar.status === true) {
          this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
          throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
        }

        const deletar = await tx.perfil.delete({
          where: { id: id },
        });

        if (!deletarPerfil) {
          this.logger.warn(`Perfil id ${id} não encontrado.`);
        }

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'PERFIL',
          registroId: id,
          acao: Acao.DELETE,
          dadosRegistrados: dados,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.create(dadosAuditoria, tx);

        return deletar;
      });

      this.logger.log(TYPES_NOTICES.DELETE);
      return deletarPerfil;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
