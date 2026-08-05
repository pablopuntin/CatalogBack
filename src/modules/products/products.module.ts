import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BrandsModule } from '../brands/brands.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [PrismaModule, BrandsModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
