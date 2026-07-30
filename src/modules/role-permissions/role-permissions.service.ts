import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolePermissionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async assignPermission(
    roleId: string,
    permissionId: string,
  ) {
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ) {
    return this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  async findRolePermissions(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        permission: true,
      },
    });
  }
}
