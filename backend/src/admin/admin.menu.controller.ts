import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { MenuService } from '../menu/menu.service';
import { MenuCategoryDto } from './dto/menu-category.dto';
import { MenuCategoryUpdateDto } from './dto/menu-category-update.dto';
import { MenuItemDto } from './dto/menu-item.dto';
import { MenuItemUpdateDto } from './dto/menu-item-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('admin/menu')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminMenuController {
  constructor(private menu: MenuService) {}

  @Get('categories')
  @Roles(Role.ADMIN)
  listCategories() {
    return this.menu.listCategories();
  }

  @Post('categories')
  @Roles(Role.ADMIN)
  createCategory(@Body() body: MenuCategoryDto) {
    return this.menu.createCategory(body);
  }

  @Patch('categories/:id')
  @Roles(Role.ADMIN)
  updateCategory(@Param('id') id: string, @Body() body: MenuCategoryUpdateDto) {
    return this.menu.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @Roles(Role.ADMIN)
  deleteCategory(@Param('id') id: string) {
    return this.menu.deleteCategory(id);
  }

  @Get('items')
  @Roles(Role.ADMIN)
  listItems() {
    return this.menu.listAllItems();
  }

  @Post('items')
  @Roles(Role.ADMIN)
  createItem(@Body() body: MenuItemDto) {
    return this.menu.createItem({
      name: body.name,
      description: body.description,
      ingredients: body.ingredients,
      clientRecipe: body.clientRecipe,
      recipeText: body.recipeText,
      imageUrl: body.imageUrl,
      priceCents: body.priceCents,
      vatRate: body.vatRate,
      type: body.type,
      isAvailable: body.isAvailable ?? true,
      category: { connect: { id: body.categoryId } },
    });
  }

  @Post('upload')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, name);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      return { ok: false };
    }
    return { ok: true, url: `/uploads/${file.filename}` };
  }

  @Patch('items/:id')
  @Roles(Role.ADMIN)
  updateItem(@Param('id') id: string, @Body() body: MenuItemUpdateDto) {
    return this.menu.updateItem(id, {
      name: body.name,
      description: body.description,
      ingredients: body.ingredients,
      clientRecipe: body.clientRecipe,
      recipeText: body.recipeText,
      imageUrl: body.imageUrl,
      priceCents: body.priceCents,
      vatRate: body.vatRate,
      type: body.type,
      isAvailable: body.isAvailable,
      category: body.categoryId ? { connect: { id: body.categoryId } } : undefined,
    });
  }

  @Delete('items/:id')
  @Roles(Role.ADMIN)
  deleteItem(@Param('id') id: string) {
    return this.menu.deleteItem(id);
  }
}
