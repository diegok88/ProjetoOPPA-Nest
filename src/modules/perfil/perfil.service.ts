import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { QueryUsuarioDto } from '../usuario/dto/query-usuario.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Perfil } from './entities/perfil.entity';
import { QueryPerfilFilterDto } from './dto/query-perfil.dto';

@Injectable()
export class PerfilService {
  private logger = new Logger(PerfilService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usuario: UsuarioService,
  ) {}

  // CRIAR PERFIL
  async create(createPerfilDto: CreatePerfilDto): Promise<Perfil> {
    try {
      const criar = await this.prisma.client.perfil.create({
        data: createPerfilDto,
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
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

      const listar = await this.prisma.client.perfil.findMany({
        where: condicao,
      });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  // BUSCAR PERFIL PELO ID
  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Perfil> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.perfil.findUnique({
        where: { id: id },
      });
      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONE');
      throw error;
    }
  }

  /*
    BUSCA PERFIL PELA DESCRIÇÃO:
    - busca da informações do perfil pela descrição retornando todos os dados.
    - metodo interno 
  */
  async findDescription(descricao: string): Promise<Perfil> {
    try {
      const buscar = await this.prisma.perfil.findFirst({
        where: { descricao: descricao },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONE');
      throw error;
    }
  }

  // ATUALIZAÇÃO DO PERFIL PELO ID
  async update(id: string, updatePerfilDto: UpdatePerfilDto): Promise<Perfil> {
    try {
      const atualizarPerfil = await this.prisma.$transaction(async (tx) => {
        await this.findOne(id, tx);

        const atualizar = await tx.perfil.update({
          where: { id: id },
          data: updatePerfilDto,
        });

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
  async deactive(id: string): Promise<Perfil> {
    try {
      const inativarPerfil = await this.prisma.client.$transaction(
        async (tx: any) => {
          const dadosVerificar: QueryUsuarioDto = { perfilId: id };
          const verificar = await this.usuario.findAll(dadosVerificar, tx);

          if (verificar.length > 0) {
            this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
            throw new UnauthorizedException(TYPES_NOTICES.EMPTY_LIST);
          }

          await this.findOne(id, tx);

          const inativar = await tx.perfil.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarPerfil;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  // DELETE DO PERFIL PELO ID
  async remove(id: string): Promise<Perfil> {
    try {
      const deletarPerfil = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status === true) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const deletar = await tx.perfil.delete({
            where: { id: id },
          });

          return deletar;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return deletarPerfil;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
