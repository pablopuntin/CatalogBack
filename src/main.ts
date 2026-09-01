import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
     const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Render está delante de la app: sin esto req.ip es la IP del proxy
  // y el rate limiter cuenta a todos los visitantes como uno solo.
  app.set('trust proxy', 1);

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

//   app.enableCors({
//   origin: [
//     'http://localhost:3000',
//     'http://192.168.1.105:3000',  // tu IP local para pruebas desde celular
//     'https://catalogo-brown-sigma.vercel.app',
//   ],
//   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//   credentials: true,
// });

//ref, permite todos los subdominios de vercel
app.enableCors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://192.168.1.105:3000',
      'http://localhost:3001',
      'https://catalogo-brown-sigma.vercel.app',
    ];

    // Permite cualquier subdominio de Vercel (deploys de preview)
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});


  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);  


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
