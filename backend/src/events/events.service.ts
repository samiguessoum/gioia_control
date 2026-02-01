import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async log(type: string, payload: Record<string, any>) {
    return this.prisma.eventLog.create({ data: { type, payload } });
  }
}
