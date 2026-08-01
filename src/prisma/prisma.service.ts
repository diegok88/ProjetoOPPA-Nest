import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Acao, PrismaClient } from '@/generated/prisma/client';
import { AuditoriaService } from '@/modules/auditoria/auditoria.service';
import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '@/modules/auditoria/dto/update-auditoria.dto';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(PrismaService.name);
  private auditoriaService!: AuditoriaService;
  public extended: any;

  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly moduleRef: ModuleRef,
  ) {
    const pool = new Pool({
      connectionString: String(process.env.DATABASE_URL),
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();

    this.auditoriaService = this.moduleRef.get(AuditoriaService, {
      strict: false,
    });

    const tenantContext = this.tenantContextService;

    const getAuditoriaService = () => this.auditoriaService;

    const prismaClient = this;

    this.extended = this.$extends({
      query: {
        gestor: {
          // CRIAÇÃO - create
          async create({ args, query }) {
            const user = tenantContext.getStore();
            const result = await query(args);

            if (!user) {
              return result;
            }

            const dados: CreateAuditoriaDto = {
              entidade: 'GESTOR',
              registroId: result.id!,
              acao: Acao.CREATE,
              dadosRegistrados: ExtractDataAuditoria(result),
              empresaId: user.empresa,
              registradoPorId: user.user,
            };
            console.log('Dados de auditoria:', dados);

            await getAuditoriaService().create(dados, prismaClient);

            return result;
          },
          // ATUALIZAÇÃO UNICA - update
          async update({ args, query }) {
            const user = tenantContext.getStore();
            if (!user) return query(args);

            let acao = Acao.UPDATE;
            const dataAny = args.data as any;
            if (dataAny && dataAny._auditAction) {
              acao = dataAny._auditAction;
              delete dataAny._auditAction;
            }

            const antes = await prismaClient.gestor.findUnique({
              where: args.where,
            });

            const depois = await query(args);

            const dados: UpdateAuditoriaDto = {
              entidade: 'GESTOR',
              registroId: depois.id!,
              acao: acao,
              antes: ExtractDataAuditoria(antes),
              depois: ExtractDataAuditoria(depois),
              empresaId: user!.empresa,
              registradoPorId: user!.user,
            };

            await getAuditoriaService().update(dados, prismaClient);

            return depois;
          },
          // ATUALIZAÇÃO EM LOTE - update many
          async updateMany({ args, query }) {
            const user = tenantContext.getStore();
            if (!user) return query(args);

            let acao = Acao.UPDATE;
            const dataAny = args.data as any;
            if (dataAny && dataAny._auditAction) {
              acao = dataAny._auditAction;
              delete dataAny._auditAction;
            }

            const antes = await prismaClient.gestor.findMany({
              where: args.where,
            });

            const resultado = await query(args);

            const depois = await prismaClient.gestor.findMany({
              where: args.where,
            });

            const dadosAuditoria = antes.map((itemAntes) => {
              const itemDepois = depois.find((d: any) => d.id === itemAntes.id);

              const dados: UpdateAuditoriaDto = {
                entidade: 'GESTOR',
                registroId: itemAntes.id,
                acao: acao,
                antes: ExtractDataAuditoria(itemAntes),
                depois: ExtractDataAuditoria(itemDepois),
                empresaId: user.empresa,
                registradoPorId: user.user,
              };

              return dados;
            });

            await getAuditoriaService().updateAll(dadosAuditoria, prismaClient);

            return resultado;
          },
          // REMOÇÃO UNICA - delete
          async delete({ args, query }) {
            const user = tenantContext.getStore();
            if (!user) return query(args);

            const dados = await prismaClient.gestor.findUnique({
              where: args.where,
            });

            if (!dados) {
              throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
            }

            const dadosAuditoria: CreateAuditoriaDto = {
              entidade: 'GESTOR',
              registroId: dados.id,
              acao: Acao.DELETE,
              dadosRegistrados: ExtractDataAuditoria(dados),
              empresaId: user.empresa,
              registradoPorId: user.user,
            };

            await getAuditoriaService().create(dadosAuditoria, prismaClient);

            return dados;
          },
          // REMOÇÃO EM LOTE - delete many
          async deleteMany({ args, query }) {
            const user = tenantContext.getStore();
            if (!user) return query(args);

            const dados = await prismaClient.gestor.findMany({
              where: args.where,
            });

            const resultado = await query(args);

            const dadosAuditoria: CreateAuditoriaDto[] = dados.map(
              (item: any) => ({
                entidade: 'GESTOR',
                registroId: item.id,
                acao: Acao.DELETE,
                dadosRegistrados: JSON.stringify(ExtractDataAuditoria(item)),
                empresaId: user.empresa,
                registradoPorId: user.user,
              }),
            );

            await getAuditoriaService().createAll(dadosAuditoria, prismaClient);

            return resultado;
          },
        },
      },
    });
  }

  public get client() {
    return this.extended || this;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
