import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Acao, PrismaClient } from '@/generated/prisma/client';
import { AuditoriaService } from '@/modules/auditoria/auditoria.service';
import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '@/modules/auditoria/dto/update-auditoria.dto';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Injectable,
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

  public get client() {
    return this.extended || this;
  }

  async onModuleInit() {
    await this.$connect();

    this.auditoriaService = this.moduleRef.get(AuditoriaService, {
      strict: false,
    });

    const tenantContext = this.tenantContextService;
    const getAuditoriaService = () => this.auditoriaService;
    const prismaClient = this;

    /* 
    MODELOS QUE SERÃO PERMITIDOS SEREM AUDITADOS. 
    - constante que determina quais modelos podem sofrer auditoria.
    */
    const MODELOS_AUDITADOS = [
      'Usuario',
      'Gestor',
      'Empresa',
      'ContadorDeCracha',
      'Perfil',
    ];

    this.extended = this.$extends({
      query: {
        $allModels: {
          // CRIAÇÃO - create
          async create({ model, args, query }) {
            const modeloNome = model.toLowerCase();
            const usuario = tenantContext.getStore();
            const resultado = await query(args);

            if (!usuario) return resultado;
            if (!MODELOS_AUDITADOS.includes(modeloNome)) return resultado;

            const dados: CreateAuditoriaDto = {
              entidade: modeloNome.toUpperCase(),
              registroId: resultado.id!,
              acao: Acao.CREATE,
              dadosRegistrados: JSON.stringify(ExtractDataAuditoria(resultado)),
              empresaId: usuario.empresa,
              registradoPorId: usuario.user,
            };

            await getAuditoriaService().create(dados, prismaClient);
            return resultado;
          },
          // ATUALIZAÇÃO UNICA - update
          async update({ model, args, query }) {
            const modeloNome = model.toLowerCase();
            const user = tenantContext.getStore()!;

            let acao = Acao.UPDATE;
            const dataAny = args.data as any;
            if (dataAny && dataAny._auditAction) {
              acao = dataAny._auditAction;
              delete dataAny._auditAction;
            }

            const resultado = await query(args);
            if (!user) return resultado;
            if (!MODELOS_AUDITADOS.includes(modeloNome)) return resultado;

            const antes = await this[model].findUnique({
              where: args.where,
            });

            const depois = await query(args);

            const dados: UpdateAuditoriaDto = {
              entidade: modeloNome.toUpperCase(),
              registroId: depois.id!,
              acao: acao,
              antes: ExtractDataAuditoria(antes),
              depois: ExtractDataAuditoria(depois),
              empresaId: user.empresa,
              registradoPorId: user.user,
            };

            await getAuditoriaService().update(dados, prismaClient);

            return resultado;
          },
          // ATUALIZAÇÃO EM LOTE - update many
          async updateMany({ model, args, query }) {
            const modeloNome = model.toLowerCase();
            const user = tenantContext.getStore();

            let acao = Acao.UPDATE;
            const dataAny = args.data as any;
            if (dataAny && dataAny._auditAction) {
              acao = dataAny._auditAction;
              delete dataAny._auditAction;
            }

            const antes = await this[model].findMany({
              where: args.where,
            });

            const resultado = await query(args);
            if (!user) return resultado;
            if (!MODELOS_AUDITADOS.includes(modeloNome)) return resultado;

            const depois = await this[model].findMany({
              where: args.where,
            });

            const dadosAuditoria = antes.map((itemAntes: any) => {
              const itemDepois = depois.find((d: any) => d.id === itemAntes.id);
              const dados: UpdateAuditoriaDto = {
                entidade: modeloNome.toUpperCase(),
                registroId: itemAntes.id,
                acao: acao,
                antes: ExtractDataAuditoria(itemAntes),
                depois: ExtractDataAuditoria(itemDepois),
                empresaId: user.empresa,
                registradoPorId: user.user,
              };
              return dados;
            });
            console.log(dadosAuditoria);
            await getAuditoriaService().updateAll(dadosAuditoria, prismaClient);

            return resultado;
          },
          // REMOÇÃO UNICA - delete
          async delete({ model, args, query }) {
            const modeloNome = model.toLowerCase();
            const user = tenantContext.getStore();
            const resultado = await query(args);

            if (!user) return resultado;
            if (!MODELOS_AUDITADOS.includes(modeloNome)) return resultado;

            const dados = await this[model].findUnique({
              where: args.where,
            });

            if (!dados) {
              throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
            }

            const dadosAuditoria: CreateAuditoriaDto = {
              entidade: modeloNome.toUpperCase(),
              registroId: dados.id,
              acao: Acao.DELETE,
              dadosRegistrados: JSON.stringify(ExtractDataAuditoria(dados)),
              empresaId: user.empresa,
              registradoPorId: user.user,
            };

            await getAuditoriaService().create(dadosAuditoria, prismaClient);

            return resultado;
          },
          // REMOÇÃO EM LOTE - delete many
          async deleteMany({ model, args, query }) {
            const modeloNome = model.toLowerCase();
            const user = tenantContext.getStore();

            const dados = await this[model].findMany({
              where: args.where,
            });

            const resultado = await query(args);

            if (!user) return resultado;
            if (!MODELOS_AUDITADOS.includes(modeloNome)) return resultado;

            const dadosAuditoria: CreateAuditoriaDto[] = dados.map(
              (item: any) => ({
                entidade: modeloNome.toUpperCase(),
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

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
