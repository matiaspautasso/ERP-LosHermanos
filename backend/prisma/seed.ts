import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear categorías
  console.log('📦 Creando categorías...');
  const categoriaLacteos = await prisma.categorias.upsert({
    where: { nombre: 'Lácteos' },
    update: {},
    create: {
      nombre: 'Lácteos',
      activo: true,
    },
  });

  const categoriaFiambres = await prisma.categorias.upsert({
    where: { nombre: 'Fiambres' },
    update: {},
    create: {
      nombre: 'Fiambres',
      activo: true,
    },
  });

  const categoriaConservas = await prisma.categorias.upsert({
    where: { nombre: 'Conservas' },
    update: {},
    create: {
      nombre: 'Conservas',
      activo: true,
    },
  });

  const categoriaAlmacen = await prisma.categorias.upsert({
    where: { nombre: 'Almacén Seco' },
    update: {},
    create: {
      nombre: 'Almacén Seco',
      activo: true,
    },
  });

  console.log('✅ Categorías creadas');

  // 2. Crear unidades
  console.log('📏 Creando unidades...');
  const unidadUnidad = await prisma.unidades.upsert({
    where: { nombre: 'Unidad' },
    update: {},
    create: {
      nombre: 'Unidad',
    },
  });

  const unidadKg = await prisma.unidades.upsert({
    where: { nombre: 'Kilogramo' },
    update: {},
    create: {
      nombre: 'Kilogramo',
    },
  });

  const unidadGramo = await prisma.unidades.upsert({
    where: { nombre: 'Gramo' },
    update: {},
    create: {
      nombre: 'Gramo',
    },
  });

  const unidadLitro = await prisma.unidades.upsert({
    where: { nombre: 'Litro' },
    update: {},
    create: {
      nombre: 'Litro',
    },
  });

  console.log('✅ Unidades creadas');

  // 3. Crear productos
  console.log('🛒 Creando productos...');

  // LÁCTEOS
  await prisma.productos.createMany({
    data: [
      {
        nombre: 'Leche Entera 1L (sachet)',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadLitro.id,
        costo: 800.0,
        precio_lista: 1200.0,
        iva_porcentaje: 21.0,
        stock_actual: 100,
        stock_minimo: 20,
        activo: true,
        descripcion: 'Leche entera en sachet de 1 litro',
      },
      {
        nombre: 'Leche Entera 1L (larga vida)',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadLitro.id,
        costo: 900.0,
        precio_lista: 1350.0,
        iva_porcentaje: 21.0,
        stock_actual: 80,
        stock_minimo: 15,
        activo: true,
        descripcion: 'Leche entera larga vida en tetra de 1 litro',
      },
      {
        nombre: 'Leche Descremada 1L',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadLitro.id,
        costo: 850.0,
        precio_lista: 1280.0,
        iva_porcentaje: 21.0,
        stock_actual: 60,
        stock_minimo: 15,
        activo: true,
        descripcion: 'Leche descremada en tetra de 1 litro',
      },
      {
        nombre: 'Yogur Entero Vainilla 1kg',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadKg.id,
        costo: 1200.0,
        precio_lista: 1800.0,
        iva_porcentaje: 21.0,
        stock_actual: 50,
        stock_minimo: 10,
        activo: true,
        descripcion: 'Yogur entero sabor vainilla 1 kilogramo',
      },
      {
        nombre: 'Yogur Bebible Frutilla 900ml',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadUnidad.id,
        costo: 950.0,
        precio_lista: 1450.0,
        iva_porcentaje: 21.0,
        stock_actual: 40,
        stock_minimo: 10,
        activo: true,
        descripcion: 'Yogur bebible sabor frutilla 900ml',
      },
      {
        nombre: 'Queso Cremoso por kg',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadKg.id,
        costo: 4500.0,
        precio_lista: 6500.0,
        iva_porcentaje: 21.0,
        stock_actual: 25,
        stock_minimo: 5,
        activo: true,
        descripcion: 'Queso cremoso vendido por kilogramo',
      },
      {
        nombre: 'Queso Barra por kg',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadKg.id,
        costo: 4200.0,
        precio_lista: 6200.0,
        iva_porcentaje: 21.0,
        stock_actual: 30,
        stock_minimo: 5,
        activo: true,
        descripcion: 'Queso barra vendido por kilogramo',
      },
      {
        nombre: 'Queso Rallado 40g',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadGramo.id,
        costo: 350.0,
        precio_lista: 580.0,
        iva_porcentaje: 21.0,
        stock_actual: 150,
        stock_minimo: 30,
        activo: true,
        descripcion: 'Queso rallado en sobre de 40 gramos',
      },
      {
        nombre: 'Queso Rallado 100g',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadGramo.id,
        costo: 750.0,
        precio_lista: 1200.0,
        iva_porcentaje: 21.0,
        stock_actual: 100,
        stock_minimo: 20,
        activo: true,
        descripcion: 'Queso rallado en sobre de 100 gramos',
      },
      {
        nombre: 'Manteca 200g',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadGramo.id,
        costo: 950.0,
        precio_lista: 1450.0,
        iva_porcentaje: 21.0,
        stock_actual: 80,
        stock_minimo: 15,
        activo: true,
        descripcion: 'Manteca en barra de 200 gramos',
      },
      {
        nombre: 'Crema de Leche 200g',
        categoria_id: categoriaLacteos.id,
        unidad_id: unidadGramo.id,
        costo: 700.0,
        precio_lista: 1100.0,
        iva_porcentaje: 21.0,
        stock_actual: 60,
        stock_minimo: 15,
        activo: true,
        descripcion: 'Crema de leche en sachet de 200 gramos',
      },
    ],
    skipDuplicates: true,
  });

  // FIAMBRES
  await prisma.productos.createMany({
    data: [
      {
        nombre: 'Jamón Cocido Natural por kg',
        categoria_id: categoriaFiambres.id,
        unidad_id: unidadKg.id,
        costo: 5500.0,
        precio_lista: 7800.0,
        iva_porcentaje: 21.0,
        stock_actual: 20,
        stock_minimo: 5,
        activo: true,
        descripcion: 'Jamón cocido natural vendido por kilogramo',
      },
      {
        nombre: 'Jamón Crudo por kg',
        categoria_id: categoriaFiambres.id,
        unidad_id: unidadKg.id,
        costo: 8500.0,
        precio_lista: 12000.0,
        iva_porcentaje: 21.0,
        stock_actual: 15,
        stock_minimo: 3,
        activo: true,
        descripcion: 'Jamón crudo vendido por kilogramo',
      },
      {
        nombre: 'Queso Tybo por kg',
        categoria_id: categoriaFiambres.id,
        unidad_id: unidadKg.id,
        costo: 5200.0,
        precio_lista: 7500.0,
        iva_porcentaje: 21.0,
        stock_actual: 18,
        stock_minimo: 4,
        activo: true,
        descripcion: 'Queso Tybo vendido por kilogramo',
      },
      {
        nombre: 'Salame Milan por kg',
        categoria_id: categoriaFiambres.id,
        unidad_id: unidadKg.id,
        costo: 6800.0,
        precio_lista: 9500.0,
        iva_porcentaje: 21.0,
        stock_actual: 12,
        stock_minimo: 3,
        activo: true,
        descripcion: 'Salame Milan vendido por kilogramo',
      },
      {
        nombre: 'Mortadela con Pistacho por kg',
        categoria_id: categoriaFiambres.id,
        unidad_id: unidadKg.id,
        costo: 3800.0,
        precio_lista: 5500.0,
        iva_porcentaje: 21.0,
        stock_actual: 25,
        stock_minimo: 5,
        activo: true,
        descripcion: 'Mortadela con pistacho vendida por kilogramo',
      },
      {
        nombre: 'Paleta Cocida por kg',
        categoria_id: categoriaFiambres.id,
        unidad_id: unidadKg.id,
        costo: 4200.0,
        precio_lista: 6200.0,
        iva_porcentaje: 21.0,
        stock_actual: 22,
        stock_minimo: 5,
        activo: true,
        descripcion: 'Paleta cocida vendida por kilogramo',
      },
      {
        nombre: 'Bondiola por kg',
        categoria_id: categoriaFiambres.id,
        unidad_id: unidadKg.id,
        costo: 7200.0,
        precio_lista: 10200.0,
        iva_porcentaje: 21.0,
        stock_actual: 10,
        stock_minimo: 3,
        activo: true,
        descripcion: 'Bondiola vendida por kilogramo',
      },
    ],
    skipDuplicates: true,
  });

  // CONSERVAS
  await prisma.productos.createMany({
    data: [
      {
        nombre: 'Atún en Aceite 170g',
        categoria_id: categoriaConservas.id,
        unidad_id: unidadGramo.id,
        costo: 850.0,
        precio_lista: 1350.0,
        iva_porcentaje: 21.0,
        stock_actual: 200,
        stock_minimo: 40,
        activo: true,
        descripcion: 'Atún en aceite lata de 170 gramos',
      },
      {
        nombre: 'Atún en Agua 170g',
        categoria_id: categoriaConservas.id,
        unidad_id: unidadGramo.id,
        costo: 820.0,
        precio_lista: 1300.0,
        iva_porcentaje: 21.0,
        stock_actual: 180,
        stock_minimo: 40,
        activo: true,
        descripcion: 'Atún en agua lata de 170 gramos',
      },
      {
        nombre: 'Arvejas 350g',
        categoria_id: categoriaConservas.id,
        unidad_id: unidadGramo.id,
        costo: 420.0,
        precio_lista: 680.0,
        iva_porcentaje: 21.0,
        stock_actual: 150,
        stock_minimo: 30,
        activo: true,
        descripcion: 'Arvejas en lata de 350 gramos',
      },
      {
        nombre: 'Lentejas 350g',
        categoria_id: categoriaConservas.id,
        unidad_id: unidadGramo.id,
        costo: 450.0,
        precio_lista: 720.0,
        iva_porcentaje: 21.0,
        stock_actual: 140,
        stock_minimo: 30,
        activo: true,
        descripcion: 'Lentejas en lata de 350 gramos',
      },
      {
        nombre: 'Garbanzos 350g',
        categoria_id: categoriaConservas.id,
        unidad_id: unidadGramo.id,
        costo: 430.0,
        precio_lista: 700.0,
        iva_porcentaje: 21.0,
        stock_actual: 130,
        stock_minimo: 30,
        activo: true,
        descripcion: 'Garbanzos en lata de 350 gramos',
      },
      {
        nombre: 'Tomates Triturados 520g',
        categoria_id: categoriaConservas.id,
        unidad_id: unidadGramo.id,
        costo: 380.0,
        precio_lista: 620.0,
        iva_porcentaje: 21.0,
        stock_actual: 160,
        stock_minimo: 35,
        activo: true,
        descripcion: 'Tomates triturados en lata de 520 gramos',
      },
      {
        nombre: 'Puré de Tomate 520g',
        categoria_id: categoriaConservas.id,
        unidad_id: unidadGramo.id,
        costo: 350.0,
        precio_lista: 580.0,
        iva_porcentaje: 21.0,
        stock_actual: 170,
        stock_minimo: 35,
        activo: true,
        descripcion: 'Puré de tomate en lata de 520 gramos',
      },
      {
        nombre: 'Duraznos en Almíbar 820g',
        categoria_id: categoriaConservas.id,
        unidad_id: unidadGramo.id,
        costo: 920.0,
        precio_lista: 1450.0,
        iva_porcentaje: 21.0,
        stock_actual: 90,
        stock_minimo: 20,
        activo: true,
        descripcion: 'Duraznos en almíbar lata de 820 gramos',
      },
    ],
    skipDuplicates: true,
  });

  // ALMACÉN SECO
  await prisma.productos.createMany({
    data: [
      {
        nombre: 'Harina 000 1kg',
        categoria_id: categoriaAlmacen.id,
        unidad_id: unidadKg.id,
        costo: 520.0,
        precio_lista: 850.0,
        iva_porcentaje: 21.0,
        stock_actual: 200,
        stock_minimo: 50,
        activo: true,
        descripcion: 'Harina 000 bolsa de 1 kilogramo',
      },
      {
        nombre: 'Harina Leudante 1kg',
        categoria_id: categoriaAlmacen.id,
        unidad_id: unidadKg.id,
        costo: 580.0,
        precio_lista: 920.0,
        iva_porcentaje: 21.0,
        stock_actual: 150,
        stock_minimo: 40,
        activo: true,
        descripcion: 'Harina leudante bolsa de 1 kilogramo',
      },
      {
        nombre: 'Azúcar 1kg',
        categoria_id: categoriaAlmacen.id,
        unidad_id: unidadKg.id,
        costo: 680.0,
        precio_lista: 1050.0,
        iva_porcentaje: 21.0,
        stock_actual: 180,
        stock_minimo: 45,
        activo: true,
        descripcion: 'Azúcar refinada bolsa de 1 kilogramo',
      },
      {
        nombre: 'Yerba Mate 1kg',
        categoria_id: categoriaAlmacen.id,
        unidad_id: unidadKg.id,
        costo: 1850.0,
        precio_lista: 2800.0,
        iva_porcentaje: 21.0,
        stock_actual: 120,
        stock_minimo: 30,
        activo: true,
        descripcion: 'Yerba mate paquete de 1 kilogramo',
      },
      {
        nombre: 'Arroz 1kg',
        categoria_id: categoriaAlmacen.id,
        unidad_id: unidadKg.id,
        costo: 750.0,
        precio_lista: 1180.0,
        iva_porcentaje: 21.0,
        stock_actual: 160,
        stock_minimo: 40,
        activo: true,
        descripcion: 'Arroz largo fino bolsa de 1 kilogramo',
      },
      {
        nombre: 'Fideos Spaghetti 500g',
        categoria_id: categoriaAlmacen.id,
        unidad_id: unidadGramo.id,
        costo: 420.0,
        precio_lista: 680.0,
        iva_porcentaje: 21.0,
        stock_actual: 250,
        stock_minimo: 60,
        activo: true,
        descripcion: 'Fideos Spaghetti paquete de 500 gramos',
      },
      {
        nombre: 'Fideos Tirabuzón 500g',
        categoria_id: categoriaAlmacen.id,
        unidad_id: unidadGramo.id,
        costo: 430.0,
        precio_lista: 690.0,
        iva_porcentaje: 21.0,
        stock_actual: 240,
        stock_minimo: 60,
        activo: true,
        descripcion: 'Fideos Tirabuzón paquete de 500 gramos',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Productos creados');

  // 4. Crear clientes de ejemplo
  console.log('👥 Creando clientes de ejemplo...');
  await prisma.clientes.createMany({
    data: [
      {
        nombre: 'Juan',
        apellido: 'García',
        telefono: '3512345678',
        correo: 'juan.garcia@email.com',
        tipo: 'Minorista',
        activo: true,
      },
      {
        nombre: 'María',
        apellido: 'López',
        telefono: '3518765432',
        correo: 'maria.lopez@email.com',
        tipo: 'Mayorista',
        activo: true,
      },
      {
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        telefono: '3511234567',
        correo: 'carlos.rodriguez@email.com',
        tipo: 'Minorista',
        activo: true,
      },
      {
        nombre: 'Ana',
        apellido: 'Martínez',
        telefono: '3517654321',
        correo: 'ana.martinez@email.com',
        tipo: 'Mayorista',
        activo: true,
      },
      {
        nombre: 'Luis',
        apellido: 'Fernández',
        telefono: '3519876543',
        correo: 'luis.fernandez@email.com',
        tipo: 'Minorista',
        activo: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Clientes de ejemplo creados');

  console.log('✅ Seed completado exitosamente!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
