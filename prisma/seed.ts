// import { PrismaClient } from '@prisma/client';
// import { seedRoles } from './roles.seed';
// import { seedPermissions } from './permissions.seed';
// import { seedRolePermissions } from './role-permissions.seed';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🚀 Iniciando seed...\n');

//   // El orden importa: primero roles y permisos, luego la relación
//   await seedRoles();
//   await seedPermissions();
//   await seedRolePermissions();

//   console.log('\n🎉 Seed completado.');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Error en seed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


//REF CHAT
import { PrismaClient } from '@prisma/client';

import { seedRoles } from './roles.seed';
import { seedPermissions } from './permissions.seed';
import { seedRolePermissions } from './role-permissions.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  await seedRoles(prisma);

  await seedPermissions(prisma);

  await seedRolePermissions(prisma);

  console.log('Seed finalizado.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });