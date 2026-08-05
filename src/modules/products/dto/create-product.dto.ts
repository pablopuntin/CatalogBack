//ref con categoryId
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Zapatilla Running X' })
  @IsString()
  @IsNotEmpty()
  name: string;

 

  @ApiPropertyOptional({ example: 'Descripción del producto' })
  @IsOptional()
  @IsString()
  description?: string;


  @ApiProperty({ example: 49999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @ApiProperty({ example: 'cuid-de-la-marca' })
  @IsString()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({
    example: ['cuid-categoria-1', 'cuid-categoria-2'],
    description: 'Al menos una categoría requerida',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  categoryIds: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}