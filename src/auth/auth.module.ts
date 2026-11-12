import { AuditoriaModule } from '@/modules/auditoria/auditoria.module';
import { EmpresaModule } from '@/modules/empresa/empresa.module';
import { PerfilModule } from '@/modules/perfil/perfil.module';
import { UsuarioModule } from '@/modules/usuario/usuario.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategyService } from './strategies/jwt.strategy.service';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { GenerateTokenModule } from './jwt-generate-token/jwt-generate-token.module';
import { AuthSessionService } from './guards/auth-session.service';

@Module({
  imports: [
    PassportModule,
    GenerateTokenModule,
    TenantContextModule,
    UsuarioModule,
    EmpresaModule,
    AuditoriaModule,
    PerfilModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategyService, AuthSessionService],
  exports: [AuthService, AuthSessionService],
})
export class AuthModule {}
