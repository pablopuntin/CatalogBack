import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: '20% OFF en ventiladores' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Descuento de verano' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PromotionType, example: PromotionType.PERCENTAGE })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiPropertyOptional({ example: '20.00' })
  @IsOptional()
  @IsDecimal()
  discountValue?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: '2026-08-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({
    example: ['cuid-producto-1', 'cuid-producto-2'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  productIds?: string[];
}