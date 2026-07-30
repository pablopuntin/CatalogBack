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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { BusinessConfigService } from './business-config.service';

import { CreateBusinessConfigDto } from './dto/create-business-config.dto';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

import { SystemRole } from '../../common/enums/system-role.enum';

@ApiTags('Business Config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('business-config')
export class BusinessConfigController {
  constructor(
    private readonly businessConfigService: BusinessConfigService,
  ) {}

  @Post()
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @Permissions('business-config.create')
  @ApiOperation({
    summary: 'Crear la configuración inicial del negocio',
  })
  @ApiCreatedResponse({
    description: 'Configuración creada correctamente.',
  })
  @ApiConflictResponse({
    description: 'La configuración ya existe.',
  })
  @ApiUnauthorizedResponse({
    description: 'No autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Sin permisos.',
  })
  create(
    @Body()
    createBusinessConfigDto: CreateBusinessConfigDto,
  ) {
    return this.businessConfigService.create(
      createBusinessConfigDto,
    );
  }

  @Get()
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @Permissions('business-config.read')
  @ApiOperation({
    summary: 'Obtener la configuración del negocio',
  })
  @ApiOkResponse({
    description: 'Configuración obtenida correctamente.',
  })
  @ApiNotFoundResponse({
    description: 'La configuración no existe.',
  })
  @ApiUnauthorizedResponse({
    description: 'No autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Sin permisos.',
  })
  find() {
    return this.businessConfigService.find();
  }

  @Patch()
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @Permissions('business-config.update')
  @ApiOperation({
    summary: 'Actualizar la configuración del negocio',
  })
  @ApiOkResponse({
    description: 'Configuración actualizada correctamente.',
  })
  @ApiNotFoundResponse({
    description: 'La configuración no existe.',
  })
  @ApiUnauthorizedResponse({
    description: 'No autenticado.',
  })
  @ApiForbiddenResponse({
    description: 'Sin permisos.',
  })
  update(
    @Body()
    updateBusinessConfigDto: UpdateBusinessConfigDto,
  ) {
    return this.businessConfigService.update(
      updateBusinessConfigDto,
    );
  }
}