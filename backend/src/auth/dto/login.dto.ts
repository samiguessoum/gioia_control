import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class LoginDto {
  @ValidateIf((o) => !!o.email)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !!o.email)
  @IsString()
  @MinLength(4)
  password?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsOptional()
  name?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsOptional()
  pin?: string;
}
