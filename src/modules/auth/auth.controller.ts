//REF SIN PERMISSIONS
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from '../refresh-tokens/dto/refresh-token.dto';
import { InstallDto } from './install/dto/install.dto';
import { InstallGuard } from './install/install.guard';
import { InstallService } from './install/install.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly installService: InstallService,
  ) {}

  @Post('install')
  @UseGuards(InstallGuard)
  @HttpCode(201)
  @ApiHeader({
    name: 'X-Install-Token',
    description: 'Token de instalación generado en consola',
    required: true,
  })
  @ApiOperation({ summary: 'Crear usuario ROOT — solo primera instalación' })
  async install(@Body() dto: InstallDto) {
    await this.installService.createRoot(dto.email, dto.password);
    return {
      message: 'ROOT creado. Este endpoint está desactivado permanentemente.',
    };
  }

  @Post('login')
  @Throttle({default: {ttl: 900000, limit: 5}})//5 intentos cada 15 minutos
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login exitoso.' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROOT', 'ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar Access Token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Access Token renovado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Refresh Token inválido.' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Sesión cerrada correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Refresh Token inválido.' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }
}