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

 const { categoryIds, featured, discountType, discountValue, ...productData } = dto;

  const created = await this.prisma.product.create({
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

  await this.syncPromotions(created.id, created.name, {
    featured,
    discountType,
    discountValue,
  });

  return created;
}


//Agregamos metodos para catalogo publico, para filtrar y mostrar solo productos activos y que no se hayan eliminados
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


//ref
private applyPromotion(product: any) {
  // Todas las promos activas del producto (ya vienen filtradas por activas)
  const promos =
    product.promotions?.map((pp: any) => pp.promotion).filter(Boolean) ?? [];

  // ¿Está destacado? (tiene alguna promo FEATURED)
  const featured = promos.some((p: any) => p.type === 'FEATURED');

  // El descuento es la primera promo que NO sea FEATURED
  const discount = promos.find((p: any) => p.type !== 'FEATURED') ?? null;

  let finalPrice: number | null = null;

  if (discount) {
    const price = parseFloat(product.price);

    switch (discount.type) {
      case 'PERCENTAGE':
        if (discount.discountValue) {
          finalPrice =
            price - (price * parseFloat(discount.discountValue)) / 100;
        }
        break;
      case 'FIXED':
        if (discount.discountValue) {
          finalPrice = price - parseFloat(discount.discountValue);
          if (finalPrice < 0) finalPrice = 0;
        }
        break;
      case 'TWO_FOR_ONE':
        finalPrice = price / 2;
        break;
    }
  }

  return {
    ...product,
    featured,
    finalPrice: finalPrice !== null ? finalPrice.toFixed(2) : null,
    promotion: discount
      ? {
          id: discount.id,
          name: discount.name,
          type: discount.type,
          discountValue: discount.discountValue,
        }
      : null,
  };
}


// Sincroniza destacado y descuento del producto con sus promociones
  private async syncPromotions(
    productId: string,
    productName: string,
    opts: {
      featured?: boolean;
      discountType?: 'PERCENTAGE' | 'FIXED' | 'TWO_FOR_ONE' | null;
      discountValue?: number | null;
    },
  ) {
    const { featured, discountType, discountValue } = opts;

    // --- DESTACADO ---
   // --- DESTACADO ---
    if (featured !== undefined) {
      if (featured) {
        let featuredPromo = await this.prisma.promotion.findFirst({
          where: { type: 'FEATURED', deletedAt: null },
        });

        if (!featuredPromo) {
          featuredPromo = await this.prisma.promotion.create({
            data: { name: 'Destacados', type: 'FEATURED', active: true },
          });
        }

        await this.prisma.promotionProduct.upsert({
          where: {
            promotionId_productId: {
              promotionId: featuredPromo.id,
              productId,
            },
          },
          create: { promotionId: featuredPromo.id, productId },
          update: {},
        });
      } else {
        // Lo saca de TODAS las promociones destacadas
        await this.prisma.promotionProduct.deleteMany({
          where: {
            productId,
            promotion: { type: 'FEATURED' },
          },
        });
      }
    }

    // --- DESCUENTO ---
    if (discountType !== undefined) {
      if (
        (discountType === 'PERCENTAGE' || discountType === 'FIXED') &&
        (discountValue === undefined || discountValue === null)
      ) {
        throw new BadRequestException(
          'Debe enviar discountValue para ese tipo de descuento.',
        );
      }

      // Saca los descuentos actuales del producto
      const links = await this.prisma.promotionProduct.findMany({
        where: {
          productId,
          promotion: { type: { not: 'FEATURED' }, deletedAt: null },
        },
      });

      for (const link of links) {
        await this.prisma.promotionProduct.delete({
          where: {
            promotionId_productId: {
              promotionId: link.promotionId,
              productId,
            },
          },
        });

        const rest = await this.prisma.promotionProduct.count({
          where: { promotionId: link.promotionId },
        });

        if (rest === 0) {
          await this.prisma.promotion.update({
            where: { id: link.promotionId },
            data: { deletedAt: new Date(), active: false },
          });
        }
      }

      // Crea el descuento nuevo (si pidieron uno)
      if (discountType) {
        const promo = await this.prisma.promotion.create({
          data: {
            name: `${discountType} - ${productName}`,
            type: discountType,
            discountValue:
              discountType === 'TWO_FOR_ONE' ? null : (discountValue ?? null),
            active: true,
          },
        });

        await this.prisma.promotionProduct.create({
          data: { promotionId: promo.id, productId },
        });
      }
    }
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
          promotions: {
            include: { promotion: true },
            where: { promotion: { deletedAt: null, active: true } },
          },
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Producto no encontrado.',
      );
    }

    const promos = product.promotions.map((pp) => pp.promotion);
    const discount = promos.find((p) => p.type !== 'FEATURED') ?? null;

    return {
      ...product,
      featured: promos.some((p) => p.type === 'FEATURED'),
      discountType: discount ? discount.type : null,
      discountValue: discount?.discountValue ?? null,
    };
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

   const { categoryIds, featured, discountType, discountValue, ...productData } =
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
    const updated = await this.prisma.product.update({
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

    if (featured !== undefined || discountType !== undefined) {
      await this.syncPromotions(updated.id, updated.name, {
        featured,
        discountType,
        discountValue,
      });
    }

    return updated;
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