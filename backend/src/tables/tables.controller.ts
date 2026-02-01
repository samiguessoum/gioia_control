import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TablesService } from './tables.service';
import { OrdersService } from '../orders/orders.service';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Role } from '@prisma/client';

@Controller('tables')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TablesController {
  constructor(private tables: TablesService, private orders: OrdersService) {}

  @Get()
  @Roles(Role.SERVEUR, Role.ADMIN)
  async list() {
    return this.tables.listWithIndicators();
  }

  @Post(':tableId/open-order')
  @Roles(Role.SERVEUR, Role.ADMIN)
  async openOrder(@Param('tableId') tableId: string, @Req() req: any) {
    return this.orders.openOrderForTable(tableId, req.user.sub);
  }
}
