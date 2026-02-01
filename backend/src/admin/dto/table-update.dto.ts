import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { TableStatus } from '@prisma/client';

export class TableUpdateDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}
