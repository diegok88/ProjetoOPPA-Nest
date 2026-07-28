import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
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
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { DeleteContadorCrachaDto } from '../contador-cracha/dto/delete-contador-cracha.dto';
import { UpdateContadorCrachaDto } from '../contador-cracha/dto/update-contador-cracha.dto';
import { DeleteUsuarioDto } from '../usuario/dto/delete-usuario.dto';
import { UpdateUsuarioDeactiveDto } from '../usuario/dto/update-usuario.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { DeleteEmpresaDto } from './dto/delete-empresa';
import { QueryEmpresaFilterDto } from './dto/query-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import {
  UpdateEmpresaDeactiveDto,
  UpdateEmpresaDto,
} from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';

@Injectable()
export class EmpresaService {
  private logger = new Logger(EmpresaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
    private readonly usuario: UsuarioService,
    private readonly contadorCracha: ContadorCrachaService,
  ) {}

  // SERVIÇO CRIAR EMPRESA
  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    try {
      const criarEmpresa = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId, ...dadosEmpresa } = createEmpresaDto;
        const criar = await tx.empresa.create({
          data: dadosEmpresa,
        });
        const dados = ExtractDataAuditoria(criar);
        const dadosCriarContador = {
          empresaId: criar.id,
          contador: 0,
          registradoPorId: createEmpresaDto.registradoPorId,
        };
        await this.contadorCracha.create(dadosCriarContador, tx);
        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'EMPRESA',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: criar.id,
          registradoPorId: registradoPorId,
        };
        await this.auditoria.create(dadosAuditoria, tx);
        return criar;
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criarEmpresa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }
  // SERVIÇO LISTAR EMPRESAS
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
  // SERVIÇO DE BUSCA DE EMPRESA POR ID
  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Empresa> {
    try {
      const client = tx ?? this.prisma;
      const buscar = await client.empresa.findUnique({
        where: { id: id },
      });
      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException();
      }
      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONE');
      throw error;
    }
  }
  // SERVIÇO DE ATUALIZAÇÃO PELO ID
  async update(
    id: string,
    usuarioId: string,
    updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<Empresa> {
    try {
      const atualizarEmpresa = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId, ...dadosEmpresa } = updateEmpresaDto;
        const buscarUsuario = await this.usuario.findOne(registradoPorId, tx);
        if (id !== buscarUsuario.empresaId) {
          this.logger.warn(
            `Usuario id ${buscarUsuario.id} não pertence a está empresa.`,
          );
          throw new UnauthorizedException(
            `Usuario id ${buscarUsuario.id} não pertence a está empresa.`,
          );
        }

        const buscarEmpresa = await this.findOne(id, tx);
        const antes = await ExtractDataAuditoria(buscarEmpresa);

        const atualizarEmpresa = await tx.empresa.update({
          where: { id: id },
          data: dadosEmpresa,
        });
        const depois = ExtractDataAuditoria(atualizarEmpresa);

        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'EMPRESA',
          registroId: id,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: id,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.update(dadosAuditoria, tx);

        return atualizarEmpresa;
      });

      this.logger.log(
        `Atualização da empresa id ${atualizarEmpresa.id} realizada com sucesso.`,
      );
      return plainToClass(ResponseEmpresaDto, atualizarEmpresa);
    } catch (error) {
      this.logger.error(`Falha ao atualizar a empresa.`);
      throw error;
    }
  }
  // INATIVAR EMPRESA PELO ID
  async deactive(
    id: string,
    updateEmpresaDeactiveDto: UpdateEmpresaDeactiveDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const inativarEmpresa = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId } = updateEmpresaDeactiveDto;

        const buscarEmpresa = await this.findOne(id, tx);

        const antes = ExtractDataAuditoria(buscarEmpresa);

        const inativarEmpresa = await tx.empresa.update({
          where: { id: id },
          data: { status: false },
        });

        const depois = ExtractDataAuditoria(inativarEmpresa);

        const dadosAtualizados: UpdateAuditoriaDto = {
          entidade: 'EMPRESA',
          registroId: id,
          acao: Acao.DEACTIVATE,
          antes: antes,
          depois: depois,
          empresaId: id,
          registradoPorId: registradoPorId,
        };

        const inativarContador: UpdateContadorCrachaDto = {
          empresaId: id,
          registradoPorId: updateEmpresaDeactiveDto.registradoPorId,
        };

        await this.contadorCracha.deactive(inativarContador, tx);

        const inativarUsuario: UpdateUsuarioDeactiveDto = {
          empresaId: id,
          registradoPorId: updateEmpresaDeactiveDto.registradoPorId,
        };
        await this.usuario.deactiveAll(inativarUsuario, tx);

        await this.auditoria.update(dadosAtualizados, tx);

        return inativarEmpresa;
      });
      this.logger.log(
        `Inativação da empresa id ${inativarEmpresa.id} realizada com sucesso.`,
      );
      return plainToClass(ResponseEmpresaDto, inativarEmpresa);
    } catch (error) {
      this.logger.error(`Falha ao inativar a empresa.`);
      throw error;
    }
  }
  // DELETAR EMPRESA PELO ID
  async remove(
    id: string,
    deleteEmpresaDto: DeleteEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const deletarEmpresa = this.prisma.$transaction(async (tx) => {
        const { registradoPorId, empresaId } = deleteEmpresaDto;

        const contadorCracha: DeleteContadorCrachaDto = {
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };
        await this.contadorCracha.remove(contadorCracha, tx);

        const usuario: DeleteUsuarioDto = {
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };
        await this.usuario.removeAll(usuario);

        const buscar = await this.findOne(id, tx);
        const dados = ExtractDataAuditoria(buscar);

        const deletar = await tx.empresa.delete({
          where: { id: id },
        });

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'EMPRESA',
          registroId: 'id',
          acao: Acao.DELETE,
          dadosRegistrados: dados,
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };
        await this.auditoria.create(dadosAuditoria, tx);

        return deletar;
      });
      this.logger.log(`Delete da empresa id ${id} realizada com sucesso.`);
      return plainToClass(ResponseEmpresaDto, deletarEmpresa);
    } catch (error) {
      this.logger.error(`Falha ao deletar a empresa.`);
      throw error;
    }
  }
}
