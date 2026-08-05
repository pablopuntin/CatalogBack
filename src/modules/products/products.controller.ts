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

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // ── Públicos ──────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar productos activos — público' })
  @ApiOkResponse()
  findAllPublic() {
    return this.productsService.findAllPublic();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener producto por slug — público' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  findOnePublic(@Param('slug') slug: string) {
    return this.productsService.findOnePublic(slug);
  }

  // ── Protegidos ────────────────────────────────────
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN, SystemRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los productos — requiere auth' })
  @ApiOkResponse()
  findAll() {
    return this.productsService.findAll();
  }

  //endpoint para filtrar activos e inactivos
  @Get('admin/active')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRole.ROOT, SystemRole.ADMIN, SystemRole.EMPLOYEE)
@ApiBearerAuth()
@ApiOperation({ summary: 'Listar productos activos — requiere auth' })
@ApiOkResponse()
findAllActive() {
  return this.productsService.findAllActive();
}

@Get('admin/inactive')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRole.ROOT, SystemRole.ADMIN, SystemRole.EMPLOYEE)
@ApiBearerAuth()
@ApiOperation({ summary: 'Listar inactivos y eliminados — requiere auth' })
@ApiOkResponse()
findAllInactiveAndDeleted() {
  return this.productsService.findAllInactiveAndDeleted();
}


  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN, SystemRole.EMPLOYEE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener producto por id — requiere auth' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear producto' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar producto' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar producto' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/restore')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRole.ROOT, SystemRole.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'Restaurar producto eliminado' })
@ApiOkResponse()
restore(@Param('id') id: string) {
  return this.productsService.restore(id);
}


}