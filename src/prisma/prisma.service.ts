import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Acao, PrismaClient } from '@/generated/prisma/client';
import { AuditoriaService } from '@/modules/auditoria/auditoria.service';
import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '@/modules/auditoria/dto/update-auditoria.dto';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import {
  forwardRef,
  Inject,
  Injectable,
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
  public extended: any;
  private auditoriaService!: AuditoriaService;

  constructor(
    private readonly tenantContext: TenantContextService,
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

    const tenantContextService = this.tenantContext;

    const getAuditoriaService = () => this.auditoriaService;

    this.extended = this.$extends({
      query: {
        gestor: {
          // CRIAÇÃO - create
          async create({ args, query }) {
            const user = tenantContextService.getStore();
            const result = await query(args);

            if (!user) return result;

            const dados: CreateAuditoriaDto = {
              entidade: 'GESTOR',
              registroId: result.id!,
              acao: Acao.CREATE,
              dadosRegistrados: ExtractDataAuditoria(result),
              empresaId: user.empresa,
              registradoPorId: user.user,
            };

            await getAuditoriaService().create(dados);

            return result;
          },
          // ATUALIZAÇÃO UNICA - update
          async update({ args, query }) {
            const user = tenantContextService.getStore();

            const antes = await (this as any).gestor.findUnique({
              where: args.where,
            });

            const depois = await query(args);

            const dados: UpdateAuditoriaDto = {
              entidade: 'GESTOR',
              registroId: depois.id!,
              acao: Acao.UPDATE,
              antes: antes,
              depois: depois,
              empresaId: user!.empresa,
              registradoPorId: user!.user,
            };

            await getAuditoriaService().update(dados);

            return depois;
          },
          // ATUALIZAÇÃO EM LOTE - update many
          async updateMany({ args, query }) {
            const user = tenantContextService.getStore();

            if (!user) return query(args);

            const antes = await (this as any).gestor.findMany({
              where: args.where,
            });

            const resultado = await query(args);

            const depois = await (this as any).gestor.findMany({
              where: args.where,
            });

            const dadosAuditoria = antes.map((itemAntes: any) => {
              const itemDepois = depois.find((d: any) => d.id === itemAntes.id);

              const dados: UpdateAuditoriaDto = {
                entidade: 'GESTOR',
                registroId: itemAntes.id,
                acao: Acao.UPDATE,
                antes: ExtractDataAuditoria(itemAntes),
                depois: ExtractDataAuditoria(itemDepois),
                empresaId: user.empresa,
                registradoPorId: user.user,
              };

              return dados;
            });

            await getAuditoriaService().updateAll(dadosAuditoria, this as any);

            return resultado;
          },
          // REMOÇÃO UNICA - delete
          async delete({ args, query }) {
            const user = tenantContextService.getStore();
            if (!user) return query(args);

            const dados = await (this as any).gestor.findUnique({
              where: args.where,
            });

            const dadosAuditoria: CreateAuditoriaDto = {
              entidade: 'GESTOR',
              registroId: dados.id,
              acao: Acao.DELETE,
              dadosRegistrados: ExtractDataAuditoria(dados),
              empresaId: user.empresa,
              registradoPorId: user.user,
            };

            await getAuditoriaService().create(dadosAuditoria);

            return dados;
          },
          // REMOÇÃO EM LOTE - delete many
          async deleteMany({ args, query }) {
            const user = tenantContextService.getStore();
            if (!user) return query(args);

            const dados = await (this as any).gestor.findMany({
              where: args.where,
            });

            const resultado = await query(args);

            const dadosAuditoria: CreateAuditoriaDto[] = dados.map(
              (item: any) => ({
                entidade: 'GESTOR',
                registroId: item.id,
                acao: Acao.DELETE,
                dadosRegistrados: ExtractDataAuditoria(item),
                empresaId: user.empresa,
                registradoPorId: user.user,
              }),
            );

            await getAuditoriaService().createAll(dadosAuditoria, this as any);

            return resultado;
          },
        },
      },
    });
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
