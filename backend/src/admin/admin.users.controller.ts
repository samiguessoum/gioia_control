import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminUsersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles(Role.ADMIN)
  list() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() body: CreateUserDto) {
    const passwordHash = body.password ? await bcrypt.hash(body.password, 10) : null;
    const pinHash = body.pin ? await bcrypt.hash(body.pin, 10) : null;

    return this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        pinHash,
        role: body.role,
        isActive: body.isActive ?? true,
      },
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const passwordHash = body.password ? await bcrypt.hash(body.password, 10) : undefined;
    const pinHash = body.pin ? await bcrypt.hash(body.pin, 10) : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        pinHash,
        role: body.role,
        isActive: body.isActive,
      },
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
