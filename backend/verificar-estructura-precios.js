const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarEstructuraPrecios() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VERIFICACIÓN DE ESTRUCTURA Y DATOS - TABLA PRECIOS');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. VERIFICAR PRODUCTOS CON PRECIOS
    console.log('📊 1. RESUMEN DE PRODUCTOS Y PRECIOS\n');
    
    const totalProductosActivos = await prisma.productos.count({
      where: { activo: true }
    });
    
    const productosConPrecios = await prisma.precios.groupBy({
      by: ['producto_id']
    });
    
    console.log(`   ✓ Total Productos Activos: ${totalProductosActivos}`);
    console.log(`   ✓ Productos con Precios: ${productosConPrecios.length}`);
    console.log(`   ✓ Productos SIN Precios: ${totalProductosActivos - productosConPrecios.length}`);

    // 2. VERIFICAR QUE LOS 3 TIPOS DE PRECIO ESTÉN CONFIGURADOS
    console.log('\n' + '-'.repeat(80));
    console.log('📊 2. PRODUCTOS CON PRECIOS COMPLETOS (Primeros 20)\n');

    const productosConPreciosDetalle = await prisma.$queryRaw`
      SELECT 
        p.id as producto_id,
        p.nombre as producto,
        p.precio_lista,
        c.nombre as categoria,
        pr.precio_minorista,
        pr.precio_mayorista,
        pr.precio_supermayorista,
        pr.ultima_modificacion,
        CASE 
          WHEN pr.precio_minorista IS NULL THEN 'Falta Minorista'
          WHEN pr.precio_mayorista IS NULL THEN 'Falta Mayorista'
          WHEN pr.precio_supermayorista IS NULL THEN 'Falta Supermayorista'
          ELSE 'Completo'
        END as estado_precios,
        CASE 
          WHEN pr.precio_supermayorista <= pr.precio_mayorista 
           AND pr.precio_mayorista <= pr.precio_minorista THEN 'OK'
          ELSE 'Jerarquía Incorrecta'
        END as jerarquia
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN LATERAL (
        SELECT 
          precio_minorista,
          precio_mayorista,
          precio_supermayorista,
          ultima_modificacion
        FROM precios
        WHERE producto_id = p.id
        ORDER BY ultima_modificacion DESC
        LIMIT 1
      ) pr ON true
      WHERE p.activo = true
      ORDER BY p.nombre
      LIMIT 20
    `;

    productosConPreciosDetalle.forEach((prod, idx) => {
      console.log(`\n   ${idx + 1}. ${prod.producto}`);
      console.log(`      Categoría: ${prod.categoria}`);
      console.log(`      Costo Base: $${Number(prod.precio_lista).toFixed(2)}`);
      console.log(`      Minorista: ${prod.precio_minorista ? '$' + Number(prod.precio_minorista).toFixed(2) : '❌ NO CONFIGURADO'}`);
      console.log(`      Mayorista: ${prod.precio_mayorista ? '$' + Number(prod.precio_mayorista).toFixed(2) : '❌ NO CONFIGURADO'}`);
      console.log(`      Supermayorista: ${prod.precio_supermayorista ? '$' + Number(prod.precio_supermayorista).toFixed(2) : '❌ NO CONFIGURADO'}`);
      console.log(`      Estado: ${prod.estado_precios === 'Completo' ? '✅' : '⚠️'} ${prod.estado_precios}`);
      console.log(`      Jerarquía: ${prod.jerarquia === 'OK' ? '✅' : '❌'} ${prod.jerarquia}`);
    });

    // 3. RESUMEN DE PRECIOS FALTANTES
    console.log('\n' + '-'.repeat(80));
    console.log('📊 3. RESUMEN DE PRECIOS FALTANTES\n');

    const resumenFaltantes = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN precio_minorista IS NULL THEN 'Sin Precio Minorista'
          WHEN precio_mayorista IS NULL THEN 'Sin Precio Mayorista'
          WHEN precio_supermayorista IS NULL THEN 'Sin Precio Supermayorista'
          ELSE 'Todos los Precios OK'
        END as tipo_problema,
        COUNT(*) as cantidad_productos
      FROM productos p
      LEFT JOIN LATERAL (
        SELECT 
          precio_minorista,
          precio_mayorista,
          precio_supermayorista
        FROM precios
        WHERE producto_id = p.id
        ORDER BY ultima_modificacion DESC
        LIMIT 1
      ) pr ON true
      WHERE p.activo = true
      GROUP BY 
        CASE 
          WHEN precio_minorista IS NULL THEN 'Sin Precio Minorista'
          WHEN precio_mayorista IS NULL THEN 'Sin Precio Mayorista'
          WHEN precio_supermayorista IS NULL THEN 'Sin Precio Supermayorista'
          ELSE 'Todos los Precios OK'
        END
      ORDER BY cantidad_productos DESC
    `;

    resumenFaltantes.forEach((item) => {
      const icon = item.tipo_problema === 'Todos los Precios OK' ? '✅' : '⚠️';
      console.log(`   ${icon} ${item.tipo_problema}: ${item.cantidad_productos} productos`);
    });

    // 4. VERIFICAR DUPLICADOS
    console.log('\n' + '-'.repeat(80));
    console.log('📊 4. VERIFICAR DUPLICADOS EN PRECIOS\n');

    const duplicados = await prisma.$queryRaw`
      SELECT 
        producto_id,
        COUNT(*) as registros_totales,
        COUNT(DISTINCT DATE(ultima_modificacion)) as fechas_distintas,
        MIN(ultima_modificacion) as primer_registro,
        MAX(ultima_modificacion) as ultimo_registro
      FROM precios
      GROUP BY producto_id
      HAVING COUNT(*) > 1
      ORDER BY registros_totales DESC
      LIMIT 10
    `;

    if (duplicados.length === 0) {
      console.log('   ✅ No se encontraron productos con registros duplicados en la misma fecha');
    } else {
      console.log(`   ⚠️  Se encontraron ${duplicados.length} productos con múltiples registros:\n`);
      duplicados.forEach((dup) => {
        console.log(`      Producto ID: ${dup.producto_id}`);
        console.log(`      Registros totales: ${dup.registros_totales}`);
        console.log(`      Fechas distintas: ${dup.fechas_distintas}`);
        console.log(`      Primer registro: ${dup.primer_registro}`);
        console.log(`      Último registro: ${dup.ultimo_registro}`);
        console.log('');
      });
    }

    // 5. VERIFICAR JERARQUÍA INCORRECTA
    console.log('-'.repeat(80));
    console.log('📊 5. PRODUCTOS CON JERARQUÍA DE PRECIOS INCORRECTA\n');

    const jerarquiaIncorrecta = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.nombre,
        pr.precio_supermayorista,
        pr.precio_mayorista,
        pr.precio_minorista,
        CASE 
          WHEN pr.precio_supermayorista > pr.precio_mayorista THEN 'Supermay > May'
          WHEN pr.precio_mayorista > pr.precio_minorista THEN 'May > Min'
          ELSE 'OK'
        END as problema
      FROM productos p
      INNER JOIN LATERAL (
        SELECT 
          precio_minorista,
          precio_mayorista,
          precio_supermayorista
        FROM precios
        WHERE producto_id = p.id
        ORDER BY ultima_modificacion DESC
        LIMIT 1
      ) pr ON true
      WHERE p.activo = true
        AND (pr.precio_supermayorista > pr.precio_mayorista 
             OR pr.precio_mayorista > pr.precio_minorista)
      LIMIT 10
    `;

    if (jerarquiaIncorrecta.length === 0) {
      console.log('   ✅ Todos los productos tienen jerarquía de precios correcta');
      console.log('   (Supermayorista ≤ Mayorista ≤ Minorista)');
    } else {
      console.log(`   ❌ Se encontraron ${jerarquiaIncorrecta.length} productos con jerarquía incorrecta:\n`);
      jerarquiaIncorrecta.forEach((prod) => {
        console.log(`      ${prod.nombre}`);
        console.log(`      Supermay: $${Number(prod.precio_supermayorista).toFixed(2)} | May: $${Number(prod.precio_mayorista).toFixed(2)} | Min: $${Number(prod.precio_minorista).toFixed(2)}`);
        console.log(`      Problema: ${prod.problema}`);
        console.log('');
      });
    }

    // 6. VERIFICAR ÍNDICE
    console.log('-'.repeat(80));
    console.log('📊 6. ÍNDICES EN TABLA PRECIOS\n');

    const indices = await prisma.$queryRaw`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'precios'
      ORDER BY indexname
    `;

    indices.forEach((idx) => {
      const esOptimizado = idx.indexname === 'ix_precios_producto_fecha';
      const icon = esOptimizado ? '✅' : '📌';
      console.log(`   ${icon} ${idx.indexname}`);
      if (esOptimizado) {
        console.log('      (Índice optimizado para consultas de precio actual)');
      }
    });

    // 7. RESUMEN EJECUTIVO
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN EJECUTIVO\n');

    const resumenEjecutivo = await prisma.$queryRaw`
      SELECT 
        'Productos Activos' as metrica,
        COUNT(*)::int as valor
      FROM productos
      WHERE activo = true

      UNION ALL

      SELECT 
        'Productos con Precios Completos (3 tipos)',
        COUNT(*)::int
      FROM productos p
      INNER JOIN LATERAL (
        SELECT 
          precio_minorista,
          precio_mayorista,
          precio_supermayorista
        FROM precios
        WHERE producto_id = p.id
        ORDER BY ultima_modificacion DESC
        LIMIT 1
      ) pr ON true
      WHERE p.activo = true
        AND pr.precio_minorista IS NOT NULL
        AND pr.precio_mayorista IS NOT NULL
        AND pr.precio_supermayorista IS NOT NULL

      UNION ALL

      SELECT 
        'Productos con Jerarquía Correcta',
        COUNT(*)::int
      FROM productos p
      INNER JOIN LATERAL (
        SELECT 
          precio_minorista,
          precio_mayorista,
          precio_supermayorista
        FROM precios
        WHERE producto_id = p.id
        ORDER BY ultima_modificacion DESC
        LIMIT 1
      ) pr ON true
      WHERE p.activo = true
        AND pr.precio_supermayorista <= pr.precio_mayorista
        AND pr.precio_mayorista <= pr.precio_minorista

      UNION ALL

      SELECT 
        'Total Registros en Tabla Precios',
        COUNT(*)::int
      FROM precios
    `;

    resumenEjecutivo.forEach((item) => {
      const porcentaje = item.metrica === 'Productos Activos' 
        ? ''
        : ` (${((item.valor / resumenEjecutivo[0].valor) * 100).toFixed(1)}%)`;
      console.log(`   ${item.metrica}: ${item.valor}${porcentaje}`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error al verificar estructura:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarEstructuraPrecios();
