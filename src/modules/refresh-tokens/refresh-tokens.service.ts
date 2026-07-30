import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ) {
    return this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async validate(refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      include: {
        user: true,
      },
    });

    for (const storedToken of tokens) {
      const match = await bcrypt.compare(
        refreshToken,
        storedToken.token,
      );

      if (match) {
        if (storedToken.expiresAt < new Date()) {
          return null;
        }

        return storedToken;
      }
    }

    return null;
  }

  async delete(id: string) {
    return this.prisma.refreshToken.delete({
      where: {
        id,
      },
    });
  }

  async deleteAllByUser(userId: string) {
    return this.prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }


  //metodo para cerrar todas las sesiones
  async deleteByToken(refreshToken: string) {
  const session = await this.validate(refreshToken);

  if (!session) {
    return null;
  }

  return this.prisma.refreshToken.delete({
    where: {
      id: session.id,
    },
  });
}


}