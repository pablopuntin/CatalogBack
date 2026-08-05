import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InstallDto {
  @ApiProperty({ example: 'root@tudominio.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiPasswordSegura123*' })
  @IsString()
  @MinLength(8)
  password: string;
}