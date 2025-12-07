const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function actualizarConstraints() {
  try {
    console.log('\n🔧 ACTUALIZANDO RESTRICCIONES DE BASE DE DATOS\n');
    console.log('='.repeat(80));

    // 1. Eliminar la constraint antigua de tipo de clientes
    console.log('📝 Eliminando restricción CHECK antigua en clientes.tipo...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE clientes DROP CONSTRAINT IF EXISTS ck_clientes_tipo;
    `);
    console.log('✅ Restricción antigua eliminada\n');

    // 2. Crear nueva constraint que incluye Supermayorista
    console.log('📝 Creando nueva restricción CHECK que incluye Supermayorista...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE clientes 
      ADD CONSTRAINT ck_clientes_tipo 
      CHECK (tipo IN ('Minorista', 'Mayorista', 'Supermayorista'));
    `);
    console.log('✅ Nueva restricción creada\n');

    // 3. Hacer lo mismo para la tabla ventas
    console.log('📝 Eliminando restricción CHECK antigua en ventas.tipo_venta...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ck_ventas_tipo;
    `);
    console.log('✅ Restricción antigua eliminada\n');

    console.log('📝 Creando nueva restricción CHECK en ventas.tipo_venta...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE ventas 
      ADD CONSTRAINT ck_ventas_tipo 
      CHECK (tipo_venta IN ('Minorista', 'Mayorista', 'Supermayorista'));
    `);
    console.log('✅ Nueva restricción creada\n');

    console.log('='.repeat(80));
    console.log('✅ Restricciones actualizadas exitosamente');
    console.log('\nAhora puedes crear clientes de tipo Supermayorista\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarConstraints();
