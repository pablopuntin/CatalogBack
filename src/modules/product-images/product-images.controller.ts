import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRole } from 'src/common/constants/roles';
import { ProductImagesService } from './product-images.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags('Product Images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRole.ROOT, SystemRole.ADMIN)
@Controller('products/:id/images')
export class ProductImagesController {
  constructor(
    private readonly productImagesService: ProductImagesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, callback) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Solo se permiten imágenes JPG, PNG o WebP.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Subir imagen de producto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        isPrimary: { type: 'boolean' },
      },
    },
  })
  uploadImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('isPrimary') isPrimary?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }
    return this.productImagesService.upload(
      productId,
      file,
      isPrimary === 'true',
    );
  }

  @Delete(':imageId')
  @ApiOperation({ summary: 'Eliminar imagen de producto' })
  deleteImage(
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productImagesService.remove(productId, imageId);
  }
}