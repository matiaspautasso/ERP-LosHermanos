const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    });

    console.log('\n👥 Usuarios registrados en la base de datos:\n');
    users.forEach(u => {
      console.log(`📧 Email: ${u.email}`);
      console.log(`👤 Username: ${u.username}`);
      console.log(`🆔 ID: ${u.id}`);
      console.log(`📅 Creado: ${u.createdAt}`);
      console.log('---');
    });
    console.log(`\nTotal: ${users.length} usuarios\n`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
