import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { OrderItemsService } from './order-items.service';
import { UpdateOrderItemStatusDto } from './dto/update-status.dto';

@Controller('order-items')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrderItemsController {
  constructor(private items: OrderItemsService) {}

  @Patch(':id/status')
  @Roles(Role.BAR, Role.CUISINE, Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: UpdateOrderItemStatusDto) {
    return this.items.updateStatus(id, body.status);
  }
}
