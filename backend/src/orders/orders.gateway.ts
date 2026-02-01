import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrderItemsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join')
  handleJoin(client: any, payload: { room: string }) {
    if (payload?.room) {
      client.join(payload.room);
    }
  }

  emitToStation(station: 'KITCHEN' | 'BAR', event: string, payload: any) {
    this.server.to(`station:${station.toLowerCase()}`).emit(event, payload);
  }

  emitToTable(tableId: string, event: string, payload: any) {
    this.server.to(`table:${tableId}`).emit(event, payload);
  }

  emitToAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
