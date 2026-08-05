import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { GestorService } from '../gestor/gestor.service';
import { QueryUsuarioDto } from '../usuario/dto/query-usuario.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { QueryEmpresaFilterDto } from './dto/query-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';

@Injectable()
export class EmpresaService {
  private logger = new Logger(EmpresaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usuario: UsuarioService,
    private readonly gestor: GestorService,
    private readonly contadorCracha: ContadorCrachaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /*
  SERVIÇO CRIAR EMPRESA:
  - serviço de cadastro de empresa.
  - vinculado a criação de contador de cracha.
  */
  async create(create: CreateEmpresaDto): Promise<Empresa> {
    try {
      const criarEmpresa = await this.prisma.client.$transaction(async (tx) => {
        const criar = await tx.empresa.create({
          data: create,
        });
        const dadosCriarContador = {
          empresaId: criar.id,
          contador: 0,
        };
        await this.contadorCracha.create(dadosCriarContador, tx);

        return criar;
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criarEmpresa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }
  /*
  SERVIÇO LISTAR EMPRESAS
  */
  async findAll(query: QueryEmpresaFilterDto): Promise<Empresa[]> {
    try {
      const condicao: Prisma.EmpresaWhereInput = {};
      if (query.codigo) condicao.codigo = query.codigo;
      if (query.bairro) condicao.bairro = query.bairro;
      if (query.cep) condicao.cep = query.cep;
      if (query.cidade) condicao.cidade = query.cidade;
      if (query.cnpj) condicao.cnpj = query.cnpj;
      if (query.contato) condicao.contato = query.contato;
      if (query.email) condicao.email = query.email;
      if (query.estado) condicao.estado = query.estado;
      if (query.nomeFantasia) condicao.nomeFantasia = query.nomeFantasia;
      if (query.numero) condicao.numero = query.numero;
      if (query.razaoSocial) condicao.razaoSocial = query.razaoSocial;
      if (query.rua) condicao.rua = query.rua;

      const listarEmpresas = await this.prisma.empresa.findMany({
        where: condicao,
      });
      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listarEmpresas;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }
  /*
  SERVIÇO DE BUSCA DE EMPRESA POR ID
  */
  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Empresa> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.empresa.findUnique({
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
  SERVIÇO DE BUSCA DE EMPRESA:
  - busca da empresa de acordo com os paramentros de filtro.
  - serviço interno
  */
  async findEnterpriceOne(
    query: QueryEmpresaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Empresa> {
    try {
      const client = tx ?? this.prisma;

      const condicao: Prisma.EmpresaWhereInput = {};
      if (query.codigo) condicao.codigo = query.codigo;
      if (query.bairro) condicao.bairro = query.bairro;
      if (query.cep) condicao.cep = query.cep;
      if (query.cidade) condicao.cidade = query.cidade;
      if (query.cnpj) condicao.cnpj = query.cnpj;
      if (query.contato) condicao.contato = query.contato;
      if (query.email) condicao.email = query.email;
      if (query.estado) condicao.estado = query.estado;
      if (query.nomeFantasia) condicao.nomeFantasia = query.nomeFantasia;
      if (query.numero) condicao.numero = query.numero;
      if (query.razaoSocial) condicao.razaoSocial = query.razaoSocial;
      if (query.rua) condicao.rua = query.rua;

      const buscar = await client.empresa.findFirst({
        where: condicao,
        take: 1,
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findEnterpriceOne');
      throw error;
    }
  }
  /*
  ATUALIZAÇÃO DA EMPRESA PELO ID:
  - atualiza os dados da empresa.
  - bloqueia o registro ate a finalização da transação.
  */
  async update(
    id: string,
    updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<Empresa> {
    try {
      const atualizarEmpresa = await this.prisma.client.$transaction(
        async (tx: any) => {
          const usuario = this.tenantContext.getStore()!;
          const buscarUsuario = await this.usuario.findOne(usuario.user, tx);
          if (id !== buscarUsuario.empresaId) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          await this.findOne(id, tx);

          const atualizar = await tx.empresa.update({
            where: { id: id },
            data: updateEmpresaDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarEmpresa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }
  /*
  INATIVAR EMPRESA PELO ID:
  - serviço de inativação.
  - vinculado com contador de cracha, gestor e usuario.
  */
  async deactive(id: string): Promise<Empresa> {
    try {
      const inativarEmpresa = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const consultarUsuario: QueryUsuarioDto = { empresaId: id };
          const listarUsuario = await this.usuario.findAll(
            consultarUsuario,
            tx,
          );
          const ids = listarUsuario.map((usuario) => usuario.id);

          await this.contadorCracha.deactive(id, tx);

          if (listarUsuario.length > 0) {
            await this.gestor.deactiveAll(ids, tx);
            await this.usuario.deactiveAll(ids, tx);
          }

          const inativar = await tx.empresa.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );
      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarEmpresa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }
  // DELETAR EMPRESA PELO ID
  async remove(id: string): Promise<Empresa> {
    try {
      const deletarEmpresa = this.prisma.client.$transaction(async (tx) => {
        const consultarUsuario: QueryUsuarioDto = { empresaId: id };
        const listarUsuario = await this.usuario.findAll(consultarUsuario, tx);
        const ids = listarUsuario.map((usuario) => usuario.id);

        await this.contadorCracha.remove(id, tx);

        if (listarUsuario.length > 0) {
          await this.gestor.removeAll(ids, tx);
          await this.usuario.removeAll(ids, tx);
        }

        await this.findOne(id, tx);

        const deletar = await tx.empresa.delete({
          where: { id: id },
        });

        return deletar;
      });

      this.logger.log(TYPES_NOTICES.DELETE);
      return deletarEmpresa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
