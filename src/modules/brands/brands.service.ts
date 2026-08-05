//REF crea slug automaticamente
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';

import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateBrandDto) {
    const slug = slugify(dto.name, {
      lower: true,
      strict: true,
      locale: 'es',
    });

    const exists =
      await this.prisma.brand.findFirst({
        where: {
          OR: [
            { name: dto.name },
            { slug },
          ],
        },
      });

    if (exists) {
      throw new ConflictException(
        'La marca ya existe.',
      );
    }

    return this.prisma.brand.create({
      data: {
        ...dto,
        slug,
      },
    });
  }

  //agregamos metod publico
  async findAllPublic() {
  return this.prisma.brand.findMany({
    where: {
      deletedAt: null,
      active: true,
    },
    orderBy: { name: 'asc' },
  });
}

  async findAll() {
    return this.prisma.brand.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const brand =
      await this.prisma.brand.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

    if (!brand) {
      throw new NotFoundException(
        'Marca no encontrada.',
      );
    }

    return brand;
  }

  async update(
    id: string,
    dto: UpdateBrandDto,
  ) {
    await this.findOne(id);

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo.',
      );
    }

    const data: Prisma.BrandUpdateInput = {
      ...dto,
    };

    if (dto.name) {
      data.slug = slugify(dto.name, {
        lower: true,
        strict: true,
        locale: 'es',
      });
    }

    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.brand.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findOrCreate(
    data: {
      id?: string;
      name?: string;
    },
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    if (data.id) {
      return this.findOne(data.id);
    }

    if (!data.name) {
      throw new BadRequestException(
        'Para crear una marca nueva se requiere name.',
      );
    }

    const slug = slugify(data.name, {
      lower: true,
      strict: true,
      locale: 'es',
    });

    const exists = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug },
        ],
      },
    });

    if (exists) {
      return exists;
    }

    return prisma.brand.create({
      data: {
        name: data.name,
        slug,
      },
    });
  }
}