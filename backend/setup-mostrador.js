const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupMostrador() {
  try {
    console.log('\n🔍 Verificando clientes de prueba...\n');

    // 1. Verificar/Crear cliente Mostrador
    const mostradorExistente = await prisma.clientes.findFirst({
      where: {
        nombre: 'Mostrador',
      },
    });

    if (mostradorExistente) {
      console.log('✅ Cliente Mostrador ya existe:');
      console.log(`   ID: ${mostradorExistente.id.toString()}`);
      console.log(`   Nombre: ${mostradorExistente.nombre}`);
      console.log(`   Tipo: ${mostradorExistente.tipo}`);
      console.log(`   Fecha Alta: ${mostradorExistente.fecha_alta}\n`);
    } else {
      console.log('⚠️  Cliente Mostrador no existe. Creando...\n');

      const nuevoMostrador = await prisma.clientes.create({
        data: {
          nombre: 'Mostrador',
          apellido: '',
          telefono: '',
          correo: '',
          tipo: 'Minorista',
          fecha_alta: new Date(),
        },
      });

      console.log('✅ Cliente Mostrador creado exitosamente:');
      console.log(`   ID: ${nuevoMostrador.id.toString()}`);
      console.log(`   Nombre: ${nuevoMostrador.nombre}`);
      console.log(`   Tipo: ${nuevoMostrador.tipo}\n`);
    }

    // 2. Verificar/Crear cliente Supermayorista
    const supermayoristaExistente = await prisma.clientes.findFirst({
      where: {
        tipo: 'Supermayorista',
      },
    });

    if (supermayoristaExistente) {
      console.log('✅ Cliente Supermayorista ya existe:');
      console.log(`   ID: ${supermayoristaExistente.id.toString()}`);
      console.log(`   Nombre: ${supermayoristaExistente.nombre} ${supermayoristaExistente.apellido}`);
      console.log(`   Tipo: ${supermayoristaExistente.tipo}\n`);
    } else {
      console.log('⚠️  Cliente Supermayorista no existe. Creando...\n');

      const nuevoSupermayorista = await prisma.clientes.create({
        data: {
          nombre: 'Distribuidor',
          apellido: 'Central',
          telefono: '555-0100',
          correo: 'supermayorista@ejemplo.com',
          tipo: 'Supermayorista',
          fecha_alta: new Date(),
        },
      });

      console.log('✅ Cliente Supermayorista creado exitosamente:');
      console.log(`   ID: ${nuevoSupermayorista.id.toString()}`);
      console.log(`   Nombre: ${nuevoSupermayorista.nombre} ${nuevoSupermayorista.apellido}`);
      console.log(`   Tipo: ${nuevoSupermayorista.tipo}`);
      console.log(`   Email: ${nuevoSupermayorista.correo}\n`);
    }

    // 3. Mostrar resumen de tipos
    const tipos = await prisma.clientes.findMany({
      select: { tipo: true },
      distinct: ['tipo'],
    });

    console.log('📊 TIPOS DE CLIENTE DISPONIBLES:\n');
    tipos.forEach((t, index) => {
      console.log(`   ${index + 1}. ${t.tipo}`);
    });

    console.log('\n✅ Configuración completada.\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupMostrador();
