import {
  BadRequestException,
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { CORS_ORIGINS } from './config/cors-origins';

async function bootstrap(): Promise<void> {
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);
  // CONTROLA A ENTRADA DE DADOS DA REQUISIÇÃO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          Object.values(error.constraints || {}),
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
  //cabeçalhos HTTP de segurança a aplicações web.
  app.use(helmet());
  // EXTRAI OS DADOS DO COOKIE
  app.use(cookieParser());
  // CONTROLA A PORTA DE ACESSO
  app.enableCors({
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // adicionados
    allowedHeaders: ['Content-Type', 'Authorization'], // adicionados
  });
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Backend rodando em <http://localhost>:${port}`);
  logger.log(`🔌 WebSocket disponível em ws://localhost:${port}/estado-ativo`);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error('Falha ao iniciar a aplicação', error);
  process.exit(1);
});

/*
- adicionado:
app.use(helmet());
bootstrap().catch((error) => {
  new Logger('Bootstrap').error('Falha ao iniciar a aplicação', error);
  process.exit(1);
});
- alterado:
async function bootstrap(){}
const messages = errors.map((error) =>
  Object.values(error.constraints || {}).join(', '),
);
*/
