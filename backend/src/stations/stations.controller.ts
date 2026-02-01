import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role, Station } from '@prisma/client';
import { StationsService } from './stations.service';

@Controller('station')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StationsController {
  constructor(private stations: StationsService) {}

  @Get('kitchen/queue')
  @Roles(Role.CUISINE, Role.ADMIN)
  kitchenQueue() {
    return this.stations.getQueue(Station.KITCHEN);
  }

  @Get('bar/queue')
  @Roles(Role.BAR, Role.ADMIN)
  barQueue() {
    return this.stations.getQueue(Station.BAR);
  }
}
