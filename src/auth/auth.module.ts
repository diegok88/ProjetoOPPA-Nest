import { AuditoriaModule } from '@/modules/auditoria/auditoria.module';
import { PerfilModule } from '@/modules/perfil/perfil.module';
import { UsuarioModule } from '@/modules/usuario/usuario.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategyService } from './strategies/jwt.strategy.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'projeto_oppa',
      signOptions: { expiresIn: '1d' },
    }),
    UsuarioModule,
    AuditoriaModule,
    PerfilModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategyService],
  exports: [AuthService],
})
export class AuthModule {}
