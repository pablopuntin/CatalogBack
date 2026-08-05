//ref para agregar permisos a rol ADMIN
import { PrismaClient } from '@prisma/client';

export async function seedRolePermissions(prisma: PrismaClient) {
  const [root, admin] = await Promise.all([
    prisma.role.findUnique({ where: { name: 'ROOT' } }),
    prisma.role.findUnique({ where: { name: 'ADMIN' } }),
  ]);

  const permissions = await prisma.permission.findMany();

  // ROOT y ADMIN tienen todos los permisos
  // EMPLOYEE no tiene ninguno por defecto — el ADMIN los asigna
  for (const role of [root, admin]) {
    if (!role) continue;
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
}