import { Prisma } from '@/generated/prisma/client';
import { QueryUsuarioFilterDto } from '@/modules/usuario/dto/query-usuario.dto';
import { Usuario } from '@/modules/usuario/entities/usuario.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UsuarioOrquestradorService {
  private logger = new Logger(UsuarioOrquestradorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: QueryUsuarioFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Usuario[]> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.UsuarioWhereInput = {};
      if (query.cracha) condicao.cracha = query.cracha;
      if (query.nome) condicao.nome = query.nome;
      if (query.dataAdmissao) condicao.dataAdmissao = query.dataAdmissao;
      if (query.dataNascimento) condicao.dataNascimento = query.dataNascimento;
      if (query.dataDesligamento)
        condicao.dataDesligamento = query.dataDesligamento;
      if (query.turno) condicao.turno = query.turno;
      if (query.escala) condicao.escala = query.escala;
      if (query.empresaId) condicao.empresaId = query.empresaId;
      if (query.perfilId) condicao.perfilId = query.perfilId;
      if (query.status) condicao.status = query.status;

      const listar = await client.usuario.findMany({
        where: condicao,
      });

      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FIND-ALL');
      throw error;
    }
  }
}
