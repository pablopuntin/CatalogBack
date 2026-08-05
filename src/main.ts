import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //PREFIJO API PARA TODA LA APLICACION
  app.setGlobalPrefix('api');

 app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Backend Starter')
    .setDescription('API del Backend Starter')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://192.168.1.105:3000',  // tu IP local para pruebas desde celular
    'https://catalogo-brown-sigma.vercel.app',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);  


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
