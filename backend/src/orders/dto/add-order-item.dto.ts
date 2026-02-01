import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class AddOrderItemDto {
  @IsString()
  menuItemId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
