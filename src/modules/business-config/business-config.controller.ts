// import {
//   Body,
//   Controller,
//   Get,
//   Patch,
//   Post,
//   UseGuards,
// } from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiConflictResponse,
//   ApiCreatedResponse,
//   ApiForbiddenResponse,
//   ApiNotFoundResponse,
//   ApiOkResponse,
//   ApiOperation,
//   ApiTags,
//   ApiUnauthorizedResponse,
// } from '@nestjs/swagger';

// import { BusinessConfigService } from './business-config.service';

// import { CreateBusinessConfigDto } from './dto/create-business-config.dto';
// import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';

// import { RolesGuard } from 'src/common/guards/roles.guard';
// import { PermissionsGuard } from 'src/common/guards/permissions.guard';

// import { Roles } from '../../common/decorators/roles.decorator';
// import { Permissions } from 'src/common/decorators/permissions.decorator';

// import { SystemRole } from 'src/common/constants/roles';


// @ApiTags('Business Config')
// @ApiBearerAuth()
// @UseGuards(RolesGuard, PermissionsGuard)
// @Controller('business-config')
// export class BusinessConfigController {
//   constructor(
//     private readonly businessConfigService: BusinessConfigService,
//   ) {}

//   @Post()
//   @Roles(SystemRole.ROOT, SystemRole.ADMIN)
//   @Permissions('business-config.create')
//   @ApiOperation({
//     summary: 'Crear la configuración inicial del negocio',
//   })
//   @ApiCreatedResponse({
//     description: 'Configuración creada correctamente.',
//   })
//   @ApiConflictResponse({
//     description: 'La configuración ya existe.',
//   })
//   @ApiUnauthorizedResponse({
//     description: 'No autenticado.',
//   })
//   @ApiForbiddenResponse({
//     description: 'Sin permisos.',
//   })
//   create(
//     @Body()
//     createBusinessConfigDto: CreateBusinessConfigDto,
//   ) {
//     return this.businessConfigService.create(
//       createBusinessConfigDto,
//     );
//   }

//   @Get()
//   @Roles(SystemRole.ROOT, SystemRole.ADMIN)
//   @Permissions('business-config.read')
//   @ApiOperation({
//     summary: 'Obtener la configuración del negocio',
//   })
//   @ApiOkResponse({
//     description: 'Configuración obtenida correctamente.',
//   })
//   @ApiNotFoundResponse({
//     description: 'La configuración no existe.',
//   })
//   @ApiUnauthorizedResponse({
//     description: 'No autenticado.',
//   })
//   @ApiForbiddenResponse({
//     description: 'Sin permisos.',
//   })
//   find() {
//     return this.businessConfigService.find();
//   }

//   @Patch()
//   @Roles(SystemRole.ROOT, SystemRole.ADMIN)
//   @Permissions('business-config.update')
//   @ApiOperation({
//     summary: 'Actualizar la configuración del negocio',
//   })
//   @ApiOkResponse({
//     description: 'Configuración actualizada correctamente.',
//   })
//   @ApiNotFoundResponse({
//     description: 'La configuración no existe.',
//   })
//   @ApiUnauthorizedResponse({
//     description: 'No autenticado.',
//   })
//   @ApiForbiddenResponse({
//     description: 'Sin permisos.',
//   })
//   update(
//     @Body()
//     updateBusinessConfigDto: UpdateBusinessConfigDto,
//   ) {
//     return this.businessConfigService.update(
//       updateBusinessConfigDto,
//     );
//   }
// }

//REF
import {
  Body,
  Controller,
  Get,
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

import { BusinessConfigService } from './business-config.service';
import { CreateBusinessConfigDto } from './dto/create-business-config.dto';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';


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
}