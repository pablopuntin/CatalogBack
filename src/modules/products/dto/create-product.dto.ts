//ref con categoryId
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ArrayMinSize,
  IsIn,
  ValidateNested
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';


export class ProductSpecDto {
  @ApiProperty({ example: 'Cantidad de puertas' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: '4' })
  @IsString()
  @IsNotEmpty()
  value: string;
}


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

  @ApiPropertyOptional({ example: true, description: 'Producto destacado' })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: 'PERCENTAGE',
    enum: ['PERCENTAGE', 'FIXED', 'TWO_FOR_ONE'],
    description: 'Tipo de descuento. null = sin descuento',
  })
  @IsOptional()
  @IsIn(['PERCENTAGE', 'FIXED', 'TWO_FOR_ONE', null])
  discountType?: 'PERCENTAGE' | 'FIXED' | 'TWO_FOR_ONE' | null;

  @ApiPropertyOptional({ example: 20, description: 'Valor del descuento' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discountValue?: number | null;

  @ApiPropertyOptional({
    type: [ProductSpecDto],
    description: 'Detalles técnicos (pares etiqueta/valor)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecDto)
  specs?: ProductSpecDto[];
}
