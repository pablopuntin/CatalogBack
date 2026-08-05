//ref
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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

import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
  ) {}

  // ── Públicos ──────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar marcas activas — público' })
  @ApiOkResponse()
  findAllPublic() {
    return this.brandsService.findAllPublic();
  }

  // ── Protegidos ────────────────────────────────────
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN, SystemRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las marcas — requiere auth' })
  @ApiOkResponse()
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN, SystemRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener marca' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear marca' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar marca' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar marca' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}