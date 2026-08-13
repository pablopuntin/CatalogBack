import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusinessConfigDto } from './dto/create-business-config.dto';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { MulterFile } from 'src/common/types/multer.type';

@Injectable()
export class BusinessConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
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

  // async find() {
  //   const businessConfig = await this.prisma.businessConfig.findFirst();

  //   if (!businessConfig) {
  //     throw new NotFoundException(
  //       'No existe una configuración del negocio.',
  //     );
  //   }

  //   return businessConfig;
  // }

  //ref
  async find() {
    const businessConfig = await this.prisma.businessConfig.findFirst({
      include: {
        heroImages: { orderBy: { sortOrder: 'asc' } },
      },
    });

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


   // Método para subir imagen
// async uploadImage(file: MulterFile, type: 'logo' | 'hero') {
//   const config = await this.prisma.businessConfig.findFirst();

//   if (!config) {
//     throw new NotFoundException(
//       'No existe una configuración del negocio. Creala primero.',
//     );
//   }

//   const { url } = await this.cloudinaryService.uploadImage(
//     file,
//     'catalog/business',
//   );

//   const field = type === 'logo' ? 'logoUrl' : 'heroImageUrl';

//   return this.prisma.businessConfig.update({
//     where: { id: config.id },
//     data: { [field]: url },
//   });
// }

//ref
// Logo del negocio (una sola imagen)
async uploadLogo(file: MulterFile) {
  const config = await this.prisma.businessConfig.findFirst();

  if (!config) {
    throw new NotFoundException(
      'No existe una configuración del negocio. Creala primero.',
    );
  }

  const { url } = await this.cloudinaryService.uploadImage(
    file,
    'catalog/business',
  );

  return this.prisma.businessConfig.update({
    where: { id: config.id },
    data: { logoUrl: url },
  });
}

// Imágenes del banner (varias)
async addHeroImage(file: MulterFile) {
  const config = await this.prisma.businessConfig.findFirst();

  if (!config) {
    throw new NotFoundException(
      'No existe una configuración del negocio. Creala primero.',
    );
  }

  const { url, publicId } = await this.cloudinaryService.uploadImage(
    file,
    'catalog/business',
  );

  const last = await this.prisma.heroImage.findFirst({
    where: { businessConfigId: config.id },
    orderBy: { sortOrder: 'desc' },
  });

  return this.prisma.heroImage.create({
    data: {
      businessConfigId: config.id,
      url,
      publicId,
      sortOrder: last ? last.sortOrder + 1 : 0,
    },
  });
}

async removeHeroImage(id: string) {
  const image = await this.prisma.heroImage.findUnique({
    where: { id },
  });

  if (!image) {
    throw new NotFoundException('Imagen no encontrada.');
  }

  if (image.publicId) {
    await this.cloudinaryService.deleteImage(image.publicId).catch(() => {});
  }

  return this.prisma.heroImage.delete({ where: { id } });
}


}