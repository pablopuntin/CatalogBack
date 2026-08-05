import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';


@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByEmail(email: string) {
  return this.prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async findAll() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      userRoles: {
        select: {
          role: {
            select: { name: true },
          },
        },
      },
    },
  });
}

async findById(id: string) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    select: {                    // ← reemplazá el include por select
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
              rolePermissions: {
                select: {
                  permission: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return user;
} 

 


  async getUserAccessData(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const roles = user.userRoles.map(
    (userRole) => userRole.role.name,
  );

  const permissions = [
    ...new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.rolePermissions.map(
          (rolePermission) =>
            rolePermission.permission.name,
        ),
      ),
    ),
  ];

  return {
    roles,
    permissions,
  };
}

async createWithRole(
  data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  },
  roleName: 'ADMIN' | 'EMPLOYEE',
) {
  const role = await this.prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Rol ${roleName} no encontrado.`);
  }

  const existing = await this.prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new ConflictException('El email ya está registrado.');
  }

  const hashed = await bcrypt.hash(data.password, 12);

  return this.prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashed,
      userRoles: {
        create: { roleId: role.id },
      },
    },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });
}


}