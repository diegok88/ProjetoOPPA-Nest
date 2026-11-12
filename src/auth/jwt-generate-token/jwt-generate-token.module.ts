import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GenerateTokenService } from './jwt-generate-token.service';
import { jwtAsyncOptions } from './jwt.config';

@Module({
  imports: [JwtModule.registerAsync(jwtAsyncOptions)],
  providers: [GenerateTokenService],
  exports: [GenerateTokenService, JwtModule],
})
export class GenerateTokenModule {}

/*
- alterado:
JwtModule.register({
  secret: process.env.JWT_SECRET ?? 'projeto_oppa',
  signOptions: { expiresIn: '1d' },
}),
*/
