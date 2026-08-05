import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRole } from 'src/common/constants/roles';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { Query } from '@nestjs/common';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // ── Público ──────────────────────────────────────
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar consulta desde el catálogo' })
  @ApiCreatedResponse()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  // ── Protegidos ────────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.ROOT, SystemRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las consultas' })
  @ApiOkResponse()
  findAll() {
    return this.quotesService.findAll();
  }

  @Get('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(SystemRole.ROOT, SystemRole.ADMIN)
@ApiBearerAuth()
@ApiOperation({ summary: 'Métricas de consultas' })
@ApiOkResponse()
getMetrics(
  @Query('from') from?: string,
  @Query('to') to?: string,
  @Query('limit') limit?: string,
) {
  return this.quotesService.getMetrics(
    from,
    to,
    limit ? parseInt(limit) : 5,
  );
}

}