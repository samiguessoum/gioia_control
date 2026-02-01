import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { EventsModule } from '../events/events.module';
import { OrderItemsGateway } from './orders.gateway';

@Module({
  imports: [EventsModule],
  providers: [OrdersService, OrderItemsGateway],
  controllers: [OrdersController],
  exports: [OrdersService, OrderItemsGateway],
})
export class OrdersModule {}
