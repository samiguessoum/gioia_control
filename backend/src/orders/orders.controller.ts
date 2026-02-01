import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Role } from '@prisma/client';
import { AddOrderItemDto } from './dto/add-order-item.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post(':orderId/items')
  @Roles(Role.SERVEUR, Role.ADMIN)
  addItem(@Param('orderId') orderId: string, @Body() body: AddOrderItemDto) {
    return this.orders.addItem(orderId, body);
  }

  @Post(':orderId/send')
  @Roles(Role.SERVEUR, Role.ADMIN)
  send(@Param('orderId') orderId: string) {
    return this.orders.sendOrder(orderId);
  }

  @Get(':orderId')
  @Roles(Role.SERVEUR, Role.ADMIN)
  get(@Param('orderId') orderId: string) {
    return this.orders.getOrder(orderId);
  }

  @Post(':orderId/close')
  @Roles(Role.SERVEUR, Role.ADMIN)
  close(@Param('orderId') orderId: string) {
    return this.orders.closeOrder(orderId);
  }
}
