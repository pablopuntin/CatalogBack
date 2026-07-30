import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from '../users/users.module';

import {StringValue} from 'ms';
import { JwtStrategy } from './jwtStrategy';
import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [
      PrismaModule,
      UsersModule,
      RefreshTokensModule,
        PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: config.get('JWT_EXPIRES_IN') as StringValue,
    },
  }),
})

    ],  
    controllers:[AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [PassportModule, JwtModule]//falta jwtStrategy

})
export class AuthModule {}
