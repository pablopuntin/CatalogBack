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

  // const config = new DocumentBuilder()
  //   .setTitle('Backend Starter')
  //   .setDescription('API del Backend Starter')
  //   .setVersion('1.0.0')
  //   .addBearerAuth()
  //   .build();

  const config = new DocumentBuilder()
  .setTitle('Backend Starter')
  .setDescription('API del Backend Starter')
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'JWT',
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);  


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
