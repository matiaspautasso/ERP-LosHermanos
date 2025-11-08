const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a Supabase...\n');

    // Test connection
    await prisma.$connect();
    console.log('✅ Conexión a Supabase exitosa\n');

    // Get PostgreSQL version
    const version = await prisma.$queryRaw`SELECT version() as version`;
    console.log('📊 PostgreSQL Version:');
    console.log(version[0].version);
    console.log('\n');

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📋 Tablas en la base de datos:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    console.log('\n');

    // Count users
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM usuarios`;
    console.log(`👥 Total de usuarios: ${userCount[0].count}\n`);

    // Get database URL (masked)
    const dbUrl = process.env.DATABASE_URL;
    const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
    console.log('🔗 Database URL:', maskedUrl);

    console.log('\n✅ Todas las verificaciones pasaron correctamente');

  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
