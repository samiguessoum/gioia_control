import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TableDto } from './dto/table.dto';
import { TableUpdateDto } from './dto/table-update.dto';

@Controller('admin/tables')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminTablesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles(Role.ADMIN)
  list() {
    return this.prisma.table.findMany({ orderBy: { number: 'asc' } });
  }

  @Post('init')
  @Roles(Role.ADMIN)
  async init(@Query('count') count?: string) {
    const total = Number(count ?? 15);
    const existing = await this.prisma.table.count();
    if (existing > 0) {
      return { ok: true, created: 0 };
    }
    const data = Array.from({ length: total }).map((_, idx) => ({ number: idx + 1 }));
    await this.prisma.table.createMany({ data });
    return { ok: true, created: total };
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: TableDto) {
    return this.prisma.table.create({ data: { number: body.number, status: body.status ?? 'FREE' } });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() body: TableUpdateDto) {
    return this.prisma.table.update({
      where: { id },
      data: { number: body.number, status: body.status },
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.prisma.table.delete({ where: { id } });
  }
}
