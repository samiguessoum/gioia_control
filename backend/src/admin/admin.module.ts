import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin.users.controller';
import { AdminMenuController } from './admin.menu.controller';
import { AdminTablesController } from './admin.tables.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [MenuModule],
  providers: [PrismaService],
  controllers: [AdminUsersController, AdminMenuController, AdminTablesController],
})
export class AdminModule {}
