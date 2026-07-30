import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusinessConfigDto } from './dto/create-business-config.dto';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';

@Injectable()
export class BusinessConfigService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(createBusinessConfigDto: CreateBusinessConfigDto) {
    const existing = await this.prisma.businessConfig.findFirst();

    if (existing) {
      throw new ConflictException(
        'La configuración del negocio ya existe.',
      );
    }

    return this.prisma.businessConfig.create({
      data: createBusinessConfigDto,
    });
  }

  async find() {
    const businessConfig = await this.prisma.businessConfig.findFirst();

    if (!businessConfig) {
      throw new NotFoundException(
        'No existe una configuración del negocio.',
      );
    }

    return businessConfig;
  }

  async update(updateBusinessConfigDto: UpdateBusinessConfigDto) {
    const businessConfig = await this.prisma.businessConfig.findFirst();

    if (!businessConfig) {
      throw new NotFoundException(
        'No existe una configuración del negocio.',
      );
    }

    if (Object.keys(updateBusinessConfigDto).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar.',
      );
    }

    return this.prisma.businessConfig.update({
      where: {
        id: businessConfig.id,
      },
      data: updateBusinessConfigDto,
    });
  }
}