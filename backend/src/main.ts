import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import { AppModule } from './app.module';

// Configuración global para serializar BigInt como string en JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Configuración de sesiones con cookies
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'erp-los-hermanos-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    }),
  );

  // Configuración de Swagger (solo en desarrollo para mejorar tiempo de arranque)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ERP Los Hermanos API')
      .setDescription('API del Sistema ERP Los Hermanos - Módulo de Gestión de Usuarios')
      .setVersion('1.0')
      .addTag('auth', 'Endpoints de autenticación y gestión de usuarios')
      .addCookieAuth('sessionId')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'ERP Los Hermanos API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        displayRequestDuration: true,
      },
    });
  }

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // ⚠️ CRÍTICO: Habilitar shutdown hooks para cerrar Prisma correctamente
  // Esto asegura que onModuleDestroy() se ejecute al cerrar la app (SIGTERM, SIGINT)
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
