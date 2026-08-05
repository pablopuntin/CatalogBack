import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InstallService } from './install.service';

@Injectable()
export class InstallGuard implements CanActivate {
  constructor(private readonly installService: InstallService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-install-token'];

    if (!token) {
      throw new UnauthorizedException('Token de instalación requerido.');
    }

    if (!this.installService.isTokenValid(token)) {
      // Misma respuesta para "incorrecto" y "ya instalado"
      // No damos info al atacante
      throw new ForbiddenException('Token inválido o instalación ya completada.');
    }

    return true;
  }
}