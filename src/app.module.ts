import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { ContadorCrachaModule } from './modules/contador-cracha/contador-cracha.module';
import { EmpresaModule } from './modules/empresa/empresa.module';
import { GestorModule } from './modules/gestor/gestor.module';
import { PerfilModule } from './modules/perfil/perfil.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantContextModule } from './auth/tenant-context/tenant-context.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpJwtGuard } from './auth/guards/http-jwt.guard';
import { TenantContextInterceptor } from './auth/tenant-context/tenant-context.interceptor';
import { SetoresModule } from './modules/setores/setores.module';
import { CompetenciaSetorialModule } from './modules/competencia-setorial/competencia-setorial.module';
import { PenalidadesModule } from './modules/penalidades/penalidades.module';
import { DispensasModule } from './modules/dispensas/dispensas.module';
import { ControleJornadaModule } from './modules/controle-jornada/controle-jornada.module';
import { TipoSolicitacaoModule } from './modules/tipo-solicitacao/tipo-solicitacao.module';
import { OcorrenciaModule } from './modules/ocorrencia/ocorrencia.module';
import { FluxoOcorrenciaModule } from './modules/fluxo-ocorrencia/fluxo-ocorrencia.module';
import { AtivoModule } from './modules/ativo/ativo.module';
import { TagAtivoModule } from './modules/tag-ativo/tag-ativo.module';
import { CompetenciaOperacionalModule } from './modules/competencia-operacional/competencia-operacional.module';
import { FalhasModule } from './modules/falhas/falhas.module';
import { SolucoesModule } from './modules/solucoes/solucoes.module';
import { AlocacaoModule } from './modules/alocacao/alocacao.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesModule } from './schedule/schedules.module';
import { GeradorEscalaModule } from './modules/gerador-escala/gerador-escala.module';
import { EstadoAtivoModule } from './web-socket/estado-ativo/estado-ativo.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpRolesGuard } from './auth/guards/http-roles.guard';
import { GeradorTurnoModule } from './modules/gerador-turno/gerador-turno.module';
import { EficienciaOperacionalModule } from './modules/eficiencia-operacional/eficiencia-operacional.module';
import { SolicitacoesModule } from './web-socket/solicitacoes/solicitacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (env: Record<string, unknown>) => {
        if (!env.JWT_SECRET) throw new Error('JWT_SECRET não definido no .env');
        return env;
      },
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot(),
    SchedulesModule,
    TenantContextModule,
    PrismaModule,
    UsuarioModule,
    PerfilModule,
    GestorModule,
    AuditoriaModule,
    EmpresaModule,
    AuthModule,
    ContadorCrachaModule,
    SetoresModule,
    CompetenciaSetorialModule,
    PenalidadesModule,
    DispensasModule,
    ControleJornadaModule,
    TipoSolicitacaoModule,
    OcorrenciaModule,
    FluxoOcorrenciaModule,
    AtivoModule,
    TagAtivoModule,
    CompetenciaOperacionalModule,
    FalhasModule,
    SolucoesModule,
    AlocacaoModule,
    GeradorEscalaModule,
    EstadoAtivoModule,
    GeradorTurnoModule,
    EficienciaOperacionalModule,
    SolicitacoesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: HttpJwtGuard },
    { provide: APP_GUARD, useClass: HttpRolesGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
  ],
})
export class AppModule {}

/*
- adicionado:
{ provide: APP_GUARD, useClass: HttpRolesGuard },
validate: (env: Record<string, unknown>) => {
  if (!env.JWT_SECRET) throw new Error('JWT_SECRET não definido no .env');
  return env;
},
*/
