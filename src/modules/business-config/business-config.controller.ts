//ref
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRole } from 'src/common/constants/roles';

import { BusinessConfigService } from './business-config.service';
import { CreateBusinessConfigDto } from './dto/create-business-config.dto';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';
import type { MulterFile } from 'src/common/types/multer.type';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const imageInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      callback(
        new BadRequestException('Solo se permiten imágenes JPG, PNG o WebP.'),
        false,
      );
      return;
    }
    callback(null, true);
  },
});

@ApiTags('Business Config')
@Controller('business-config')
export class BusinessConfigController {
  constructor(
    private readonly businessConfigService: BusinessConfigService,
  ) {}

  // ── Público ──────────────────────────────────────
  @Get('public')
  @ApiOperation({ summary: 'Obtener configuración pública del negocio' })
  @ApiOkResponse()
  findPublic() {
    return this.businessConfigService.find();
  }

  // ── Protegidos ────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear configuración inicial del negocio' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateBusinessConfigDto) {
    return this.businessConfigService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener configuración completa — requiere auth' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  find() {
    return this.businessConfigService.find();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración del negocio' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  update(@Body() dto: UpdateBusinessConfigDto) {
    return this.businessConfigService.update(dto);
  }

  @Post('logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(imageInterceptor)
  @ApiOperation({ summary: 'Subir logo del negocio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
 uploadLogo(@UploadedFile() file: MulterFile) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo.');
    return this.businessConfigService.uploadLogo(file);
  }

  // @Post('hero')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  // @ApiBearerAuth()
  // @UseInterceptors(imageInterceptor)
  // @ApiOperation({ summary: 'Subir imagen hero del negocio' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: { type: 'string', format: 'binary' },
  //     },
  //   },
  // })
  // uploadHero(@UploadedFile() file: MulterFile) {
  //   if (!file) throw new BadRequestException('No se recibió ningún archivo.');
  //   return this.businessConfigService.uploadImage(file, 'hero');
  // }

  @Post('hero-images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(imageInterceptor)
  @ApiOperation({ summary: 'Agregar una imagen al banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  addHeroImage(@UploadedFile() file: MulterFile) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo.');
    return this.businessConfigService.addHeroImage(file);
  }

  @Delete('hero-images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quitar una imagen del banner' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  removeHeroImage(@Param('id') id: string) {
    return this.businessConfigService.removeHeroImage(id);
  }
}
