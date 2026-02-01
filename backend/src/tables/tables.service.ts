import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async listWithIndicators() {
    const tables = await this.prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        currentOrder: {
          include: { items: true },
        },
      },
    });

    return tables.map((table) => {
      const items = table.currentOrder?.items ?? [];
      const newCount = items.filter((i) => i.status === 'NEW').length;
      const inProgress = items.filter((i) => i.status === 'IN_PROGRESS').length;
      const done = items.filter((i) => i.status === 'DONE').length;
      return {
        id: table.id,
        number: table.number,
        status: table.status,
        currentOrderId: table.currentOrderId,
        indicators: { newCount, inProgress, done },
      };
    });
  }

  async getById(id: string) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }
}
