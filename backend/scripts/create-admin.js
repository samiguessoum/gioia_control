const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error('Usage: node scripts/create-admin.js "<name>" "<email>" "<password>"');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log('Created admin:', { id: user.id, name: user.name, email: user.email });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
