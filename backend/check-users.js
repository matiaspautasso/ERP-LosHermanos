const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n📋 USUARIOS EN LA BASE DE DATOS:\n');
    console.log('='.repeat(100));

    if (users.length === 0) {
      console.log('No hay usuarios registrados.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Usuario ID: ${user.id.toString()}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Estado: ${user.isActive ? '✅ ACTIVO' : '❌ INACTIVO'}`);
        console.log(`   Creado: ${user.createdAt.toLocaleString()}`);
        console.log(`   Último login: ${user.lastLogin ? user.lastLogin.toLocaleString() : 'Nunca'}`);
        console.log('-'.repeat(100));
      });

      console.log(`\n📊 Total de usuarios: ${users.length}`);
      console.log(`✅ Usuarios activos: ${users.filter(u => u.isActive).length}`);
      console.log(`❌ Usuarios inactivos: ${users.filter(u => !u.isActive).length}`);

      // Activar TODOS los usuarios
      console.log('\n🔄 Activando TODOS los usuarios...\n');

      const result = await prisma.user.updateMany({
        data: {
          isActive: true,
        },
      });

      console.log(`✅ ${result.count} usuarios activados exitosamente\n`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
