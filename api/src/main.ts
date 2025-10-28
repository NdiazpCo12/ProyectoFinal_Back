import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API - Proyecto Final')
    .setDescription('Documentación de la API para los módulos de autenticación y retos.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Puerto de ejecución
  await app.listen(3000);
  console.log(` Servidor corriendo en http://localhost:3000`);
  console.log(` Swagger disponible en http://localhost:3000/api/docs`);
}
bootstrap();

