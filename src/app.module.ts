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
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
  ],
})
export class AppModule {}
