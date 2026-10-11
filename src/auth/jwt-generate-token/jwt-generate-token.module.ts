import { Module } from '@nestjs/common';
import { GenerateTokenService } from './jwt-generate-token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'projeto_oppa',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [GenerateTokenService],
  exports: [GenerateTokenService],
})
export class GenerateTokenModule {}
