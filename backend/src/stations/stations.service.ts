import { Injectable } from '@nestjs/common';
import { OrderStatus, Station } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  async getQueue(station: Station) {
    const items = await this.prisma.orderItem.findMany({
      where: {
        station,
        order: { status: OrderStatus.SENT },
        status: { in: ['NEW', 'IN_PROGRESS'] },
      },
      include: {
        order: { include: { table: true } },
        menuItem: true,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    });

    return items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      tableId: item.order.tableId,
      tableNumber: item.order.table.number,
      nameSnapshot: item.nameSnapshot,
      quantity: item.quantity,
      notes: item.notes,
      status: item.status,
      createdAt: item.createdAt,
      recipeText: item.menuItem.recipeText,
      imageUrl: item.menuItem.imageUrl,
    }));
  }
}
