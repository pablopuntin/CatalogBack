Después podremos mejorar el refresh implementando rotación de Refresh Tokens (invalidar el viejo y generar uno nuevo), que hoy es la práctica recomendada, pero para un Starter esta primera versión ya deja el módulo de autenticación completo y funcional.

# Convenciones Prisma

## Modelos

Los modelos de Prisma se escribirán en PascalCase.

Ejemplos:

User
Role
Permission
RefreshToken
Product

## Tablas

Las tablas físicas utilizarán:

- plural
- snake_case

Ejemplos:

users
roles
permissions
refresh_tokens
product_images
user_roles

## Campos

Todos los campos utilizarán camelCase.

Ejemplos:

firstName
lastName
createdAt
updatedAt
deletedAt
emailVerifiedAt

## Identificadores

Todas las entidades utilizarán:

id String @id @default(cuid())

## Fechas

Todas las entidades utilizarán:

createdAt
updatedAt

Las entidades con borrado lógico utilizarán además:

deletedAt

Auditoría

Todas las entidades tendrán:

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
Borrado lógico

Sólo cuando tenga sentido.

deletedAt DateTime?

User
└── roles[]

Role
├── users[]
└── permissions[]

Permission
└── roles[]

Product
├── brand
├── categories[]
├── images[]
└── promotions[] (cuando exista)

Category
└── products[]

Brand
└── products[]


estándar para todos los modelos de Prisma.

Por ejemplo, cuando escribamos un modelo, siempre respetaremos este orden:

model User {

  // Identidad
  id

  // Datos propios
  ...

  // Relaciones
  ...

  // Auditoría
  createdAt
  updatedAt
  deletedAt

}


El panorama completo quedaría aproximadamente así
Security

Permission
Role
User

Business

BusinessSetting

Catalog

Category
Brand
Promotion
Product
ProductImage

Consultas

Inquiry
InquiryItem

Y las relaciones serían aproximadamente estas:

Permission
      ▲
      │
      │ N:M
      │
Role
      ▲
      │ N:M
      │
User


Category
      ▲
      │ 1:N
      │
Product
      │
      ├──────────► Brand (N:1)
      │
      ├──────────► Promotion (N:1 opcional)
      │
      └──────────► ProductImage (1:N)


Inquiry
      │
      └──────────► InquiryItem (1:N)
                          │
                          ▼
                      Product

estructura del starter auth

src/
│
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── prisma/
│   └── types/
│
├── config/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   └── permissions/
│
├── app.module.ts
└── main.ts

Convención de orden dentro de los Controllers

Siempre escribir los métodos en este orden:

POST
GET
PATCH
DELETE
POR EJEMPLO
register()

login()

me()

findAll()

findOne()

update()

remove()

