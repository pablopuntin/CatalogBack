import { Module } from '@nestjs/common';
import { BusinessConfigController } from './business-config.controller';
import { BusinessConfigService } from './business-config.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessConfigController],
  providers: [BusinessConfigService],
  exports: [BusinessConfigService],
})
export class BusinessConfigModule {}