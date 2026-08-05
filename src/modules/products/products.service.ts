import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import slugify from 'slugify';
import { PrismaService } from '../../prisma/prisma.service';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateSkuBase, buildSku, buildSkuWithSuffix } from 'src/common/helpers/sku.helper';


@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  //Helper para crear automaticamente los SKU
  private async generateUniqueSku(name: string): Promise<string> {
  const base = generateSkuBase(name);

  // Busca todos los SKUs que empiecen con esa base
  const existing = await this.prisma.product.findMany({
    where: {
      sku: { startsWith: base },
    },
    select: { sku: true },
  });

  const existingSkus = new Set(existing.map((p) => p.sku));

  // Intenta con secuencia numérica primero: ZAP-RUN-001, ZAP-RUN-002...
  for (let seq = 1; seq <= 999; seq++) {
    const candidate = buildSku(base, seq);
    if (!existingSkus.has(candidate)) {
      return candidate;
    }

    // Si el número ya está ocupado, prueba con sufijos: ZAP-RUN-001-B...
    for (let s = 0; s < 26; s++) {
      const withSuffix = buildSkuWithSuffix(base, seq, s);
      if (!existingSkus.has(withSuffix)) {
        return withSuffix;
      }
    }
  }

  // Caso extremo — no debería llegar acá nunca
  throw new Error(`No se pudo generar un SKU único para: ${name}`);
}



  //REF usando helper para crear SKU automatico
  async create(dto: CreateProductDto) {
  await this.brandsService.findOne(dto.brandId);

  for (const categoryId of dto.categoryIds) {
    await this.categoriesService.findOne(categoryId);
  }

  const slug = slugify(dto.name, {
    lower: true,
    strict: true,
    locale: 'es',
  });

  const sku = await this.generateUniqueSku(dto.name);

  const existing = await this.prisma.product.findFirst({
    where: { slug },
  });

  if (existing) {
    throw new ConflictException(
      'Ya existe un producto con ese nombre.',
    );
  }

  const { categoryIds, ...productData } = dto;

  return this.prisma.product.create({
    data: {
      ...productData,
      slug,
      sku,
      categories: {
        create: categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
    },
    include: {
      brand: true,
      categories: {
        include: { category: true },
      },
    },
  });
}

//Agregamos metodos para catalogo publico, para filtrar y mostrar solo productos activos y que no se hayan eliminados
// async findAllPublic() {
//   return this.prisma.product.findMany({
//     where: {
//       deletedAt: null,
//       active: true,
//     },
//     include: {
//       brand: true,
//       categories: { include: { category: true } },
//       images: { orderBy: { sortOrder: 'asc' } },
//     },
//     orderBy: { name: 'asc' },
//   });
// }

// async findOnePublic(slug: string) {
//   const product = await this.prisma.product.findFirst({
//     where: {
//       slug,
//       deletedAt: null,
//       active: true,
//     },
//     include: {
//       brand: true,
//       categories: { include: { category: true } },
//       images: { orderBy: { sortOrder: 'asc' } },
//     },
//   });

//   if (!product) {
//     throw new NotFoundException('Producto no encontrado.');
//   }

//   return product;
// }


//ref con el calculo si del precio final si hay promocion
async findAllPublic() {
  const now = new Date();

  const products = await this.prisma.product.findMany({
    where: {
      deletedAt: null,
      active: true,
    },
    include: {
      brand: true,
      categories: { include: { category: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      promotions: {
        include: {
          promotion: true,
        },
        where: {
          promotion: {
            deletedAt: null,
            active: true,
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
            AND: [
              {
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
              },
            ],
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return products.map((product) =>
    this.applyPromotion(product),
  );
}

async findOnePublic(slug: string) {
  const now = new Date();

  const product = await this.prisma.product.findFirst({
    where: {
      slug,
      deletedAt: null,
      active: true,
    },
    include: {
      brand: true,
      categories: { include: { category: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      promotions: {
        include: { promotion: true },
        where: {
          promotion: {
            deletedAt: null,
            active: true,
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
            AND: [
              {
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
              },
            ],
          },
        },
      },
    },
  });

  if (!product) {
    throw new NotFoundException('Producto no encontrado.');
  }

  return this.applyPromotion(product);
}

private applyPromotion(product: any) {
  const activePromotion = product.promotions?.[0]?.promotion ?? null;

  if (!activePromotion) {
    return {
      ...product,
      finalPrice: null,
      promotion: null,
    };
  }

  let finalPrice: number | null = null;
  const price = parseFloat(product.price);

  switch (activePromotion.type) {
    case 'PERCENTAGE':
      if (activePromotion.discountValue) {
        finalPrice =
          price - (price * parseFloat(activePromotion.discountValue)) / 100;
      }
      break;
    case 'FIXED':
      if (activePromotion.discountValue) {
        finalPrice = price - parseFloat(activePromotion.discountValue);
        if (finalPrice < 0) finalPrice = 0;
      }
      break;
    case 'TWO_FOR_ONE':
      finalPrice = price / 2;
      break;
    case 'FEATURED':
      finalPrice = null;
      break;
  }

  return {
    ...product,
    finalPrice: finalPrice !== null ? finalPrice.toFixed(2) : null,
    promotion: {
      id: activePromotion.id,
      name: activePromotion.name,
      type: activePromotion.type,
      discountValue: activePromotion.discountValue,
    },
  };
}

  async findAll() {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const product =
      await this.prisma.product.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          brand: true,
          categories: {
            include: {
              category: true,
            },
          },
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Producto no encontrado.',
      );
    }

    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ) {
    await this.findOne(id);

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo.',
      );
    }

    if (dto.brandId) {
      await this.brandsService.findOne(dto.brandId);
    }

    if (dto.categoryIds) {
      for (const categoryId of dto.categoryIds) {
        await this.categoriesService.findOne(categoryId);
      }
    }

    const { categoryIds, ...productData } =
      dto as UpdateProductDto & {
        categoryIds?: string[];
      };

    const data: any = {
      ...productData,
    };

    if (dto.name) {
      const slug = slugify(dto.name, {
        lower: true,
        strict: true,
        locale: 'es',
      });

      const exists =
        await this.prisma.product.findFirst({
          where: {
            slug,
            NOT: {
              id,
            },
          },
        });

      if (exists) {
        throw new ConflictException(
          'Ya existe un producto con ese nombre.',
        );
      }

      data.slug = slug;
    }

    if (categoryIds) {
      data.categories = {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({
          categoryId,
        })),
      };
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data,
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  //metodos para filtras activos e inactivos
  async findAllActive() {
  return this.prisma.product.findMany({
    where: {
      deletedAt: null,
      active: true,
    },
    include: {
      brand: true,
      categories: { include: { category: true } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { name: 'asc' },
  });
}

async findAllInactiveAndDeleted() {
  const [inactive, deleted] = await Promise.all([
    this.prisma.product.findMany({
      where: {
        deletedAt: null,
        active: false,
      },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { name: 'asc' },
    }),
    this.prisma.product.findMany({
      where: {
        deletedAt: { not: null },
      },
      include: {
        brand: true,
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { deletedAt: 'desc' },
    }),
  ]);

  return [...inactive, ...deleted];
}

async restore(id: string) {
  const product = await this.prisma.product.findFirst({
    where: { id },
  });

  if (!product) {
    throw new NotFoundException('Producto no encontrado.');
  }

  return this.prisma.product.update({
    where: { id },
    data: {
      deletedAt: null,
      active: true,
    },
  });
}

}