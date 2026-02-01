import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderItemStatus, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { OrderItemsGateway } from '../orders/orders.gateway';

@Injectable()
export class OrderItemsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
    private gateway: OrderItemsGateway,
  ) {}

  async updateStatus(id: string, status: OrderItemStatus) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!item) {
      throw new NotFoundException('Order item not found');
    }
    if (item.order.status === OrderStatus.CLOSED) {
      throw new BadRequestException('Order closed');
    }

    const updated = await this.prisma.orderItem.update({
      where: { id },
      data: { status },
    });

    await this.events.log('order.item.status', { id, status });
    this.gateway.emitToTable(item.order.tableId, 'table:item_update', { item: updated });
    this.gateway.emitToStation(item.station, 'station:item_update', { item: updated });
    return updated;
  }
}
