import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { MulterFile } from 'src/common/types/multer.type';

@Injectable()
export class ProductImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async upload(
    productId: string, file: MulterFile, isPrimary = false
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    const { url, publicId } = await this.cloudinaryService.uploadImage(
      file,
      'catalog/products',
    );

    if (isPrimary) {
      await this.prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const lastImage = await this.prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
    });

    const sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    return this.prisma.productImage.create({
      data: {
        productId,
        url,
        publicId,
        isPrimary,
        sortOrder,
      },
    });
  }

  async remove(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Imagen no encontrada.');
    }

    if (image.publicId) {
      await this.cloudinaryService.deleteImage(image.publicId);
    }

    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }
}