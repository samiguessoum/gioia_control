import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderItemsGateway } from './orders.gateway';
import { EventsService } from '../events/events.service';
import { MenuItemType, OrderStatus, OrderItemStatus, Station, TableStatus } from '@prisma/client';
import { AddOrderItemDto } from './dto/add-order-item.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private gateway: OrderItemsGateway,
    private events: EventsService,
  ) {}

  async openOrderForTable(tableId: string, userId: string) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    const existing = await this.prisma.order.findFirst({
      where: { tableId, status: { in: [OrderStatus.OPEN, OrderStatus.SENT] } },
      include: { items: true },
    });

    if (existing) {
      return existing;
    }

    const order = await this.prisma.order.create({
      data: {
        tableId,
        status: OrderStatus.OPEN,
        createdByUserId: userId,
      },
      include: { items: true },
    });

    await this.prisma.table.update({
      where: { id: tableId },
      data: { status: TableStatus.OCCUPIED, currentOrderId: order.id },
    });

    await this.events.log('order.opened', { orderId: order.id, tableId });
    return order;
  }

  async addItem(orderId: string, dto: AddOrderItemDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.OPEN && order.status !== OrderStatus.SENT) {
      throw new BadRequestException('Order is closed');
    }

    const menuItem = await this.prisma.menuItem.findUnique({ where: { id: dto.menuItemId } });
    if (!menuItem || !menuItem.isAvailable) {
      throw new BadRequestException('Menu item unavailable');
    }

    const station: Station = menuItem.type === MenuItemType.DRINK ? Station.BAR : Station.KITCHEN;

    const item = await this.prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuItemId: menuItem.id,
        nameSnapshot: menuItem.name,
        priceCentsSnapshot: menuItem.priceCents,
        quantity: dto.quantity,
        notes: dto.notes,
        station,
        status: OrderItemStatus.NEW,
      },
    });

    await this.events.log('order.item.added', { orderId: order.id, itemId: item.id });

    if (order.status === OrderStatus.SENT) {
      this.gateway.emitToStation(station, 'station:new_item', {
        orderId: order.id,
        tableId: order.tableId,
        item,
      });
      this.gateway.emitToTable(order.tableId, 'table:item_update', { item });
    }

    return item;
  }

  async sendOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, table: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === OrderStatus.CLOSED) {
      throw new BadRequestException('Order already closed');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SENT },
      include: { items: true, table: true },
    });

    const kitchenItems = updated.items.filter((i) => i.station === Station.KITCHEN);
    const barItems = updated.items.filter((i) => i.station === Station.BAR);

    if (kitchenItems.length > 0) {
      this.gateway.emitToStation('KITCHEN', 'station:new_items', {
        orderId,
        tableId: order.tableId,
        items: kitchenItems,
      });
    }
    if (barItems.length > 0) {
      this.gateway.emitToStation('BAR', 'station:new_items', {
        orderId,
        tableId: order.tableId,
        items: barItems,
      });
    }

    this.gateway.emitToTable(order.tableId, 'table:order_sent', {
      orderId,
      items: updated.items,
    });

    await this.events.log('order.sent', { orderId, tableId: order.tableId });
    return updated;
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, table: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async closeOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.prisma.orderItem.deleteMany({ where: { orderId } });

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CLOSED, closedAt: new Date() },
    });

    await this.prisma.table.update({
      where: { id: order.tableId },
      data: { status: TableStatus.FREE, currentOrderId: null },
    });

    await this.events.log('order.closed', { orderId, tableId: order.tableId });
    this.gateway.emitToTable(order.tableId, 'table:order_closed', { orderId });
    return updated;
  }
}
