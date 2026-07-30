import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards, Get, Req } from '@nestjs/common';
import { RefreshTokenDto } from '../refresh-tokens/dto/refresh-token.dto';



@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
      ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Usuario creado correctamente.',
  })
  @ApiConflictResponse({
    description: 'El correo electrónico ya está registrado.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login exitoso.',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }


@Get('me')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
getProfile(@Req() req) {
  return req.user;
}


@ApiOperation({
  summary: 'Renovar Access Token',
})
@ApiBody({
  type: RefreshTokenDto,
})
@ApiOkResponse({
  description: 'Access Token renovado correctamente.',
})
@ApiUnauthorizedResponse({
  description: 'Refresh Token inválido.',
})
@Post('refresh')
refresh(
  @Body() refreshTokenDto: RefreshTokenDto,
) {
  return this.authService.refresh(refreshTokenDto);
}

@Post('logout')
@ApiOperation({
  summary: 'Cerrar sesión',
})
@ApiBody({
  type: RefreshTokenDto,
})
@ApiOkResponse({
  description: 'Sesión cerrada correctamente.',
})
@ApiUnauthorizedResponse({
  description: 'Refresh Token inválido.',
})
logout(
  @Body() refreshTokenDto: RefreshTokenDto,
) {
  return this.authService.logout(
    refreshTokenDto,
  );
}

}