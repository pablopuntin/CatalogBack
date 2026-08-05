import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)  // todos los endpoints requieren JWT
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('admin')
  @Roles('ROOT')                        // solo ROOT crea ADMINs
  @ApiOperation({ summary: 'Crear usuario ADMIN — solo ROOT' })
  createAdmin(@Body() dto: CreateUserDto) {
    return this.usersService.createWithRole(dto, 'ADMIN');
  }

  @Post('employee')
  @Roles('ROOT', 'ADMIN')              // ROOT o ADMIN crean EMPLEADOs
  @ApiOperation({ summary: 'Crear usuario EMPLOYEE — ROOT o ADMIN' })
  createEmployee(@Body() dto: CreateUserDto) {
    return this.usersService.createWithRole(dto, 'EMPLOYEE');
  }

  @Get()
  @Roles('ROOT', 'ADMIN')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('ROOT', 'ADMIN')
  @ApiOperation({ summary: 'Ver usuario por ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}