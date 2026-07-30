# Arquitectura del Backend

## Introducción

Este documento describe la arquitectura del backend del sistema.

Su objetivo es establecer una base sólida, simple y escalable para implementar la lógica de negocio del producto, manteniendo una separación clara de responsabilidades y permitiendo incorporar nuevas funcionalidades sin reestructurar la aplicación.

La arquitectura sigue los principios definidos en `principles.md` y las decisiones registradas en `decisions.md`.

---

# Objetivos de la Arquitectura

La arquitectura busca cumplir los siguientes objetivos:

- centralizar la lógica de negocio;
- mantener una única fuente de verdad;
- facilitar el mantenimiento;
- permitir el crecimiento por módulos;
- evitar duplicación de lógica;
- incorporar nuevas funcionalidades sin modificar la estructura existente.

Se evitarán patrones o capas adicionales que no aporten valor real al proyecto.

---

# Visión General

El backend constituye el núcleo funcional del sistema.

Toda la lógica de negocio, la seguridad, las validaciones y el acceso a los datos deberán concentrarse aquí.

El frontend actuará únicamente como consumidor de la API.

```
Cliente

↓

Frontend

↓

REST API (NestJS)

↓

Prisma ORM

↓

PostgreSQL
```

Cada componente posee una responsabilidad claramente definida.

---

# Stack Tecnológico

La primera versión utilizará:

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Cloudinary
- Swagger

Estas tecnologías podrán evolucionar cuando exista una necesidad concreta, sin modificar la arquitectura general.

---

# Flujo General

Toda solicitud seguirá el siguiente recorrido.

```
HTTP Request

↓

Controller

↓

Service

↓

Prisma

↓

PostgreSQL
```

Cada capa deberá cumplir una única responsabilidad.

---

# Organización General

El backend se organizará por dominios funcionales.

```
src/

auth/

users/

categories/

brands/

products/

promotions/

settings/

common/

config/

prisma/
```

Cada módulo será responsable de un dominio específico del negocio.

---

## Relaciones

Las relaciones entre entidades deberán modelarse de acuerdo con las reglas del negocio y no según necesidades temporales de implementación.

Cuando un dominio requiera relaciones muchos a muchos, se utilizarán tablas intermedias explícitas.

Por ejemplo:

- Usuario ↔ Roles
- Rol ↔ Permisos
- Categoría ↔ Marcas
- Producto ↔ Categorías

El objetivo es preservar un modelo consistente y preparado para evolucionar sin romper compatibilidad.

---

## Modelo de Catálogo

El catálogo se organiza en tres niveles: categorías, marcas y productos.

Una categoría puede contener muchas marcas. Una marca puede pertenecer a muchas categorías. Un producto pertenece a una única marca y puede aparecer en muchas categorías.

```
Category ──── CategoryBrand ──── Brand
                                   │
                                   │
Product ────── ProductCategory ────┘
```

Las relaciones muchos a muchos se resuelven mediante tablas intermedias explícitas:

- `category_brands`: vincula categorías con marcas.
- `product_categories`: vincula productos con categorías.

Desde una categoría es posible conocer sus marcas disponibles y filtrar productos por marca dentro de esa categoría. Esto permite construir navegación jerárquica y filtros sin duplicar datos.

---

# Responsabilidades

## Controllers

Los Controllers representan el punto de entrada de la API.

Su responsabilidad consiste en:

- recibir solicitudes HTTP;
- validar DTOs;
- invocar los Services correspondientes;
- devolver respuestas.

Los Controllers nunca deberán contener lógica de negocio.

---

## Services

Los Services representan el núcleo funcional del sistema.

Aquí deberán implementarse:

- reglas de negocio;
- validaciones funcionales;
- permisos;
- procesos;
- cálculos;
- coordinación entre módulos.

Toda decisión funcional deberá implementarse en esta capa.

---

## Prisma

Prisma constituye el mecanismo principal de acceso a la base de datos.

Durante la Fase 1 los Services utilizarán Prisma directamente.

No existirá una capa Repository general.

Si en futuras etapas un dominio específico requiere consultas complejas, múltiples fuentes de datos, CQRS o estrategias de optimización, podrá incorporarse una capa Repository exclusivamente para ese dominio, sin modificar la arquitectura del resto del sistema.

---

# Convenciones Prisma

## Modelos

Los modelos de Prisma se escribirán en PascalCase.

Ejemplos:

```
User
Role
Permission
RefreshToken
Category
Brand
Product
CategoryBrand
ProductCategory
```

## Tablas

Las tablas físicas utilizarán plural y snake_case.

Ejemplos:

```
users
roles
permissions
refresh_tokens
categories
brands
products
category_brands
product_categories
product_images
user_roles
```

## Campos

Todos los campos utilizarán camelCase.

Ejemplos:

```
firstName
lastName
createdAt
updatedAt
deletedAt
emailVerifiedAt
```

## Identificadores

Todas las entidades utilizarán:

```
id String @id @default(cuid())
```

## Fechas

Todas las entidades utilizarán:

```
createdAt
updatedAt
```

Las entidades con borrado lógico utilizarán además:

```
deletedAt
```

---

# Modelado

El archivo `schema.prisma` constituye la única fuente de verdad del modelo de datos.

No se crearán Entities duplicando la estructura definida en Prisma.

Las modificaciones estructurales deberán realizarse siempre desde este archivo.

## Convenciones del modelo

Todas las entidades deberán respetar una estructura común.

Como regla general utilizarán:

- `id` como `String @id @default(cuid())`;
- `createdAt` con `@default(now())`;
- `updatedAt` con `@updatedAt`.

Las entidades que requieran borrado lógico incorporarán además:

- `deletedAt`.

## Modelos del catálogo

```prisma
model Category {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  brands   CategoryBrand[]
  products ProductCategory[]

  @@map("categories")
}

model Brand {
  id        String   @id @default(cuid())
  name      String
  logo      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  categories CategoryBrand[]
  products   Product[]

  @@map("brands")
}

model Product {
  id        String    @id @default(cuid())
  name      String
  price     Decimal
  brandId   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  brand      Brand             @relation(fields: [brandId], references: [id])
  categories ProductCategory[]
  images     ProductImage[]

  @@map("products")
}

model CategoryBrand {
  categoryId String
  brandId    String

  category Category @relation(fields: [categoryId], references: [id])
  brand    Brand    @relation(fields: [brandId], references: [id])

  @@id([categoryId, brandId])
  @@map("category_brands")
}

model ProductCategory {
  productId  String
  categoryId String

  product  Product  @relation(fields: [productId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])

  @@id([productId, categoryId])
  @@map("product_categories")
}
```

---

# Arquitectura Modular

Cada módulo administrará un dominio del negocio.

```
Categories
Brands
Products
Promotions
Users
Settings
Authentication
```

Cada módulo contendrá únicamente los elementos necesarios para su funcionamiento.

```
controller
service
dto
types (cuando resulte necesario)
```

La comunicación entre módulos deberá realizarse mediante Services.

Un módulo nunca accederá directamente a la base de datos administrada por otro módulo.

## Responsabilidades por módulo del catálogo

**CategoriesService**
- CRUD de categorías.
- Consulta de marcas disponibles dentro de una categoría.
- Consulta de productos dentro de una categoría con filtros opcionales por marca.

**BrandsService**
- CRUD de marcas.
- Consulta de categorías a las que pertenece una marca.
- Consulta de productos de una marca.

**ProductsService**
- CRUD de productos.
- Asignación del producto a categorías (`product_categories`).
- Verificación y registro de la relación marca ↔ categoría (`category_brands`) al asignar un producto a una categoría.
- Gestión de imágenes vía Cloudinary.

La lógica de consistencia entre `product_categories` y `category_brands` reside en `ProductsService`, ya que es quien dispara la acción de asignación.

---

# API REST

Toda comunicación con clientes externos se realizará mediante una API REST.

```
Frontend

↓

REST API

↓

Backend
```

La API constituye el único punto de acceso al sistema.

Toda regla de negocio deberá ejecutarse desde el backend.

---

# Seguridad

La autenticación utilizará JWT.

La autorización utilizará Roles y Permisos.

Toda validación de permisos deberá realizarse en el backend.

El frontend podrá ocultar botones o funcionalidades para mejorar la experiencia del usuario, pero nunca será considerado un mecanismo de seguridad.

---

# Validaciones

Las validaciones se realizan en dos niveles.

## Frontend

El frontend validará toda la información posible antes de enviarla al servidor.

Su objetivo es mejorar la experiencia del usuario evitando solicitudes innecesarias.

Ejemplos:

- campos obligatorios;
- formato de correo electrónico;
- longitud mínima;
- números únicamente;
- formatos válidos;
- mensajes inmediatos de error.

Estas validaciones no reemplazan las realizadas por el backend.

## Backend

Toda solicitud será nuevamente validada.

Incluyendo:

- autenticación;
- autorización;
- integridad de datos;
- reglas de negocio;
- consistencia del sistema.

El backend nunca confiará en la información recibida desde el cliente.

---

# Gestión de Archivos

Las imágenes serán administradas mediante Cloudinary.

El backend será responsable de:

- subir archivos;
- eliminar archivos;
- asociarlos con productos y marcas;
- mantener la integridad de la información.

La lógica relacionada con archivos nunca deberá implementarse en el frontend.

---

# Configuración

El backend almacenará únicamente la configuración funcional del negocio.

Por ejemplo:

- nombre comercial;
- información de contacto;
- WhatsApp;
- correo electrónico;
- redes sociales;
- moneda;
- horarios de atención.

La experiencia visual continuará siendo responsabilidad del frontend.

La configuración no permitirá modificar la arquitectura visual del sistema.

Las personalizaciones visuales serán implementadas durante el desarrollo por el equipo técnico y únicamente podrán habilitarse o deshabilitarse mediante configuraciones específicas cuando aporten valor real al producto.

---

# Comunicación entre Frontend y Backend

Toda comunicación se realizará exclusivamente mediante la API REST.

El frontend nunca accederá directamente a Prisma ni a la base de datos.

Toda modificación de información deberá pasar por el backend.

Esto garantiza:

- una única fuente de verdad;
- centralización de la lógica de negocio;
- reutilización de la API;
- consistencia del sistema.

---

# CORS

El backend controlará qué aplicaciones podrán consumir la API mediante la configuración de CORS.

Durante el desarrollo se permitirán únicamente los orígenes autorizados.

En producción sólo podrán consumir la API los dominios configurados para cada instalación.

---

# Escalabilidad

La arquitectura permitirá incorporar nuevos módulos sin modificar los existentes.

## Segunda etapa

- stock;
- pedidos;
- clientes;
- promociones avanzadas.

## Tercera etapa

- carrito de compras;
- checkout;
- pagos online;
- envíos;
- historial de pedidos;
- métricas;
- notificaciones.

Cada nueva funcionalidad deberá incorporarse como un módulo independiente respetando la arquitectura existente.

El modelo de catálogo ya permite construir métricas por categoría, marca y producto mediante joins sobre las tablas intermedias, sin necesidad de modificar el esquema.

---

# Evolución Tecnológica

La arquitectura no impide incorporar nuevas estrategias cuando exista una necesidad concreta.

Por ejemplo:

- Repository por dominio;
- CQRS;
- Redis;
- colas de procesamiento;
- cache distribuido;
- búsquedas avanzadas;
- microservicios.

Estas tecnologías sólo deberán incorporarse cuando resuelvan un problema real del producto y no por anticipación.

---

# Principios Arquitectónicos

Toda evolución del backend deberá respetar permanentemente los siguientes criterios.

- una única API por instalación;
- lógica de negocio centralizada;
- separación clara de responsabilidades;
- arquitectura modular;
- una única fuente de verdad para los datos;
- frontend desacoplado de la lógica de negocio;
- validaciones en frontend y backend con responsabilidades diferentes;
- seguridad validada exclusivamente en el servidor;
- crecimiento progresivo por dominios;
- simplicidad antes que complejidad.

---

# Evolución

El objetivo de esta arquitectura no es resolver únicamente las necesidades actuales.

Su propósito es servir como base para futuras implementaciones del producto.

La incorporación de nuevas funcionalidades deberá realizarse agregando nuevos módulos o ampliando los existentes, preservando la estabilidad del sistema y evitando reestructuraciones importantes.
