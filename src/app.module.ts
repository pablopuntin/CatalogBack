// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { PrismaModule } from './prisma/prisma.module';
// import { ConfigModule } from '@nestjs/config';
// import { AuthModule } from './modules/auth/auth.module';
// import { UsersModule } from './modules/users/users.module';
// import { RolesModule } from './modules/roles/roles.module';
// import { PermissionsModule } from './modules/permissions/permissions.module';
// import { UserRolesModule } from './modules/user-roles/user-roles.module';
// import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
// import { BusinessConfigModule } from './modules/business-config/business-config.module';
// import { CategoriesModule } from './modules/categories/categories.module';
// import { BrandsService } from './modules/brands/brands.service';
// import { BrandsController } from './modules/brands/brands.controller';
// import { BrandsModule } from './modules/brands/brands.module';
// import { ProductsService } from './modules/products/products.service';
// import { ProductsController } from './modules/products/products.controller';
// import { ProductsModule } from './modules/products/products.module';
// import { CatalogModule } from './modules/catalog/catalog.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     PrismaModule,
//     AuthModule,
//     UsersModule,
//     RolesModule,
//     PermissionsModule,
//     UserRolesModule,
//     RolePermissionsModule,
//     BusinessConfigModule,
//     CategoriesModule,
//     BrandsModule,
//     ProductsModule,
//     CatalogModule,
//     BusinessConfigModule,
//   ],
//   controllers: [AppController, BrandsController, ProductsController],
//   providers: [BrandsService, ProductsService],
// })
// export class AppModule {}


//ref
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UserRolesModule } from './modules/user-roles/user-roles.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { BusinessConfigModule } from './modules/business-config/business-config.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductsModule } from './modules/products/products.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ProductImagesModule } from './modules/product-images/product-images.module';


@Module({
  imports: [
         ThrottlerModule.forRoot([
      {
        ttl: 60000, // ventana de 1 minuto
        limit: 120, // techo general por IP — anti-abuso, no anti-navegación
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,   
      
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    UserRolesModule,
    RolePermissionsModule,
    BusinessConfigModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CatalogModule,
    QuotesModule,
    PromotionsModule,
    CloudinaryModule,
    ProductImagesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,  // aplica globalmente
    },
  ],
})
export class AppModule {}