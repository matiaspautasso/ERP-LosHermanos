import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
        // Descomentar para debug de queries lentas
        // { level: 'query', emit: 'event' },
      ],
      errorFormat: 'pretty',
    });

    // Event listeners para logging mejorado
    this.$on('error' as never, (e: any) => {
      this.logger.error(`Database error: ${e.message}`, e.stack);
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Database warning: ${e.message}`);
    });

    // Descomentar para debug de queries
    // this.$on('query' as never, (e: any) => {
    //   if (e.duration > 1000) {
    //     this.logger.warn(`Slow query detected (${e.duration}ms): ${e.query}`);
    //   }
    // });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Conectado a PostgreSQL (Supabase)');

      // Verificar conexión con query simple
      await this.$queryRaw`SELECT 1`;
      this.logger.log('🔍 Conexión verificada correctamente');
    } catch (error) {
      this.logger.error('❌ Error al conectar a la base de datos', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Desconectado de la base de datos');
    } catch (error) {
      this.logger.error('❌ Error al desconectar de la base de datos', error);
    }
  }

  /**
   * Método helper para cerrar la conexión manualmente (útil en scripts)
   */
  async cleanup() {
    await this.$disconnect();
  }
}
