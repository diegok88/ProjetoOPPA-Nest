import { Injectable, Logger } from '@nestjs/common';
import { CreateGestorDto } from './dto/create-gestor.dto';
import { UpdateGestorDto } from './dto/update-gestor.dto';
import { Gestor } from './entities/gestor.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Auth } from '@/auth/entities/auth.entity';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';
import { Acao } from '@/generated/prisma/enums';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class GestorService {
  private logger = new Logger(GestorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async create(
    id: string,
    autenticado: Auth,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const criar = await client.gestor.create({
          data: {
            colaboradorId: id,
            gestorId: autenticado.userId,
          },
        });

        const dados = ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'GESTOR',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.create(dadosAuditoria, client);

        return criar;
      };

      let criarGestor: any;
      if (tx) {
        criarGestor = await executar(tx);
      } else {
        criarGestor = await this.prisma.$transaction(async (novatx) => {
          return executar(novatx);
        });
      }

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarGestor;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - create');
      throw error;
    }
  }

  findAll() {
    return `This action returns all gestor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gestor`;
  }

  update(id: number, updateGestorDto: UpdateGestorDto) {
    return `This action updates a #${id} gestor`;
  }

  remove(id: number) {
    return `This action removes a #${id} gestor`;
  }
}
