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
import { plainToClass } from 'class-transformer';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '../auditoria/dto/update-auditoria.dto';
import { QueryUsuarioDto } from '../usuario/dto/query-usuario.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { ResponsePerfilDto } from './dto/response-perfil.dto';
import {
  UpdatePerfilDeactiveDto,
  UpdatePerfilDto,
} from './dto/update-perfil.dto';
import { DeletePerfilDto } from './dto/delete-perfil.dto';

@Injectable()
export class PerfilService {
  private logger = new Logger(PerfilService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usuario: UsuarioService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // CRIAR PERFIL
  async create(createPerfilDto: CreatePerfilDto): Promise<ResponsePerfilDto> {
    try {
      const criarPerfil = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId, empresaId, descricao } = createPerfilDto;
        const criar = await tx.perfil.create({
          data: { descricao: descricao },
        });

        const dados = ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'PERFIL',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.create(dadosAuditoria, tx);

        return criar;
      });

      this.logger.log(`Perfil id ${criarPerfil.id} criado com sucesso.`);
      return plainToClass(ResponsePerfilDto, criarPerfil);
    } catch (error) {
      this.logger.log(`Falha na criação do perfil.`);
      throw error;
    }
  }
  // LISTAR PERFIS
  async findAll(): Promise<ResponsePerfilDto[]> {
    try {
      const listarPerfis = await this.prisma.perfil.findMany();
      this.logger.log(`Lista de perfis gerada com sucesso.`);
      return listarPerfis.map((lista) =>
        plainToClass(ResponsePerfilDto, lista),
      );
    } catch (error) {
      this.logger.error(`Falha ao listar perfis.`);
      throw error;
    }
  }
  // BUSCAR PERFIL PELO ID
  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ResponsePerfilDto> {
    try {
      const client = tx ?? this.prisma;
      const buscarPerfil = await client.perfil.findUnique({
        where: { id: id },
      });
      if (!buscarPerfil) {
        this.logger.warn(`Perfil id ${id} não encontrado.`);
      } else {
        this.logger.log(`Busca de perfil id ${id} gerada com sucesso.`);
      }
      return plainToClass(ResponsePerfilDto, buscarPerfil);
    } catch (error) {
      this.logger.error(`Falha ao buscar perfil.`);
      throw error;
    }
  }
  // ATUALIZAÇÃO DO PERFIL PELO ID
  async update(
    id: string,
    updatePerfilDto: UpdatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    try {
      const atualizarPerfil = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId, empresaId, descricao } = updatePerfilDto;

        const buscar = await this.findOne(id, tx);

        const antes = ExtractDataAuditoria(buscar);

        const atualizar = await tx.perfil.update({
          where: { id: id },
          data: { descricao: descricao },
        });

        if (!atualizar) {
          this.logger.warn(`Perfil id ${id} não encontrado.`);
          throw new NotFoundException();
        }

        const depois = ExtractDataAuditoria(atualizar);

        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'PERFIL',
          registroId: id,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.update(dadosAuditoria, tx);

        return atualizar;
      });

      this.logger.log(
        `Perfil id ${atualizarPerfil.id} atualizado com sucesso.`,
      );

      return plainToClass(ResponsePerfilDto, atualizarPerfil);
    } catch (error) {
      this.logger.error(`Falha ao atualizar o perfil.`);
      throw error;
    }
  }
  // INATIVAÇÃO DO PERFIL PELO ID
  async deactive(
    id: string,
    updatePerfilDeactiveDto: UpdatePerfilDeactiveDto,
  ): Promise<ResponsePerfilDto> {
    try {
      const inativarPerfil = await this.prisma.$transaction(async (tx) => {
        const dadosVerificar: QueryUsuarioDto = {
          perfilId: id,
          campos: 'perfilId',
        };

        const verificar = await this.usuario.findAll(dadosVerificar, tx);
        this.logger.debug(
          `Total de registros de usuários com o perfil é de ${verificar.length}.`,
        );

        if (verificar.length > 0) {
          this.logger.warn(
            `Perfil id ${id} não pode ser inativado, pois possui usuários relacionados.`,
          );
          throw new UnauthorizedException();
        }

        const { registradoPorId, empresaId } = updatePerfilDeactiveDto;

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
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.update(dadosAuditoria, tx);

        return inativar;
      });

      this.logger.log(`Perfil id ${id} inativado com sucesso.`);
      return plainToClass(ResponsePerfilDto, inativarPerfil);
    } catch (error) {
      this.logger.error(`Falha ao inativar o perfil`);
      throw error;
    }
  }
  // DELETE DO PERFIL PELO ID
  async remove(
    id: string,
    deletePerfilDto: DeletePerfilDto,
  ): Promise<ResponsePerfilDto> {
    try {
      const deletarPerfil = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId, empresaId } = deletePerfilDto;

        const verificar = await this.findOne(id, tx);

        const dados = ExtractDataAuditoria(verificar);

        if (verificar.status === true) {
          this.logger.warn(
            `Perfil id ${id} não pode ser deletado, pois esta ativo.`,
          );
          throw new UnauthorizedException();
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
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.create(dadosAuditoria, tx);

        return deletar;
      });

      this.logger.log(`Perfil id ${id} deletado com sucesso.`);

      return plainToClass(ResponsePerfilDto, deletarPerfil);
    } catch (error) {
      throw error;
    }
  }
}
