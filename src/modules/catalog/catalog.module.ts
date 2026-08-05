import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogOrchestrator } from './catalog.orchestrator';
import { BrandsModule } from '../brands/brands.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BrandsModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [CatalogController],
  providers: [CatalogOrchestrator],
})
export class CatalogModule {}