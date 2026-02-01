import { PrismaClient, Role, MenuItemType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingTables = await prisma.table.count();
  if (existingTables === 0) {
    await prisma.table.createMany({
      data: Array.from({ length: 15 }).map((_, idx) => ({ number: idx + 1 })),
    });
  }

  const [catPizza, catPasta, catDessert, catDrink] = await Promise.all([
    prisma.menuCategory.create({ data: { name: 'Pizzas', sortOrder: 1 } }),
    prisma.menuCategory.create({ data: { name: 'Pates', sortOrder: 2 } }),
    prisma.menuCategory.create({ data: { name: 'Desserts', sortOrder: 3 } }),
    prisma.menuCategory.create({ data: { name: 'Boissons', sortOrder: 4 } }),
  ]);

  await prisma.menuItem.createMany({
    data: [
      { name: 'Margherita', description: 'Tomate, mozzarella, basilic', priceCents: 900, type: MenuItemType.FOOD, categoryId: catPizza.id, isAvailable: true },
      { name: 'Diavola', description: 'Tomate, mozzarella, salami piment', priceCents: 1200, type: MenuItemType.FOOD, categoryId: catPizza.id, isAvailable: true },
      { name: 'Quattro Formaggi', description: 'Mozzarella, gorgonzola, parmesan', priceCents: 1300, type: MenuItemType.FOOD, categoryId: catPizza.id, isAvailable: true },
      { name: 'Carbonara', description: 'Oeuf, guanciale, pecorino', priceCents: 1400, type: MenuItemType.FOOD, categoryId: catPasta.id, isAvailable: true },
      { name: 'Bolognese', description: 'Ragout de boeuf', priceCents: 1350, type: MenuItemType.FOOD, categoryId: catPasta.id, isAvailable: true },
      { name: 'Tiramisu', description: 'Cafe, mascarpone', priceCents: 700, type: MenuItemType.FOOD, categoryId: catDessert.id, isAvailable: true },
      { name: 'Panna Cotta', description: 'Vanille, coulis fruits rouges', priceCents: 650, type: MenuItemType.FOOD, categoryId: catDessert.id, isAvailable: true },
      { name: 'Coca-Cola', description: '33cl', priceCents: 300, type: MenuItemType.DRINK, categoryId: catDrink.id, isAvailable: true },
      { name: 'Eau Plate', description: '50cl', priceCents: 200, type: MenuItemType.DRINK, categoryId: catDrink.id, isAvailable: true },
      { name: 'Spritz', description: 'Aperol, prosecco', priceCents: 850, type: MenuItemType.DRINK, categoryId: catDrink.id, isAvailable: true },
    ],
  });

  const adminPass = await bcrypt.hash('Admin1234', 10);
  const serverPin = await bcrypt.hash('1234', 10);
  const kitchenPin = await bcrypt.hash('5678', 10);
  const barPin = await bcrypt.hash('9012', 10);

  await prisma.user.createMany({
    data: [
      { name: 'Admin', email: 'admin@gioia.local', passwordHash: adminPass, role: Role.ADMIN, isActive: true },
      { name: 'Serveur', pinHash: serverPin, role: Role.SERVEUR, isActive: true },
      { name: 'Cuisine', pinHash: kitchenPin, role: Role.CUISINE, isActive: true },
      { name: 'Bar', pinHash: barPin, role: Role.BAR, isActive: true },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
