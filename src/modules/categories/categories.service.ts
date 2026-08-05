//REF sin slug
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import slugify from 'slugify';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, {
      lower: true,
      strict: true,
      locale: 'es',
    });

    const exists =
      await this.prisma.category.findUnique({
        where: {
          slug,
        },
      });

    if (exists) {
      throw new ConflictException(
        'Ya existe una categoría con ese nombre.',
      );
    }

    return this.prisma.category.create({
      data: {
        ...dto,
        slug,
      },
    });
  }

  //Agregamos metodos para catalogo publico
  async findAllPublic() {
  return this.prisma.category.findMany({
    where: {
      deletedAt: null,
      active: true,
    },
    orderBy: { name: 'asc' },
  });
}


  async findAll() {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const category =
      await this.prisma.category.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Categoría no encontrada.',
      );
    }

    return category;
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ) {
    await this.findOne(id);

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo.',
      );
    }

    const data: Prisma.CategoryUpdateInput = {
      ...dto,
    };

    if (dto.name) {
      const slug = slugify(dto.name, {
        lower: true,
        strict: true,
        locale: 'es',
      });

      const exists =
        await this.prisma.category.findFirst({
          where: {
            slug,
            NOT: {
              id,
            },
          },
        });

      if (exists) {
        throw new ConflictException(
          'Ya existe una categoría con ese nombre.',
        );
      }

      data.slug = slug;
    }

    return this.prisma.category.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: {
        id,
      },
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
        'Para crear una categoría nueva se requiere name.',
      );
    }

    const slug = slugify(data.name, {
      lower: true,
      strict: true,
      locale: 'es',
    });

    const exists =
      await prisma.category.findUnique({
        where: {
          slug,
        },
      });

    if (exists) {
      return exists;
    }

    return prisma.category.create({
      data: {
        name: data.name,
        slug,
      },
    });
  }
}