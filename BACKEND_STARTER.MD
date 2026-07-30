# BACKEND_STARTER.md

# Backend Starter v1.0

---

# 1. Objetivo

Backend Starter es una base reutilizable para construir aplicaciones backend con NestJS y Prisma siguiendo una arquitectura modular, mantenible y escalable.

El objetivo del proyecto es evitar reescribir siempre la misma infraestructura (autenticación, autorización, usuarios, JWT, Swagger, etc.) y comenzar cada nuevo desarrollo sobre una base sólida.

Este Starter no contiene lógica de negocio.

Toda funcionalidad específica (Catálogo, ERP, CRM, Gimnasio, etc.) se implementa posteriormente utilizando esta base.

---

# 2. Filosofía del proyecto

El Starter fue construido siguiendo algunos principios simples.

## Simplicidad

No agregar complejidad hasta que sea necesaria.

La arquitectura debe resolver problemas reales y no hipotéticos.

---

## Reutilización

Todo módulo desarrollado debe poder reutilizarse en proyectos futuros.

La infraestructura nunca debe depender del dominio.

---

## Separación de responsabilidades

Cada módulo tiene una única responsabilidad.

Ejemplo:

* Auth autentica.
* Users administra usuarios.
* Roles administra roles.
* Permissions administra permisos.
* RefreshTokens administra sesiones.

Ningún módulo debe asumir responsabilidades ajenas.

---

## Seguridad

Toda validación importante ocurre en el backend.

El frontend únicamente consume la API.

Nunca se confía en datos enviados por el cliente.

---

## Escalabilidad

La arquitectura debe permitir crecer sin modificar lo ya construido.

Agregar nuevos módulos no debe afectar los existentes.

---

# 3. Stack tecnológico

## Framework

NestJS 11

---

## ORM

Prisma

---

## Base de datos

PostgreSQL

---

## Autenticación

Passport

JWT

Refresh Tokens

bcrypt

---

## Documentación

Swagger

---

## Validaciones

class-validator

class-transformer

---

## Configuración

@nestjs/config

Variables de entorno (.env)

---

# 4. Arquitectura

La arquitectura está organizada por módulos.

Cada módulo encapsula completamente una responsabilidad.

Ejemplo:

```text
modules/

auth/

users/

roles/

permissions/

refresh-tokens/

user-roles/

role-permissions/
```

Cada módulo contiene únicamente aquello que necesita.

Por ejemplo:

```text
auth/

controller

service

dto

guards

decorators

strategy
```

No existen dependencias innecesarias entre módulos.

---

# 5. Flujo general del sistema

El flujo principal es:

Cliente

↓

Controller

↓

Service

↓

Prisma

↓

Base de datos

Nunca un Controller accede directamente a Prisma.

Toda la lógica debe vivir dentro de los Services.

---

# 6. Estructura del proyecto

```text
src/

app.module.ts

main.ts

modules/

prisma/

common/
```

## modules

Contiene toda la lógica de negocio.

Cada módulo representa una responsabilidad.

---

## prisma

Contiene PrismaService.

Es el único acceso a la base de datos.

---

## common

Reservado para componentes reutilizables.

Por ejemplo:

* Decoradores
* Guards
* Interceptors
* Pipes
* Helpers

---

# 7. Flujo de una petición

Ejemplo:

POST /auth/login

↓

AuthController

↓

AuthService

↓

UsersService

↓

Prisma

↓

PostgreSQL

↓

Respuesta

Cada capa posee una única responsabilidad.

---

# 8. Responsabilidad de cada módulo

## Auth

Responsable de:

* Registro
* Login
* JWT
* Logout
* Auth/me

No administra usuarios.

---

## Users

Responsable de:

* Buscar usuarios
* Crear usuarios
* Actualizar usuarios
* Eliminar usuarios

No autentica usuarios.

---

## RefreshTokens

Responsable de:

* Crear Refresh Tokens
* Invalidarlos
* Renovar sesiones

No genera Access Tokens.

---

## Roles

Responsable de administrar roles.

Ejemplo:

ROOT

ADMIN

EMPLOYEE

---

## Permissions

Responsable de administrar permisos.

Ejemplo:

products.read

products.create

users.delete

etc.

---

## UserRoles

Relaciona usuarios con roles.

---

## RolePermissions

Relaciona roles con permisos.

---

# 9. Convenciones

Los Controllers:

* reciben requests;
* validan DTO;
* llaman al Service;
* devuelven la respuesta.

Nunca contienen lógica de negocio.

---

Los Services:

* implementan toda la lógica;
* acceden a Prisma;
* lanzan excepciones cuando corresponde.

---

Los DTO:

* validan datos;
* documentan Swagger;
* nunca contienen lógica.

---

# 10. Convenciones generales

Las contraseñas siempre se almacenan hasheadas.

Nunca se guarda una contraseña en texto plano.

---

Los Refresh Tokens siempre se almacenan hasheados.

Nunca se almacena el token original.

---

Toda modificación de identidad invalida la sesión.

Incluye:

* contraseña
* email
* nombre
* apellido
* roles
* permisos

El usuario debe autenticarse nuevamente.

---

Los permisos siempre se asignan mediante Roles.

Nunca directamente a un usuario.

---

Toda autenticación utiliza JWT.

Nunca sesiones de servidor.

---

Las validaciones se realizan mediante DTO.

Nunca dentro del Controller.

# 11. Prisma

Prisma es el único ORM utilizado por el Starter.

Toda interacción con la base de datos debe realizarse exclusivamente mediante Prisma.

No deben coexistir otros mecanismos de acceso a datos como TypeORM, Sequelize o consultas SQL embebidas.

---

## PrismaService

El acceso a la base de datos se realiza mediante `PrismaService`.

Todos los Services que necesiten acceder a la base deben inyectarlo.

Ejemplo:

```ts
constructor(
    private readonly prisma: PrismaService,
) {}
```

---

## Regla arquitectónica

Los Controllers nunca utilizan Prisma.

Siempre:

```
Controller
        ↓
Service
        ↓
PrismaService
        ↓
PostgreSQL
```

---

## Migraciones

Cada modificación del archivo `schema.prisma` requiere una migración.

Ejemplo:

```bash
npx prisma migrate dev --name create_roles
```

Luego actualizar el cliente:

```bash
npx prisma generate
```

---

## Producción

En producción únicamente se ejecuta:

```bash
npx prisma migrate deploy
```

Nunca se utiliza `migrate dev`.

---

# 12. Seeds

Los Seeds permiten cargar información inicial necesaria para el funcionamiento del sistema.

En este Starter se utilizan para:

* Roles
* Permisos
* Relaciones RolePermission

---

## Ejecución

```bash
npx prisma db seed
```

---

## Características

Los Seeds son idempotentes.

Esto significa que pueden ejecutarse múltiples veces sin duplicar información.

Internamente utilizan `upsert`.

---

## Organización

```text
prisma/

seed.ts

roles.seed.ts

permissions.seed.ts

role-permissions.seed.ts
```

Cada archivo tiene una única responsabilidad.

---

## Agregar un nuevo Seed

Crear un archivo:

```text
categories.seed.ts
```

Exportar una función:

```ts
export async function seedCategories(
    prisma: PrismaClient,
) {}
```

Importarlo en `seed.ts`.

No modificar otros módulos.

---

# 13. Swagger

Toda la API se documenta utilizando Swagger.

La documentación se genera automáticamente a partir de:

* DTOs
* Decoradores
* Controllers

---

## Acceso

```
/swagger
```

---

## DTOs

Todo DTO debe documentarse.

Ejemplo:

```ts
@ApiProperty({
    example: "Juan"
})
```

---

## Endpoints

Cada endpoint debe tener:

* ApiOperation
* ApiBody
* ApiOkResponse

Y cuando corresponda:

* ApiUnauthorizedResponse
* ApiConflictResponse
* ApiForbiddenResponse
* ApiBearerAuth

---

## Endpoints protegidos

Siempre agregar:

```ts
@ApiBearerAuth('JWT')
```

y

```ts
@UseGuards(AuthGuard('jwt'))
```

---

# 14. Autenticación

El Starter utiliza JWT.

No utiliza sesiones almacenadas en servidor.

---

## Register

Flujo:

```
Cliente

↓

DTO

↓

Verificar email

↓

Hash contraseña

↓

Crear usuario

↓

Respuesta
```

Nunca se devuelve la contraseña.

---

## Login

Flujo:

```
Buscar usuario

↓

Comparar contraseña

↓

Generar JWT

↓

Generar Refresh Token

↓

Guardar Refresh Token hasheado

↓

Responder Tokens
```

---

## JWT

El Access Token contiene únicamente información necesaria para identificar al usuario durante la sesión.

Actualmente:

* id
* nombre
* apellido

La política del Starter establece que cualquier cambio en estos datos invalida la sesión.

---

## Access Token

Duración recomendada:

```
1 hora
```

Debe enviarse siempre mediante:

```
Authorization

Bearer TOKEN
```

---

## Refresh Token

Duración recomendada:

```
7 días
```

Nunca se almacena en texto plano.

Siempre se guarda hasheado utilizando bcrypt.

---

## Refresh

El endpoint Refresh genera un nuevo Access Token utilizando un Refresh Token válido.

No requiere credenciales nuevamente.

---

## Logout

El Logout elimina el Refresh Token almacenado.

A partir de ese momento no es posible renovar la sesión.

El Access Token continuará siendo válido hasta su expiración.

Esto forma parte del diseño del Starter.

---

## Auth/me

Permite obtener información del usuario autenticado.

Flujo:

```
Bearer Token

↓

JwtStrategy

↓

validate()

↓

req.user

↓

Controller
```

No consulta la base de datos.

Obtiene la información directamente desde el JWT.

---

# 15. JwtStrategy

JwtStrategy es el componente encargado de validar el JWT recibido.

Si el token:

* es válido;
* está firmado correctamente;
* no expiró;

Passport ejecuta automáticamente:

```ts
validate(payload)
```

El objeto retornado será inyectado en:

```ts
req.user
```

---

# 16. Política de sesiones

El Starter define la siguiente regla.

Toda modificación de información de identidad invalida la sesión actual.

Incluye:

* contraseña
* email
* nombre
* apellido
* roles
* permisos

Luego de modificar cualquiera de estos datos el usuario debe iniciar sesión nuevamente.

Esto garantiza que el JWT siempre represente el estado actual del usuario.

---

# 17. Variables de entorno

Variables mínimas requeridas.

```env
DATABASE_URL=

JWT_SECRET=

JWT_EXPIRES_IN=1h

REFRESH_TOKEN_EXPIRES_IN=7d
```

No deben almacenarse secretos dentro del código fuente.

Toda configuración debe provenir del archivo `.env`.


# 18. Autorización

La autenticación responde la pregunta:

> ¿Quién sos?

La autorización responde:

> ¿Qué podés hacer?

En este Starter ambas responsabilidades están completamente separadas.

---

# 19. Modelo RBAC

El Starter implementa un sistema RBAC (Role Based Access Control).

La relación es:

```text
Usuario
      │
      ▼
UserRole
      │
      ▼
Role
      │
      ▼
RolePermission
      │
      ▼
Permission
```

Un usuario nunca recibe permisos directamente.

Siempre obtiene permisos a través de uno o varios Roles.

---

# 20. Roles

Un Rol representa una función dentro del sistema.

Ejemplos:

```text
ROOT

ADMIN

EMPLOYEE
```

Un usuario puede tener uno o varios Roles.

Ejemplo:

Juan

↓

ADMIN

EMPLOYEE

---

# 21. Permissions

Los permisos representan acciones concretas.

Ejemplos:

```text
users.read

users.create

users.update

users.delete

products.read

products.create

products.update

products.delete
```

Los permisos deben seguir siempre el formato:

```text
recurso.accion
```

Ejemplos válidos:

```text
clients.read

orders.update

cash.delete

sales.create
```

---

# 22. RolePermission

RolePermission relaciona Roles con Permissions.

Ejemplo:

```text
ADMIN

↓

users.read

users.create

users.update

products.*

orders.*
```

Mientras que:

```text
EMPLOYEE

↓

products.read

orders.create
```

No existe lógica de permisos dentro del código.

Todo proviene de la base de datos.

---

# 23. UserRole

UserRole relaciona Usuarios con Roles.

Ejemplo:

```text
Juan

↓

ADMIN
```

o

```text
Juan

↓

ADMIN

↓

EMPLOYEE
```

Esto permite que un usuario tenga múltiples responsabilidades.

---

# 24. Flujo de autorización

Cuando un endpoint requiere permisos ocurre el siguiente flujo:

```text
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

Si cualquiera de los pasos falla, la petición se rechaza.

---

# 25. Proteger un endpoint

Un endpoint protegido normalmente utiliza:

```ts
@ApiBearerAuth('JWT')

@UseGuards(AuthGuard('jwt'))
```

Cuando se agreguen Roles y Permissions se extenderá con:

```ts
@Roles('ADMIN')
```

o

```ts
@Permissions('products.create')
```

El Controller continúa limpio.

Toda la lógica vive en los Guards.

---

# 26. Agregar un nuevo permiso

Supongamos que aparece un módulo nuevo:

```text
Invoices
```

Los permisos recomendados serían:

```text
invoices.read

invoices.create

invoices.update

invoices.delete
```

Luego:

1. agregar el Seed;
2. ejecutar `prisma db seed`;
3. asignarlo al Rol correspondiente.

No hace falta modificar el código.

---

# 27. Agregar un nuevo Rol

Crear el nuevo registro.

Ejemplo:

```text
MANAGER
```

Asignar permisos.

Listo.

No es necesario modificar Guards ni Controllers.

---

# 28. Granularidad

El Starter soporta permisos extremadamente específicos.

Ejemplo:

```text
products.price.update

products.stock.update

products.images.create

products.images.delete
```

o incluso:

```text
orders.cancel

orders.refund

orders.export
```

La granularidad depende únicamente del negocio.

La infraestructura permanece igual.

---

# 29. Convención recomendada

Se recomienda mantener siempre la nomenclatura:

```text
modulo.accion
```

o

```text
modulo.submodulo.accion
```

Ejemplo:

```text
users.read

users.create

products.price.update

products.images.delete

cash.movements.create
```

Esto mantiene consistencia entre todos los proyectos.

---

# 30. Crear un módulo nuevo

El flujo recomendado es:

Crear módulo

↓

Crear DTO

↓

Crear Controller

↓

Crear Service

↓

Crear migración Prisma

↓

Crear permisos

↓

Agregar Seeds

↓

Proteger endpoints

↓

Documentar Swagger

Todos los módulos del Starter deberían seguir exactamente este flujo.

---

# 31. Buenas prácticas

Siempre validar mediante DTO.

Nunca acceder a Prisma desde Controllers.

Nunca guardar contraseñas sin hash.

Nunca guardar Refresh Tokens sin hash.

Nunca acceder directamente a la base desde Guards.

Nunca asignar permisos directamente a usuarios.

Siempre utilizar Roles.

Siempre documentar endpoints nuevos.

Siempre crear migraciones.

Siempre crear Seeds cuando corresponda.

Siempre mantener responsabilidades separadas.

---

# 32. Flujo recomendado para un proyecto nuevo

```text
git clone

↓

npm install

↓

crear .env

↓

npx prisma migrate dev

↓

npx prisma generate

↓

npx prisma db seed

↓

npm run start:dev
```

Con eso el Starter queda completamente operativo.

---

# 33. Estado del Starter

Versión:

```text
v1.0.0
```

Componentes implementados:

* NestJS
* Prisma
* PostgreSQL
* Swagger
* JWT
* Refresh Tokens
* Logout
* Passport
* DTO Validation
* Roles
* Permissions
* RBAC
* Seeds
* Arquitectura Modular

La infraestructura queda lista para comenzar cualquier proyecto de negocio sin necesidad de reescribir autenticación, autorización o configuración básica.


# 34. Decisiones Arquitectónicas

Las siguientes decisiones forman parte del diseño del Starter y deben respetarse en futuros proyectos.

---

## DA-001 — Prisma como única fuente de acceso a datos

Todo acceso a la base de datos debe realizarse mediante Prisma.

No deben mezclarse ORMs.

No deben realizarse consultas SQL desde los módulos.

---

## DA-002 — Controllers sin lógica

Los Controllers únicamente:

* reciben la petición;
* validan el DTO;
* llaman al Service;
* devuelven la respuesta.

Nunca contienen reglas de negocio.

---

## DA-003 — Services responsables de la lógica

Toda regla de negocio pertenece al Service correspondiente.

Si una lógica comienza a crecer demasiado, puede extraerse a un servicio específico, pero nunca pasar al Controller.

---

## DA-004 — Un módulo, una responsabilidad

Cada módulo representa un único dominio técnico.

Ejemplos:

* Auth
* Users
* Roles
* Permissions
* RefreshTokens

Nunca mezclar responsabilidades.

---

## DA-005 — Relaciones mediante tablas puente

Las relaciones N:N siempre se representan mediante tablas puente.

Ejemplo:

User ↔ Role

Role ↔ Permission

Esto facilita auditoría, escalabilidad y futuras ampliaciones.

---

## DA-006 — JWT liviano

El Access Token debe contener únicamente información necesaria durante la sesión.

Actualmente:

* id
* firstName
* lastName

No almacenar información innecesaria.

---

## DA-007 — Refresh Tokens persistentes

Los Refresh Tokens siempre se almacenan en la base de datos.

Nunca confiar únicamente en el cliente.

---

## DA-008 — Refresh Tokens hasheados

Nunca almacenar Refresh Tokens en texto plano.

Siempre utilizar bcrypt.

---

## DA-009 — Passwords hasheadas

Nunca guardar contraseñas sin hash.

El hash se realiza antes de persistir el usuario.

---

## DA-010 — DTO obligatorios

Toda entrada a la API debe validarse mediante DTO.

No aceptar objetos anónimos.

---

## DA-011 — Swagger obligatorio

Todo endpoint nuevo debe documentarse.

Toda modificación debe reflejarse en Swagger.

---

## DA-012 — Migraciones obligatorias

Toda modificación del esquema requiere una migración de Prisma.

Nunca modificar la base manualmente.

---

## DA-013 — Seeds idempotentes

Los Seeds deben poder ejecutarse infinitas veces.

Nunca deben generar información duplicada.

---

## DA-014 — Seguridad por defecto

Todo endpoint privado requiere autenticación.

Los permisos agregan autorización.

Nunca al revés.

---

# 35. Convenciones de Código

## Archivos

Los nombres deben mantenerse consistentes.

Ejemplo:

```text
users.module.ts

users.service.ts

users.controller.ts

create-user.dto.ts

update-user.dto.ts
```

---

## DTO

Un DTO representa una única operación.

Ejemplo:

```text
RegisterDto

LoginDto

CreateProductDto

UpdateProductDto
```

---

## Services

Los métodos deben utilizar verbos claros.

Ejemplo:

```text
create()

update()

delete()

findAll()

findById()

findByEmail()

assignRole()

removeRole()
```

Evitar nombres ambiguos.

---

## Excepciones

Utilizar siempre las excepciones propias de NestJS.

Ejemplos:

```text
BadRequestException

UnauthorizedException

ForbiddenException

ConflictException

NotFoundException
```

No lanzar errores genéricos.

---

# 36. Flujo recomendado para agregar una funcionalidad

Cuando se desarrolla un nuevo módulo se recomienda seguir este orden.

1. Crear el modelo Prisma.
2. Crear migración.
3. Ejecutar migrate.
4. Ejecutar generate.
5. Crear módulo.
6. Crear DTOs.
7. Crear Service.
8. Crear Controller.
9. Documentar Swagger.
10. Crear permisos.
11. Crear Seed si corresponde.
12. Proteger endpoints.

Seguir siempre este flujo reduce errores y mantiene consistencia.

---

# 37. Checklist antes de dar por terminado un módulo

Antes de considerar finalizado un módulo verificar:

* Migraciones creadas.
* Cliente Prisma actualizado.
* DTOs validados.
* Swagger actualizado.
* Endpoints funcionando.
* Excepciones manejadas.
* Guards aplicados donde corresponda.
* Permisos definidos.
* Seeds actualizados si aplica.
* Código compilando sin errores.

---

# 38. Evolución del Starter

La infraestructura actual fue diseñada para servir como base de múltiples proyectos.

Se espera reutilizarla en:

* Catálogo Comercial.
* ERP.
* CRM.
* Sistema de Turnos.
* Gestión de Gimnasios.
* Sistemas internos.
* APIs privadas.

La lógica de negocio nunca debe incorporarse al Starter.

---

# 39. Versionado

El Starter seguirá versionado semántico.

Ejemplo:

```text
1.0.0
```

* Cambios compatibles incrementan la versión menor.
* Correcciones incrementan la versión de parche.
* Cambios incompatibles incrementan la versión mayor.

---

# 40. Estado de la versión 1.0.0

## Infraestructura implementada

* NestJS 11.
* Prisma ORM.
* PostgreSQL.
* ConfigModule.
* Swagger.
* DTO Validation.
* Passport.
* JWT.
* Refresh Tokens.
* Logout.
* Auth/me.
* Roles.
* Permissions.
* UserRoles.
* RolePermissions.
* Seeds.
* Arquitectura modular.

## Objetivo alcanzado

El Backend Starter proporciona una base sólida, reutilizable y desacoplada para iniciar nuevos proyectos sin reimplementar autenticación, autorización, configuración o estructura general.

A partir de esta versión, el desarrollo de nuevos sistemas debe centrarse exclusivamente en el dominio del negocio, reutilizando la infraestructura provista por este Starter.
