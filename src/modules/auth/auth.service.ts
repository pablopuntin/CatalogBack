import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

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

 const roles = user.userRoles.map(
  (userRole) => userRole.role.name,
);

const permissions = [
  ...new Set(
    user.userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map(
        (rolePermission) =>
          rolePermission.permission.name,
      ),
    ),
  ),
];

const payload = {
  sub: user.id,
  name: user.firstName,
  lastName: user.lastName,
  roles,
  permissions,
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

  const accessData =
  await this.usersService.getUserAccessData(
    session.user.id,
  );

const payload = {
  sub: session.user.id,
  name: session.user.firstName,
  lastName: session.user.lastName,
  roles: accessData?.roles ?? [],
  permissions: accessData?.permissions ?? [],
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