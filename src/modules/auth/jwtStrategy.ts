import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }


  async validate(payload: {
  sub: string;
  name: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}) {
  return {
    id: payload.sub,
    name: payload.name,
    lastName: payload.lastName,
    roles: payload.roles,
    permissions: payload.permissions,
  };
}


}