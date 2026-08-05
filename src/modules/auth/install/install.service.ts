import {
  Injectable,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstallService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InstallService.name);
  private installToken: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    const rootExists = await this.prisma.user.findFirst({
      where: {
        userRoles: {
          some: { role: { name: 'ROOT' } },
        },
      },
    });

    if (rootExists) return; // App normal, no hace nada

    this.installToken = crypto.randomBytes(32).toString('hex');

    this.logger.warn('=================================================');
    this.logger.warn('PRIMERA INSTALACIÓN — no existe usuario ROOT');
    this.logger.warn('Ejecutá este request UNA SOLA VEZ:');
    this.logger.warn('');
    this.logger.warn('POST /auth/install');
    this.logger.warn(`X-Install-Token: ${this.installToken}`);
    this.logger.warn('Body: { "email": "...", "password": "..." }');
    this.logger.warn('');
    this.logger.warn('El token se destruye al crear ROOT o al reiniciar.');
    this.logger.warn('=================================================');
  }

  isTokenValid(token: string): boolean {
    return this.installToken !== null && this.installToken === token;
  }

  async createRoot(email: string, password: string) {
    const rootRole = await this.prisma.role.findUnique({
      where: { name: 'ROOT' },
    });

    if (!rootRole) {
      throw new Error('Rol ROOT no encontrado. Ejecutá el seed primero.');
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        firstName: 'System',
        lastName: 'Root',
        email,
        password: hashed,
        userRoles: {
          create: { roleId: rootRole.id },
        },
      },
    });

    this.installToken = null; // Se destruye — nunca más se puede usar
    this.logger.log(`ROOT creado: ${email}`);

    return user;
  }
}