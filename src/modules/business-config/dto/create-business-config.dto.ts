import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyCode } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateBusinessConfigDto {
  @ApiProperty({
    example: 'Torresi',
    description: 'Nombre comercial del negocio',
  })
  @IsString()
  @MaxLength(100)
  businessName: string;

  @ApiPropertyOptional({
    example: 'Torresi S.R.L.',
    description: 'Razón social',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  legalName?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/logo.png',
    description: 'URL del logo',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/hero.jpg',
    description: 'Imagen principal del catálogo',
  })
  @IsOptional()
  @IsUrl()
  heroImageUrl?: string;

  @ApiPropertyOptional({
    example: 'Más de 20 años ofreciendo productos de calidad.',
    description: 'Descripción del negocio',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  businessDescription?: string;

  @ApiProperty({
    example: '5493854123456',
    description: 'Número de WhatsApp',
  })
  @IsString()
  @MaxLength(30)
  whatsapp: string;

  @ApiPropertyOptional({
    example: '3854123456',
    description: 'Teléfono',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    example: 'contacto@torresi.com',
    description: 'Correo electrónico',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://torresi.com',
    description: 'Sitio web',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    example: 'https://facebook.com/torresi',
    description: 'Facebook',
  })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({
    example: 'https://instagram.com/torresi',
    description: 'Instagram',
  })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({
    example: 'https://tiktok.com/@torresi',
    description: 'TikTok',
  })
  @IsOptional()
  @IsUrl()
  tiktok?: string;

  @ApiPropertyOptional({
    example: 'Av. Belgrano 123',
    description: 'Dirección',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    example: 'Añatuya',
    description: 'Ciudad',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    example: 'Santiago del Estero',
    description: 'Provincia',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @ApiPropertyOptional({
    example: 'Argentina',
    description: 'País',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    enum: CurrencyCode,
    default: CurrencyCode.ARS,
    description: 'Moneda utilizada por el negocio',
  })
  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    example: 'Lunes a Viernes de 08:00 a 18:00',
    description: 'Horario de atención',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessHours?: string;
}