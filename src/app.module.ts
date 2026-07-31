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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
  ],
})
export class AppModule {}
