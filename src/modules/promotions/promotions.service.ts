// cambios si hay mas de 500 productos y ya no se quiere generar el calculo en el service sio dejarlo en una columna en bd:
// Agregar un campo a Product:
// finalPrice Decimal? @db.Decimal(10,2)
// → 1 migración, 1 línea
// En el service — lo que cambiaría:
// Opción A (ahora):
// findAllPublic() → trae productos + promociones → calcula en memoria

// Opción B (futuro):
// findAllPublic() → trae productos con finalPrice ya calculado ← más simple aún
// + agregar lógica en:
//   - createPromotion()  → actualiza finalPrice de los productos afectados
//   - updatePromotion()  → ídem
//   - deletePromotion()  → resetea finalPrice a null
//   - updateProduct()    → recalcula si tiene promoción activa
// Lo que NO cambia:
// - Controllers
// - DTOs  
// - Frontend — sigue recibiendo finalPrice igual
// - La lógica de negocio es la misma, solo cambia dónde se ejecuta

// El "dolor" real es escribir la sincronización — cuando cambia un precio o una promoción, hay que actualizar los productos afectados. Son 3-4 métodos extra en el service.

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePromotionDto) {
    const { productIds, discountValue, ...promotionData } = dto;

    const promotion = await this.prisma.promotion.create({
      data: {
        ...promotionData,
        discountValue: discountValue
          ? parseFloat(discountValue)
          : undefined,
        ...(productIds?.length
          ? {
              products: {
                create: productIds.map((productId) => ({ productId })),
              },
            }
          : {}),
      },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    return promotion;
  }

  //metodo publico
  async findAllPublic() {
  const now = new Date();

  return this.prisma.promotion.findMany({
    where: {
      deletedAt: null,
      active: true,
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

  async findAll() {
    return this.prisma.promotion.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: { id, deletedAt: null },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promoción no encontrada.');
    }

    return promotion;
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.findOne(id);

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Debe enviar al menos un campo.');
    }

    const { productIds, discountValue, ...promotionData } = dto;

    return this.prisma.promotion.update({
      where: { id },
      data: {
        ...promotionData,
        ...(discountValue !== undefined
          ? { discountValue: parseFloat(discountValue) }
          : {}),
        ...(productIds
          ? {
              products: {
                deleteMany: {},
                create: productIds.map((productId) => ({ productId })),
              },
            }
          : {}),
      },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.promotion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}