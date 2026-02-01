const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const [name, pin, roleArg] = process.argv.slice(2);
  if (!name || !pin) {
    console.error('Usage: node scripts/create-user.js "<name>" "<pin>" [SERVEUR|CUISINE|BAR|ADMIN]');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const pinHash = await bcrypt.hash(pin, 10);
  const role = roleArg && Role[roleArg] ? Role[roleArg] : Role.SERVEUR;

  const user = await prisma.user.create({
    data: {
      name,
      pinHash,
      role,
      isActive: true,
    },
  });

  console.log('Created:', { id: user.id, name: user.name, role: user.role });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
