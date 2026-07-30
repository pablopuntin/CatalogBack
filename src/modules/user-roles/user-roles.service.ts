import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async assignRole(userId: string, roleId: string) {
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeRole(userId: string, roleId: string) {
    return this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
  }

  async findUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: {
        userId,
      },
      include: {
        role: true,
      },
    });
  }
}