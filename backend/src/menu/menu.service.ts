import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  listCategories() {
    return this.prisma.menuCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { items: true },
    });
  }

  listActiveItems() {
    return this.prisma.menuItem.findMany({
      where: { isAvailable: true, category: { isActive: true } },
      orderBy: { name: 'asc' },
    });
  }

  listAllItems() {
    return this.prisma.menuItem.findMany({
      orderBy: { name: 'asc' },
      include: { category: true },
    });
  }

  createCategory(data: Prisma.MenuCategoryCreateInput) {
    return this.prisma.menuCategory.create({ data });
  }

  updateCategory(id: string, data: Prisma.MenuCategoryUpdateInput) {
    return this.prisma.menuCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    // Supprimer les orderItems liés aux items de cette catégorie
    const items = await this.prisma.menuItem.findMany({
      where: { categoryId: id },
      select: { id: true },
    });
    const itemIds = items.map((i) => i.id);

    if (itemIds.length > 0) {
      await this.prisma.orderItem.deleteMany({
        where: { menuItemId: { in: itemIds } },
      });
      await this.prisma.menuItem.deleteMany({
        where: { categoryId: id },
      });
    }

    return this.prisma.menuCategory.delete({ where: { id } });
  }

  createItem(data: Prisma.MenuItemCreateInput) {
    return this.prisma.menuItem.create({ data });
  }

  updateItem(id: string, data: Prisma.MenuItemUpdateInput) {
    return this.prisma.menuItem.update({ where: { id }, data });
  }

  async deleteItem(id: string) {
    // Supprimer les orderItems qui référencent ce produit
    await this.prisma.orderItem.deleteMany({ where: { menuItemId: id } });
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
