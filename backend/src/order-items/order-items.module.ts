import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { OrdersModule } from '../orders/orders.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [OrdersModule, EventsModule],
  providers: [OrderItemsService],
  controllers: [OrderItemsController],
})
export class OrderItemsModule {}
