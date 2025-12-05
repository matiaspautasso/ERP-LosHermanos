const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function activateUser() {
  try {
    // Activar el usuario
    const user = await prisma.user.update({
      where: {
        email: 'matiaspautasso@outlook.com',
      },
      data: {
        isActive: true,
      },
    });

    console.log('✅ Usuario activado exitosamente:');
    console.log({
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('❌ Error al activar usuario:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

activateUser();
