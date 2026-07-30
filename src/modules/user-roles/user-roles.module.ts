import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRolesService } from './user-roles.service';
@Module({
  imports: [PrismaModule],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}