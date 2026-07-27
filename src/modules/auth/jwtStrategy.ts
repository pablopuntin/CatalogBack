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
    name: string,
    lastname: string,
  }) {
    console.log('PAYLOAD', payload);
    return {
      id: payload.sub,
      //email: payload.email, //quizas quiera enviar name y lastName, igual que rol y permiso, no creo que deba enviar email
      name: payload.name,
      lastName: payload.lastname
    };
  }
}