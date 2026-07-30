// import { PrismaClient } from '@prisma/client';
// import { ROLES } from './roles.seed';
// import { PERMISSIONS } from './permissions.seed';

// const prisma = new PrismaClient();

// // ROOT no necesita permisos en DB — el guard lo cortocircuita por rol.
// // ADMIN recibe todos los permisos.
// // EMPLOYEE recibe solo los permisos operativos básicos.

// const rolePermissionsMap: Record<string, string[]> = {
//   [ROLES.ADMIN]: Object.values(PERMISSIONS), // todos

//   [ROLES.EMPLOYEE]: [
//     PERMISSIONS.PRODUCTS_READ,
//     PERMISSIONS.PRODUCTS_CREATE,
//     PERMISSIONS.PRODUCTS_UPDATE,
//     PERMISSIONS.CATEGORIES_READ,
//     PERMISSIONS.CATEGORIES_CREATE,
//     PERMISSIONS.CATEGORIES_UPDATE,
//   ],
// };

// export async function seedRolePermissions() {
//   console.log('🌱 Seeding role-permissions...');

//   for (const [roleName, permissionNames] of Object.entries(rolePermissionsMap)) {
//     const role = await prisma.role.findUnique({ where: { name: roleName } });

//     if (!role) {
//       console.warn(`⚠️  Rol "${roleName}" no encontrado. ¿Corriste seedRoles primero?`);
//       continue;
//     }

//     for (const permName of permissionNames) {
//       const permission = await prisma.permission.findUnique({ where: { name: permName } });

//       if (!permission) {
//         console.warn(`⚠️  Permiso "${permName}" no encontrado. ¿Corriste seedPermissions primero?`);
//         continue;
//       }

//       await prisma.rolePermission.upsert({
//         where: {
//           roleId_permissionId: {
//             roleId: role.id,
//             permissionId: permission.id,
//           },
//         },
//         update: {},
//         create: {
//           roleId: role.id,
//           permissionId: permission.id,
//         },
//       });
//     }

//     console.log(`✅ Permisos asignados a ${roleName}: ${permissionNames.length}`);
//   }
// }

//REF CHAT
import { PrismaClient } from '@prisma/client';

export async function seedRolePermissions(
  prisma: PrismaClient,
) {
  const root = await prisma.role.findUnique({
    where: {
      name: 'ROOT',
    },
  });

  if (!root) return;

  const permissions =
    await prisma.permission.findMany();

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: root.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: root.id,
        permissionId: permission.id,
      },
    });
  }
}