const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('\n🔐 RESET DE CONTRASEÑA DEL USUARIO ADMIN\n');
    console.log('='.repeat(80));

    // Buscar el usuario admin
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@loshermanos.com' },
          { username: 'admin' }
        ]
      }
    });

    if (!admin) {
      console.log('❌ No se encontró el usuario admin');
      return;
    }

    console.log(`\n✅ Usuario encontrado:`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Estado: ${admin.isActive ? 'ACTIVO' : 'INACTIVO'}`);
    console.log(`\n🔄 Hash actual de contraseña:`);
    console.log(`   ${admin.password.substring(0, 50)}...`);

    // Generar nueva contraseña
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`\n🔑 Generando nuevo hash para: "${newPassword}"`);
    console.log(`   ${hashedPassword.substring(0, 50)}...`);

    // Actualizar contraseña y asegurar que está activo
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        isActive: true,
      }
    });

    console.log('\n✅ Contraseña actualizada exitosamente!');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('='.repeat(80));
    console.log(`   Email: ${admin.email}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: ${newPassword}`);
    console.log('='.repeat(80));
    
    // Verificar que la nueva contraseña funciona
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`\n🧪 Verificación: ${isValid ? '✅ Password válido' : '❌ Error en password'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
