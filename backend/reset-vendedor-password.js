const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetVendedorPassword() {
  try {
    console.log('\n🔐 RESET DE CONTRASEÑA DEL USUARIO VENDEDOR\n');
    console.log('='.repeat(80));

    // Buscar el usuario vendedor
    const vendedor = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'vendedor@erp.com' },
          { username: 'vendedor' }
        ]
      }
    });

    if (!vendedor) {
      console.log('❌ No se encontró el usuario vendedor');
      return;
    }

    console.log(`\n✅ Usuario encontrado:`);
    console.log(`   ID: ${vendedor.id}`);
    console.log(`   Email: ${vendedor.email}`);
    console.log(`   Username: ${vendedor.username}`);
    console.log(`   Estado: ${vendedor.isActive ? 'ACTIVO' : 'INACTIVO'}`);

    // Generar nueva contraseña
    const newPassword = '1234';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`\n🔑 Generando nuevo hash para: "${newPassword}"`);

    // Actualizar contraseña y asegurar que está activo
    await prisma.user.update({
      where: { id: vendedor.id },
      data: {
        password: hashedPassword,
        isActive: true,
      }
    });

    console.log('\n✅ Contraseña actualizada exitosamente!');
    console.log('\n📋 CREDENCIALES DEL VENDEDOR:');
    console.log('='.repeat(80));
    console.log(`   Email:    ${vendedor.email}`);
    console.log(`   Username: ${vendedor.username}`);
    console.log(`   Password: ${newPassword}`);
    console.log('='.repeat(80));
    console.log('\n⚠️  ADVERTENCIA: Esta contraseña es solo para desarrollo/pruebas');
    console.log('   NO usar en producción\n');

  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetVendedorPassword();
