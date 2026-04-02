const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const username = (process.env.ADMIN_USERNAME || email).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios para criar o usuário admin.');
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      username,
      name: 'Administrador',
      phone: '00000000000',
      address: 'Painel Administrativo',
      password,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      name: 'Administrador',
      email,
      username,
      phone: '00000000000',
      address: 'Painel Administrativo',
      password,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`Admin user ensured: ${email}`);
}

main()
  .catch((error) => {
    console.error('Failed to ensure admin user:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
