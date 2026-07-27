# Convenciones del Starter

Este documento define las convenciones utilizadas en todos los proyectos basados en este Starter.

---

# Swagger

Toda la API deberá documentarse utilizando Swagger desde el momento en que se crea cada endpoint.

La documentación crecerá junto con el proyecto y nunca se dejará para el final.

---

## Controllers

Todos los Controllers deberán utilizar `@ApiTags()` para agrupar correctamente los endpoints.

Ejemplo:

```ts
@ApiTags('Users')
@Controller('users')
export class UsersController {}
```

Otros ejemplos:

```ts
@ApiTags('Authentication')
```

```ts
@ApiTags('Products')
```

```ts
@ApiTags('Categories')
```

---

## Endpoints

Todos los endpoints deberán documentarse mediante:

```ts
@ApiOperation()
```

y

```ts
@ApiResponse()
```

Ejemplo:

```ts
@ApiOperation({
  summary: 'Registrar un usuario'
})

@ApiResponse({
  status: 201,
  description: 'Usuario creado correctamente.'
})
```

Cuando corresponda también podrán utilizarse:

```ts
@ApiBadRequestResponse()

@ApiUnauthorizedResponse()

@ApiForbiddenResponse()

@ApiNotFoundResponse()

@ApiConflictResponse()

@ApiInternalServerErrorResponse()
```

---

## DTOs

Todos los DTOs deberán documentarse utilizando:

```ts
@ApiProperty()
```

Ejemplo:

```ts
@ApiProperty({
  example: 'Juan',
  description: 'Nombre del usuario'
})
```

Cada propiedad deberá incluir, cuando corresponda:

- example
- description
- required
- minLength
- maxLength
- enum

---

## Rutas protegidas

Todo endpoint protegido mediante JWT deberá incluir:

```ts
@ApiBearerAuth()
```

Ejemplo:

```ts
@ApiBearerAuth()

@UseGuards(AuthGuard('jwt'))
```

---

## Documentación General

La configuración de Swagger se realizará únicamente desde `main.ts`.

Configuración mínima:

- título
- descripción
- versión
- Bearer Authentication

Ejemplo:

```ts
const config = new DocumentBuilder()
  .setTitle('Backend Starter')
  .setDescription('API del Backend Starter')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
```

---

# Ejemplos

Los ejemplos utilizados en Swagger nunca contendrán información personal.

Se utilizarán datos genéricos.

Correcto:

```
Juan
Pérez
juan.perez@email.com
```

Incorrecto:

```
Pablo
Mi empresa
Mi correo personal
```

---

# Objetivo

Swagger forma parte del desarrollo del Starter.

No constituye una tarea posterior.

Cada módulo deberá quedar completamente documentado al finalizar su implementación.