# Backend Starter

Base reutilizable para construir aplicaciones backend con NestJS y Prisma.

---

## Índice

1. [Objetivo](#1-objetivo)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Flujo de una petición](#5-flujo-de-una-petición)
6. [Módulos](#6-módulos)
7. [Autenticación](#7-autenticación)
8. [Autorización — RBAC](#8-autorización--rbac)
9. [Prisma](#9-prisma)
10. [Seeds](#10-seeds)
11. [Variables de entorno](#11-variables-de-entorno)
12. [Swagger](#12-swagger)
13. [Convenciones de código](#13-convenciones-de-código)
14. [Buenas prácticas](#14-buenas-prácticas)
15. [Adaptar el Starter a un nuevo proyecto](#15-adaptar-el-starter-a-un-nuevo-proyecto)
16. [Crear un módulo nuevo](#16-crear-un-módulo-nuevo)
17. [Checklist antes de dar por terminado un módulo](#17-checklist-antes-de-dar-por-terminado-un-módulo)
18. [Inicio rápido](#18-inicio-rápido)
19. [Decisiones arquitectónicas](#19-decisiones-arquitectónicas)
20. [Versión](#20-versión)

---

## 1. Objetivo

Backend Starter es una base reutilizable para construir aplicaciones backend con NestJS y Prisma siguiendo una arquitectura modular, mantenible y escalable.

El objetivo es evitar reescribir siempre la misma infraestructura (autenticación, autorización, usuarios, JWT, Swagger, etc.) y comenzar cada nuevo desarrollo sobre una base sólida.

Este Starter no contiene lógica de negocio. Toda funcionalidad específica (Catálogo, ERP, CRM, Gimnasio, Turnos, etc.) se implementa posteriormente utilizando esta base.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | NestJS 11 |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Autenticación | Passport + JWT + Refresh Tokens + bcrypt |
| Documentación | Swagger |
| Validaciones | class-validator + class-transformer |
| Configuración | @nestjs/config + variables de entorno |

---

## 3. Arquitectura

La arquitectura está organizada por módulos. Cada módulo encapsula completamente una responsabilidad.

```
modules/
  auth/
  users/
  roles/
  permissions/
  refresh-tokens/
  user-roles/
  role-permissions/
```

Cada módulo contiene únicamente lo que necesita:

```
auth/
  controller
  service
  dto
  guards
  decorators
  strategy
```

No existen dependencias innecesarias entre módulos.

### Flujo general

```
Cliente
  ↓
Controller
  ↓
Service
  ↓
PrismaService
  ↓
PostgreSQL
```

Un Controller nunca accede directamente a Prisma. Toda la lógica vive en los Services.

---

## 4. Estructura del proyecto

```
src/
  app.module.ts
  main.ts
  modules/
  prisma/
  common/
```

**modules** — toda la lógica de negocio; cada módulo representa una responsabilidad.

**prisma** — contiene PrismaService; es el único acceso a la base de datos.

**common** — componentes reutilizables: decoradores, guards, interceptors, pipes, helpers, constantes.

---

## 5. Flujo de una petición

Ejemplo: `POST /auth/login`

```
AuthController
  ↓
AuthService
  ↓
UsersService
  ↓
PrismaService
  ↓
PostgreSQL
  ↓
Respuesta
```

Cada capa tiene una única responsabilidad.

---

## 6. Módulos

### Auth
- Registro
- Login
- Logout
- Auth/me
- Generación y validación de JWT

No administra usuarios.

### Users
- Crear, buscar, actualizar y eliminar usuarios.

No autentica usuarios.

### RefreshTokens
- Crear, invalidar y renovar Refresh Tokens.

No genera Access Tokens.

### Roles
Administra roles del sistema. Roles disponibles por defecto:

```typescript
// src/common/roles.ts
export enum SystemRole {
  ROOT     = 'ROOT',
  ADMIN    = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}
```

### Permissions
Administra permisos del sistema. Los permisos siguen siempre el formato:

```
recurso.accion
```

Ejemplos: `users.read`, `products.create`, `turnos.cancel`.

### UserRoles
Relaciona usuarios con roles.

### RolePermissions
Relaciona roles con permisos.

---

## 7. Autenticación

El Starter utiliza JWT. No utiliza sesiones almacenadas en servidor.

### Register

```
DTO
  ↓
Verificar email único
  ↓
Hash contraseña
  ↓
Crear usuario
  ↓
Respuesta (sin contraseña)
```

### Login

```
Buscar usuario
  ↓
Comparar contraseña (bcrypt)
  ↓
Generar Access Token
  ↓
Generar Refresh Token
  ↓
Guardar Refresh Token hasheado
  ↓
Responder tokens
```

### Access Token

- Duración recomendada: `1h`
- Contenido: `sub`, `firstName`, `lastName`
- Se envía siempre como: `Authorization: Bearer TOKEN`

El token debe ser liviano. No se almacena información innecesaria.

### Refresh Token

- Duración recomendada: `7d`
- Se almacena hasheado en la base de datos (bcrypt).
- Se usa únicamente para generar un nuevo Access Token.
- Nunca autoriza directamente una petición a la API.

### Logout

- Elimina el Refresh Token de la base de datos.
- El Access Token sigue siendo válido hasta su expiración (máximo 1 hora).
- Este comportamiento es parte del diseño del Starter.

### Auth/me

Obtiene la información del usuario autenticado directamente desde el JWT. No consulta la base de datos.

### Política de sesiones

Toda modificación de información de identidad invalida la sesión actual. El usuario deberá autenticarse nuevamente. Esto incluye:

- contraseña
- email
- nombre y apellido
- roles
- permisos

Esto garantiza que el JWT siempre represente el estado actual del usuario.

---

## 8. Autorización — RBAC

El Starter implementa un sistema RBAC (Role Based Access Control).

```
Usuario
  ↓
UserRole
  ↓
Role
  ↓
RolePermission
  ↓
Permission
```

Un usuario nunca recibe permisos directamente. Siempre los obtiene a través de uno o varios Roles.

### Flujo de autorización

```
Request
  ↓
JWT válido
  ↓
JwtStrategy
  ↓
Usuario autenticado
  ↓
RolesGuard
  ↓
PermissionsGuard
  ↓
Controller
```

### Proteger un endpoint

```typescript
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Roles(SystemRole.ADMIN)
@Permissions('products.create')
```

El Controller permanece limpio. Toda la lógica vive en los Guards.

### Granularidad de permisos

El sistema soporta permisos específicos:

```
products.price.update
products.stock.update
orders.cancel
orders.refund
cash.movements.create
```

La granularidad depende del negocio. La infraestructura permanece igual.

---

## 9. Prisma

Toda interacción con la base de datos se realiza mediante `PrismaService`. No deben coexistir otros mecanismos de acceso.

```typescript
constructor(
  private readonly prisma: PrismaService,
) {}
```

### Migraciones

Cada modificación del `schema.prisma` requiere una migración:

```bash
npx prisma migrate dev --name descripcion_del_cambio
npx prisma generate
```

En producción, únicamente:

```bash
npx prisma migrate deploy
```

Nunca usar `migrate dev` en producción.

---

## 10. Seeds

Los Seeds cargan la información inicial necesaria para el funcionamiento del sistema: Roles, Permisos y relaciones RolePermission.

```bash
npx prisma db seed
```

Los Seeds son idempotentes — pueden ejecutarse múltiples veces sin duplicar información. Internamente utilizan `upsert`.

### Organización

```
prisma/
  seed.ts
  roles.seed.ts
  permissions.seed.ts
  role-permissions.seed.ts
```

Cada archivo tiene una única responsabilidad.

### Agregar un nuevo Seed

Crear el archivo con una función exportada:

```typescript
export async function seedCategories(prisma: PrismaClient) {}
```

Importarlo en `seed.ts`. No modificar otros archivos.

---

## 11. Variables de entorno

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
```

No almacenar secretos dentro del código fuente. Toda configuración debe provenir de `.env`.

---

## 12. Swagger

Toda la API se documenta utilizando Swagger. La documentación crece junto con el proyecto y nunca se deja para el final.

Acceso: `/swagger`

### Configuración en main.ts

```typescript
const config = new DocumentBuilder()
  .setTitle('Backend Starter')
  .setDescription('API del Backend Starter')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
```

### Controllers

```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {}
```

### Endpoints

```typescript
@ApiOperation({ summary: 'Registrar un usuario' })
@ApiResponse({ status: 201, description: 'Usuario creado correctamente.' })
```

Cuando corresponda agregar también: `@ApiBadRequestResponse()`, `@ApiUnauthorizedResponse()`, `@ApiForbiddenResponse()`, `@ApiNotFoundResponse()`, `@ApiConflictResponse()`.

### DTOs

```typescript
@ApiProperty({
  example: 'Juan',
  description: 'Nombre del usuario',
})
```

### Endpoints protegidos

```typescript
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
```

### Ejemplos en Swagger

Los ejemplos nunca deben contener información personal. Usar siempre datos genéricos:

```
Juan / Pérez / juan.perez@email.com
```

---

## 13. Convenciones de código

### Nombres de archivos

```
users.module.ts
users.service.ts
users.controller.ts
create-user.dto.ts
update-user.dto.ts
```

### DTOs

Un DTO representa una única operación: `RegisterDto`, `LoginDto`, `CreateProductDto`, `UpdateProductDto`.

### Métodos de Service

```
create()     findAll()     findById()
update()     delete()      findByEmail()
assignRole() removeRole()
```

### Excepciones

Siempre usar las excepciones propias de NestJS:

```
BadRequestException    UnauthorizedException
ForbiddenException     ConflictException
NotFoundException
```

---

## 14. Buenas prácticas

- Siempre validar mediante DTO.
- Nunca acceder a Prisma desde Controllers.
- Nunca guardar contraseñas sin hash.
- Nunca guardar Refresh Tokens sin hash.
- Nunca acceder directamente a la base desde Guards.
- Nunca asignar permisos directamente a usuarios — siempre mediante Roles.
- Siempre documentar endpoints nuevos en Swagger.
- Siempre crear migraciones ante cambios en el schema.
- Siempre crear Seeds cuando corresponda.
- Siempre mantener responsabilidades separadas.

---

## 15. Adaptar el Starter a un nuevo proyecto

Al iniciar un proyecto nuevo, los únicos archivos que requieren modificación son los de dominio. La infraestructura no se toca.

### Paso 1 — `prisma/permissions.seed.ts`

Reemplazar los permisos de dominio por los del nuevo proyecto. Los permisos de infraestructura (`users.*`, `roles.*`, `permissions.*`) no se modifican.

Ejemplo para una app de turnos:

```typescript
const permissions = [
  // Infraestructura — no modificar
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'roles.read',
  'roles.assign',
  'permissions.read',

  // Dominio del proyecto
  'turnos.read',
  'turnos.create',
  'turnos.update',
  'turnos.delete',
  'turnos.cancel',

  'agenda.read',
  'agenda.configure',

  'clientes.read',
  'clientes.create',
  'clientes.update',
  'clientes.delete',
];
```

### Paso 2 — `prisma/role-permissions.seed.ts`

Actualizar qué permisos tiene cada rol según el nuevo dominio.

### Paso 3 — Ejecutar el seed

```bash
npx prisma db seed
```

No se requiere migración. El schema de Prisma no cambia — la tabla `Permission` sigue siendo la misma. Solo cambian los datos.

### Qué no hay que tocar

| Archivo | ¿Se modifica? |
|---|---|
| Schema de Prisma | No |
| Módulos de Auth | No |
| Módulos de Users | No |
| Módulos de Roles | No |
| Guards | No |
| `roles.seed.ts` | Generalmente no |
| `permissions.seed.ts` | Sí — dominio |
| `role-permissions.seed.ts` | Sí — dominio |

---

## 16. Crear un módulo nuevo

Flujo recomendado:

1. Crear modelo en `schema.prisma`
2. Crear migración (`npx prisma migrate dev --name nombre`)
3. Ejecutar `npx prisma generate`
4. Crear módulo
5. Crear DTOs
6. Crear Service
7. Crear Controller
8. Documentar Swagger
9. Definir permisos
10. Actualizar Seeds si corresponde
11. Proteger endpoints

Seguir siempre este orden reduce errores y mantiene consistencia.

---

## 17. Checklist antes de dar por terminado un módulo

- [ ] Migración creada
- [ ] Cliente Prisma actualizado (`prisma generate`)
- [ ] DTOs validados
- [ ] Swagger actualizado
- [ ] Endpoints funcionando
- [ ] Excepciones manejadas
- [ ] Guards aplicados donde corresponda
- [ ] Permisos definidos
- [ ] Seeds actualizados si aplica
- [ ] Código compilando sin errores

---

## 18. Inicio rápido

```bash
git clone <repositorio>
npm install
cp .env.example .env   # completar variables
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npm run start:dev
```

Con eso el Starter queda completamente operativo.

---

## 19. Decisiones arquitectónicas

| ID | Decisión |
|---|---|
| DA-001 | Prisma como única fuente de acceso a datos. No mezclar ORMs ni SQL embebido. |
| DA-002 | Controllers sin lógica. Solo reciben, validan DTO, llaman al Service y responden. |
| DA-003 | Toda regla de negocio pertenece al Service correspondiente. |
| DA-004 | Un módulo, una responsabilidad. Nunca mezclar dominios. |
| DA-005 | Relaciones N:N siempre mediante tablas puente (UserRole, RolePermission). |
| DA-006 | JWT liviano — solo `sub`, `firstName`, `lastName`. Sin información innecesaria. |
| DA-007 | Refresh Tokens persistentes en base de datos. |
| DA-008 | Refresh Tokens siempre hasheados con bcrypt. |
| DA-009 | Passwords siempre hasheadas antes de persistir. |
| DA-010 | DTO obligatorios para toda entrada a la API. |
| DA-011 | Swagger obligatorio — todo endpoint nuevo debe documentarse. |
| DA-012 | Migraciones obligatorias ante cualquier cambio de schema. Nunca modificar la base manualmente. |
| DA-013 | Seeds idempotentes — pueden ejecutarse infinitas veces sin duplicar datos. |
| DA-014 | Todo endpoint privado requiere autenticación. Los permisos agregan autorización. |

---

## 20. Versión

**v1.0.0**

### Componentes implementados

- NestJS 11
- Prisma ORM
- PostgreSQL
- Swagger
- JWT + Refresh Tokens + Logout + Auth/me
- Passport
- DTO Validation
- Roles + Permissions + RBAC
- Seeds
- Arquitectura modular

### Proyectos objetivo

Este Starter está diseñado para servir como base de múltiples proyectos: Catálogo Comercial, ERP, CRM, Sistema de Turnos, Gestión de Gimnasios, APIs privadas y sistemas internos.

La lógica de negocio nunca debe incorporarse al Starter.
