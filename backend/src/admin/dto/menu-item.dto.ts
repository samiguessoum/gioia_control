import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { MenuItemType } from '@prisma/client';

export class MenuItemDto {
  @IsString()
  categoryId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  recipeText?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsOptional()
  vatRate?: number;

  @IsEnum(MenuItemType)
  type!: MenuItemType;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
