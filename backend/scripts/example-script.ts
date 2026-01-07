/**
 * TEMPLATE DE SCRIPT CON PRISMA
 *
 * Este es un ejemplo de cómo escribir scripts que usen Prisma
 * asegurando que las conexiones se cierren correctamente.
 *
 * Uso:
 * npx ts-node -r tsconfig-paths/register scripts/example-script.ts
 */

import { PrismaClient } from '@prisma/client';

// Crear instancia de Prisma para el script
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],  // Opcional: activar logging
});

/**
 * Función principal del script
 */
async function main() {
  try {
    console.log('🚀 Iniciando script...\n');

    // ========================================
    // TU LÓGICA AQUÍ
    // ========================================

    // Ejemplo 1: Contar productos activos
    const productosActivos = await prisma.productos.count({
      where: { activo: true },
    });
    console.log(`✅ Productos activos: ${productosActivos}`);

    // Ejemplo 2: Obtener ventas del último mes
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);

    const ventasRecientes = await prisma.ventas.count({
      where: {
        fecha: {
          gte: unMesAtras,
        },
      },
    });
    console.log(`✅ Ventas último mes: ${ventasRecientes}`);

    // Ejemplo 3: Actualización en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Operaciones atómicas
      const productos = await tx.productos.findMany({ take: 5 });
      return productos;
    });
    console.log(`✅ Transacción completada: ${resultado.length} productos`);

    // ========================================
    // FIN DE TU LÓGICA
    // ========================================

    console.log('\n✅ Script completado exitosamente');

  } catch (error) {
    console.error('\n❌ Error al ejecutar script:', error);
    process.exit(1);  // Salir con código de error
  } finally {
    // ✅ IMPORTANTE: SIEMPRE cerrar la conexión
    await prisma.$disconnect();
    console.log('🔌 Conexión a BD cerrada\n');
  }
}

// Ejecutar script con manejo de errores
main()
  .then(() => {
    process.exit(0);  // Salir exitosamente
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);  // Salir con error
  });
