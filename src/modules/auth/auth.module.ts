import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
//import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import {StringValue} from 'ms';

@Module({
    imports: [
      PrismaModule,
      UsersModule,
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
    providers: [AuthService],//falta authservice y jwtstrategy
    exports: [PassportModule, JwtModule]//falta jwtStrategy

})
export class AuthModule {}
