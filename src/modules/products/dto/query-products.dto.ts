import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ description: 'Slug de la categoría' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Slug de la marca' })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional({ description: '1 = solo productos con descuento' })
  @IsOptional()
  @IsString()
  oferta?: string;

  @ApiPropertyOptional({ description: '1 = solo destacados' })
  @IsOptional()
  @IsString()
  destacado?: string;

  @ApiPropertyOptional({ description: 'Buscar por nombre' })
  @IsOptional()
  @IsString()
  q?: string;
}