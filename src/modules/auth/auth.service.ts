import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { RefreshTokenDto } from '../refresh-tokens/dto/refresh-token.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el email ya existe
    const existingUser = await this.usersService.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException(
        'El correo electrónico ya está registrado.',
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      10,
    );

    // Crear el usuario
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Respuesta al cliente
   return {
  message: 'Usuario creado correctamente.',
};
  }

  //   async login(loginDto: LoginDto) {
  //   const user = await this.usersService.findByEmail(
  //     loginDto.email,
  //   );

  //   if (!user) {
  //     throw new UnauthorizedException(
  //       'Credenciales inválidas.',
  //     );
  //   }

  //   const passwordMatch = await bcrypt.compare(
  //     loginDto.password,
  //     user.password,
  //   );

  //   if (!passwordMatch) {
  //     throw new UnauthorizedException(
  //       'Credenciales inválidas.',
  //     );
  //   }

  //   const payload = {
  //     sub: user.id,
  //     //email: user.email,
  //     name: user.firstName,
  //     lastName: user.lastName,
  //   };

  //   const accessToken = await this.jwtService.signAsync(payload);

  //   return {
  //     access_token: accessToken,
  //   };
  // }

  //REFACTOR
  async login(loginDto: LoginDto) {
  const user = await this.usersService.findByEmail(
    loginDto.email,
  );

  if (!user) {
    throw new UnauthorizedException(
      'Credenciales inválidas.',
    );
  }

  const passwordMatch = await bcrypt.compare(
    loginDto.password,
    user.password,
  );

  if (!passwordMatch) {
    throw new UnauthorizedException(
      'Credenciales inválidas.',
    );
  }

 const payload = {
  sub: user.id,
  name: user.firstName,
  lastName: user.lastName,
};

  const accessToken = await this.jwtService.signAsync(
    payload,
  );

  const refreshToken = await this.jwtService.signAsync(
    payload,
    {
     expiresIn: this.configService.get(
  'REFRESH_TOKEN_EXPIRES_IN',
) as StringValue,
    },
  );

  const hashedRefreshToken = await bcrypt.hash(
    refreshToken,
    10,
  );

  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + 7);

  await this.refreshTokensService.create(
    user.id,
    hashedRefreshToken,
    expiresAt,
  );

  return {
    accessToken,
    refreshToken,
  };
}

async refresh(
  refreshTokenDto: RefreshTokenDto,
) {

  const session =
    await this.refreshTokensService.validate(
      refreshTokenDto.refreshToken,
    );

  if (!session) {
    throw new UnauthorizedException(
      'Refresh Token inválido.',
    );
  }

  const payload = {
    sub: session.user.id,
    name: session.user.firstName,
    lastName: session.user.lastName,
  };

  const accessToken =
    await this.jwtService.signAsync(payload);

  return {
    accessToken,
  };
}

//metodo para cerra las sesiones
async logout(
  refreshTokenDto: RefreshTokenDto,
) {
  const deleted =
    await this.refreshTokensService.deleteByToken(
      refreshTokenDto.refreshToken,
    );

  if (!deleted) {
    throw new UnauthorizedException(
      'Refresh Token inválido.',
    );
  }

  return {
    message: 'Sesión cerrada correctamente.',
  };
}


}