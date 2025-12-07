const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTiposCliente() {
  try {
    const tipos = await prisma.clientes.findMany({
      select: { tipo: true },
      distinct: ['tipo'],
    });

    console.log('\n📋 TIPOS DE CLIENTE EN LA BASE DE DATOS:\n');
    console.log('='.repeat(50));
    
    if (tipos.length === 0) {
      console.log('No hay tipos de cliente registrados.');
    } else {
      tipos.forEach((t, index) => {
        console.log(`${index + 1}. "${t.tipo}"`);
      });
      console.log('='.repeat(50));
      console.log(`\nTotal: ${tipos.length} tipo(s) diferente(s)`);
    }

    // También mostrar algunos clientes de ejemplo
    const ejemplos = await prisma.clientes.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        tipo: true,
      },
      take: 5,
    });

    console.log('\n📋 EJEMPLOS DE CLIENTES:\n');
    ejemplos.forEach((c) => {
      console.log(`- ${c.nombre} ${c.apellido} (Tipo: "${c.tipo}")`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTiposCliente();
