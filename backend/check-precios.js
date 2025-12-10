const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrecios() {
  try {
    // Contar total de registros
    const totalPrecios = await prisma.precios.count();
    console.log('\n📊 TOTAL DE REGISTROS EN TABLA PRECIOS:', totalPrecios);

    // Agrupar por producto para ver cuántos tienen historial
    const preciosPorProducto = await prisma.precios.groupBy({
      by: ['producto_id'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    console.log('\n📦 REGISTROS POR PRODUCTO:');
    console.log(`Productos con precios registrados: ${preciosPorProducto.length}`);
    
    // Mostrar productos con más de 1 registro (tienen historial)
    const productosConHistorial = preciosPorProducto.filter(p => p._count.id > 1);
    console.log(`Productos con historial (>1 registro): ${productosConHistorial.length}`);

    if (productosConHistorial.length > 0) {
      console.log('\n🔍 PRODUCTOS CON MÚLTIPLES REGISTROS:');
      for (const p of productosConHistorial.slice(0, 5)) {
        const producto = await prisma.productos.findUnique({
          where: { id: p.producto_id },
          select: { nombre: true },
        });
        console.log(`  - Producto ID ${p.producto_id} (${producto?.nombre}): ${p._count.id} registros`);
      }
    }

    // Obtener ejemplo de historial completo de un producto
    if (preciosPorProducto.length > 0) {
      const primerProducto = preciosPorProducto[0].producto_id;
      const historialCompleto = await prisma.precios.findMany({
        where: { producto_id: primerProducto },
        include: {
          user: {
            select: { username: true },
          },
          productos: {
            select: { nombre: true },
          },
        },
        orderBy: { ultima_modificacion: 'desc' },
      });

      console.log(`\n📋 HISTORIAL COMPLETO DEL PRODUCTO ID ${primerProducto}:`);
      console.log(`Nombre: ${historialCompleto[0].productos.nombre}`);
      console.log(`Total de cambios: ${historialCompleto.length}\n`);
      
      historialCompleto.forEach((precio, index) => {
        console.log(`${index + 1}. Fecha: ${precio.ultima_modificacion.toISOString()}`);
        console.log(`   Usuario: ${precio.user.username}`);
        console.log(`   Minorista: $${precio.precio_minorista} | Mayorista: $${precio.precio_mayorista} | Supermayorista: $${precio.precio_supermayorista}\n`);
      });
    }

    // Verificar productos que solo tienen 1 registro
    const productosSinHistorial = preciosPorProducto.filter(p => p._count.id === 1);
    console.log(`\n⚠️  PRODUCTOS CON SOLO 1 REGISTRO (sin historial): ${productosSinHistorial.length}`);

  } catch (error) {
    console.error('Error al verificar precios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrecios();
