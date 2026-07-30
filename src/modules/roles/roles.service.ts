import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: string) {
    return this.prisma.role.findUnique({
      where: {
        id,
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: {
        name,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(name: string, description?: string) {
    return this.prisma.role.create({
      data: {
        name,
        description,
      },
    });
  }
}