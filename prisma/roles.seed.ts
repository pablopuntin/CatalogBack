// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export const ROLES = {
//   ROOT: 'ROOT',
//   ADMIN: 'ADMIN',
//   EMPLOYEE: 'EMPLOYEE',
// } as const;

// export async function seedRoles() {
//   console.log('🌱 Seeding roles...');

//   const roles = [
//     {
//       name: ROLES.ROOT,
//       description: 'Acceso total al sistema. Saltea validaciones de permisos.',
//     },
//     {
//       name: ROLES.ADMIN,
//       description: 'Administrador del sistema. Accede a todos los permisos.',
//     },
//     {
//       name: ROLES.EMPLOYEE,
//       description: 'Empleado estándar. Acceso limitado según permisos asignados.',
//     },
//   ];

//   for (const role of roles) {
//     await prisma.role.upsert({
//       where: { name: role.name },
//       update: { description: role.description },
//       create: role,
//     });
//   }

//   console.log(`✅ ${roles.length} roles creados/actualizados.`);
// }

//ref de chat
import { PrismaClient } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  await prisma.role.upsert({
    where: { name: 'ROOT' },
    update: {},
    create: {
      name: 'ROOT',
      description: 'Acceso total al sistema',
    },
  });

  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador del negocio',
    },
  });

  await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: {
      name: 'EMPLOYEE',
      description: 'Empleado',
    },
  });
}