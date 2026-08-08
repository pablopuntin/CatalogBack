
//ref
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ArrayMinSize,
  ValidateNested,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CatalogCategoryDto {
  @ApiPropertyOptional({ description: 'ID si ya existe' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: 'Nombre si es nueva' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class CatalogBrandDto {
  @ApiPropertyOptional({ description: 'ID si ya existe' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: 'Nombre si es nueva' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class CatalogProductDataDto {
  @ApiProperty({ example: 'Zapatilla Running X' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 49999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

@ApiPropertyOptional({ example: 'https://picsum.photos/400/400' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, description: 'Producto destacado' })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    example: 'PERCENTAGE',
    enum: ['PERCENTAGE', 'FIXED', 'TWO_FOR_ONE'],
  })
  @IsOptional()
  @IsIn(['PERCENTAGE', 'FIXED', 'TWO_FOR_ONE', null])
  discountType?: 'PERCENTAGE' | 'FIXED' | 'TWO_FOR_ONE' | null;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discountValue?: number | null;

}

export class CreateCatalogProductDto {
  @ApiProperty({
    description: 'Una o más categorías — existentes o nuevas',
    type: [CatalogCategoryDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CatalogCategoryDto)
  categories: CatalogCategoryDto[];

  @ApiProperty({
    description: 'Marca — existente o nueva',
    type: CatalogBrandDto,
  })
  @ValidateNested()
  @Type(() => CatalogBrandDto)
  brand: CatalogBrandDto;

  @ApiProperty({ type: CatalogProductDataDto })
  @ValidateNested()
  @Type(() => CatalogProductDataDto)
  product: CatalogProductDataDto;
}

export class UpdateCatalogProductDto {
  @ApiPropertyOptional({
    type: [CatalogCategoryDto],
    description: 'Categorías — existentes o nuevas',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CatalogCategoryDto)
  categories?: CatalogCategoryDto[];

  @ApiPropertyOptional({
    type: CatalogBrandDto,
    description: 'Marca — existente o nueva',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CatalogBrandDto)
  brand?: CatalogBrandDto;

  @ApiPropertyOptional({ type: CatalogProductDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CatalogProductDataDto)
  product?: CatalogProductDataDto;
}