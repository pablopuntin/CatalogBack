import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuoteDto) {
    return this.prisma.quote.create({
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                brand: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }

//   async getMetrics() {
//     const now = new Date();
//     const startOfDay = new Date(now);
//     startOfDay.setHours(0, 0, 0, 0);
//     const startOfWeek = new Date(now);
//     startOfWeek.setDate(now.getDate() - 7);
//     const startOfMonth = new Date(now);
//     startOfMonth.setDate(now.getDate() - 30);

//     const [today, week, month, topProducts] = await Promise.all([
//       // Consultas hoy
//       this.prisma.quote.count({
//         where: { createdAt: { gte: startOfDay } },
//       }),
//       // Consultas últimos 7 días
//       this.prisma.quote.count({
//         where: { createdAt: { gte: startOfWeek } },
//       }),
//       // Consultas últimos 30 días
//       this.prisma.quote.count({
//         where: { createdAt: { gte: startOfMonth } },
//       }),
//       // Productos más consultados
//       this.prisma.quoteItem.groupBy({
//         by: ['productId'],
//         _sum: { quantity: true },
//         orderBy: { _sum: { quantity: 'desc' } },
//         take: 5,
//       }),
//     ]);

//     // Traer nombres de los productos más consultados
//     const topProductIds = topProducts.map((p) => p.productId);
//     const products = await this.prisma.product.findMany({
//       where: { id: { in: topProductIds } },
//       select: { id: true, name: true },
//     });

//     const topProductsWithNames = topProducts.map((p) => ({
//       productId: p.productId,
//       name: products.find((prod) => prod.id === p.productId)?.name ?? 'Producto eliminado',
//       totalQuantity: p._sum.quantity ?? 0,
//     }));

//     return {
//       today,
//       week,
//       month,
//       topProducts: topProductsWithNames,
//     };
//   }


//ref con rango de fechas y ver 5 mas si se quiere
async getMetrics(from?: string, to?: string, limit = 5) {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now);
  startOfMonth.setDate(now.getDate() - 30);

  // Rango de fecha para top productos
  const rangeFilter = from || to ? {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to + 'T23:59:59') } : {}),
    },
  } : {};

  const [today, week, month, topProducts] = await Promise.all([
    this.prisma.quote.count({
      where: { createdAt: { gte: startOfDay } },
    }),
    this.prisma.quote.count({
      where: { createdAt: { gte: startOfWeek } },
    }),
    this.prisma.quote.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    this.prisma.quoteItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
      ...(Object.keys(rangeFilter).length > 0 ? {
        where: {
          quote: rangeFilter,
        },
      } : {}),
    }),
  ]);

  const topProductIds = topProducts.map((p) => p.productId);
  const products = await this.prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  });

  const topProductsWithNames = topProducts.map((p) => ({
    productId: p.productId,
    name: products.find((prod) => prod.id === p.productId)?.name ?? 'Producto eliminado',
    totalQuantity: p._sum.quantity ?? 0,
  }));

  return {
    today,
    week,
    month,
    topProducts: topProductsWithNames,
  };
}

}