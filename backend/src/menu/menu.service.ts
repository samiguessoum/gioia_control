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

  deleteCategory(id: string) {
    return this.prisma.menuCategory.delete({ where: { id } });
  }

  createItem(data: Prisma.MenuItemCreateInput) {
    return this.prisma.menuItem.create({ data });
  }

  updateItem(id: string, data: Prisma.MenuItemUpdateInput) {
    return this.prisma.menuItem.update({ where: { id }, data });
  }

  deleteItem(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
