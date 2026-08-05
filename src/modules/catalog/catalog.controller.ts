// import {
//   Body,
//   Controller,
//   HttpCode,
//   Post,
//   UseGuards,
// } from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiCreatedResponse,
//   ApiOperation,
//   ApiTags,
// } from '@nestjs/swagger';

// import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/common/guards/roles.guard';
// import { Roles } from 'src/common/decorators/roles.decorator';
// import { SystemRole } from 'src/common/constants/roles';

// import { CatalogOrchestrator } from './catalog.orchestrator';
// import { CreateCatalogProductDto } from './dto/catalog-product.dto';

// @ApiTags('Catalog')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('catalog')
// export class CatalogController {
//   constructor(
//     private readonly catalogOrchestrator: CatalogOrchestrator,
//   ) {}

//   @Post('product')
//   @Roles(SystemRole.ROOT, SystemRole.ADMIN)
//   @HttpCode(201)
//   @ApiOperation({
//     summary: 'Crear producto con marca y categorías en una sola operación',
//   })
//   @ApiCreatedResponse({
//     description: 'Producto creado correctamente con todas sus relaciones.',
//   })
//   createProduct(@Body() dto: CreateCatalogProductDto) {
//     return this.catalogOrchestrator.createProduct(dto);
//   }
// }

//ref
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRole } from 'src/common/constants/roles';

import { CatalogOrchestrator } from './catalog.orchestrator';
import { CreateCatalogProductDto, UpdateCatalogProductDto } from './dto/catalog-product.dto';

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogOrchestrator: CatalogOrchestrator,
  ) {}

  @Post('product')
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear producto con marca y categorías' })
  @ApiCreatedResponse({ description: 'Producto creado correctamente.' })
  createProduct(@Body() dto: CreateCatalogProductDto) {
    return this.catalogOrchestrator.createProduct(dto);
  }

  @Patch('product/:id')
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar producto con marca y categorías' })
  @ApiOkResponse({ description: 'Producto actualizado correctamente.' })
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateCatalogProductDto,
  ) {
    return this.catalogOrchestrator.updateProduct(id, dto);
  }
}