import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: string) {
    return this.prisma.permission.findUnique({
      where: {
        id,
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.permission.findUnique({
      where: {
        name,
      },
    });
  }

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(name: string, description?: string) {
    return this.prisma.permission.create({
      data: {
        name,
        description,
      },
    });
  }
}