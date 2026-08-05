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