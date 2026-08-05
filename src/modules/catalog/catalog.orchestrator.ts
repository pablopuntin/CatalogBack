// //ref agregando url de imagen
// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
// import { BrandsService } from '../brands/brands.service';
// import { CategoriesService } from '../categories/categories.service';
// import { ProductsService } from '../products/products.service';
// import { CreateCatalogProductDto } from './dto/catalog-product.dto';

// @Injectable()
// export class CatalogOrchestrator {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly brandsService: BrandsService,
//     private readonly categoriesService: CategoriesService,
//     private readonly productsService: ProductsService,
//   ) {}

//   async createProduct(dto: CreateCatalogProductDto) {
//       console.log('dto.product:', dto.product); 
//     // Paso 1 — Resolver categorías
//     const categories = await Promise.all(
//       dto.categories.map((cat) =>
//         this.categoriesService.findOrCreate(cat),
//       ),
//     );

//     // Paso 2 — Resolver marca
//     const brand = await this.brandsService.findOrCreate(dto.brand);

//     // Paso 3 — Crear producto
//     const { imageUrl, ...productData } = dto.product;

//     const product = await this.productsService.create({
//       ...productData,
//       brandId: brand.id,
//       categoryIds: categories.map((cat) => cat.id),
//     });

//     // Paso 4 — Guardar imagen si viene URL
//     if (imageUrl) {
//       await this.prisma.productImage.create({
//         data: {
//           productId: product.id,
//           url: imageUrl,
//           publicId: '',
//           isPrimary: true,
//           sortOrder: 0,
//         },
//       });
//     }

//     return this.productsService.findOne(product.id);
//   }
// }


//ref
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { CreateCatalogProductDto, UpdateCatalogProductDto } from './dto/catalog-product.dto';

@Injectable()
export class CatalogOrchestrator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  async createProduct(dto: CreateCatalogProductDto) {
    // Paso 1 — Resolver categorías
    const categories = await Promise.all(
      dto.categories.map((cat) =>
        this.categoriesService.findOrCreate(cat),
      ),
    );

    // Paso 2 — Resolver marca
    const brand = await this.brandsService.findOrCreate(dto.brand);

    // Paso 3 — Crear producto
    const { imageUrl, ...productData } = dto.product;

    const product = await this.productsService.create({
      ...productData,
      brandId: brand.id,
      categoryIds: categories.map((cat) => cat.id),
    });

    // Paso 4 — Guardar imagen si viene URL
    if (imageUrl) {
      await this.prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          publicId: '',
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    return this.productsService.findOne(product.id);
  }

  async updateProduct(id: string, dto: UpdateCatalogProductDto) {
    // Verifica que el producto existe
    await this.productsService.findOne(id);

    // Paso 1 — Resolver categorías si vienen
    if (dto.categories) {
      const categories = await Promise.all(
        dto.categories.map((cat) =>
          this.categoriesService.findOrCreate(cat),
        ),
      );

      // Reemplaza todas las categorías
      await this.prisma.productCategory.deleteMany({
        where: { productId: id },
      });

      await this.prisma.productCategory.createMany({
        data: categories.map((cat) => ({
          productId: id,
          categoryId: cat.id,
        })),
      });
    }

    // Paso 2 — Resolver marca si viene
    if (dto.brand) {
      const brand = await this.brandsService.findOrCreate(dto.brand);
      await this.prisma.product.update({
        where: { id },
        data: { brandId: brand.id },
      });
    }

    // Paso 3 — Actualizar datos del producto si vienen
    if (dto.product) {
      const { imageUrl, ...productData } = dto.product;

      if (Object.keys(productData).length > 0) {
        await this.productsService.update(id, productData);
      }

      // Paso 4 — Actualizar imagen si viene URL
      if (imageUrl) {
        const existing = await this.prisma.productImage.findFirst({
          where: { productId: id, isPrimary: true },
        });

        if (existing) {
          await this.prisma.productImage.update({
            where: { id: existing.id },
            data: { url: imageUrl },
          });
        } else {
          await this.prisma.productImage.create({
            data: {
              productId: id,
              url: imageUrl,
              publicId: '',
              isPrimary: true,
              sortOrder: 0,
            },
          });
        }
      }
    }

    return this.productsService.findOne(id);
  }
}