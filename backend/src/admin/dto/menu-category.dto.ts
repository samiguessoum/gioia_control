import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class MenuCategoryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
