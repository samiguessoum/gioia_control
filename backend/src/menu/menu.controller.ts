import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { MenuService } from './menu.service';

@Controller('menu')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MenuController {
  constructor(private menu: MenuService) {}

  @Get('categories')
  @Roles(Role.SERVEUR, Role.ADMIN)
  listCategories() {
    return this.menu.listCategories();
  }

  @Get('items')
  @Roles(Role.SERVEUR, Role.ADMIN)
  listItems() {
    return this.menu.listActiveItems();
  }
}
