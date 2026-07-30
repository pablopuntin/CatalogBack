import { PrismaClient } from '@prisma/client';

const permissions = [
  'users.read',
  'users.create',
  'users.update',
  'users.delete',

  'roles.read',
  'roles.assign',

  'permissions.read',

  'products.read',
  'products.create',
  'products.update',
  'products.delete',

  'categories.read',
  'categories.create',
  'categories.update',
  'categories.delete',
];

export async function seedPermissions(
  prisma: PrismaClient,
) {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission,
      },
      update: {},
      create: {
        name: permission,
      },
    });
  }
}