import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'Catálogo Digital API',
      version: '1.0.0',
      status: 'running',
    };
  }
}

