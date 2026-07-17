import {
  BadRequestException,
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);
  // CONTROLA A ENTRADA DE DADOS DA REQUISIÇÃO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        logger.error(messages);
        return new BadRequestException(messages);
      },
    }),
  );
  // CONTROLA A SAIDA DE DADOS
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll', // Exclui tudo, só expõe com @Expose
    }),
  );
  app.enableCors({
    origin: 'http://localhost:4200',
    Credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
