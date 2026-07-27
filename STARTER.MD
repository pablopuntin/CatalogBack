### ya definimos varias convenciones que no dependen del proyecto:

* Un módulo nunca consulta directamente las tablas que pertenecen a otro módulo.
* IDs con cuid().
* Tablas en plural y snake_case.
* Modelos en PascalCase.
* Campos en camelCase.
* createdAt y updatedAt obligatorios.
* deletedAt solo cuando tenga sentido.
* Prisma como única fuente de verdad.
* Sin carpeta entities.
* Módulos organizados bajo src/modules.
* common para infraestructura compartida.
* .env fuera del repositorio y .env.example versionado.

Todas esas decisiones son propias del Backend Starter, no del catálogo. Si quedan documentadas desde el principio, cada proyecto nuevo empieza con las mismas reglas y evitás tener que volver a discutirlas o recordarlas.

### Hasta ahora tenemos varias decisiones consistentes:

✅ ConfigModule global porque es infraestructura transversal.
✅ PrismaModule no global porque representa una dependencia explícita.
✅ Sin capa Repository genérica; Prisma directamente desde los Services.
✅ Roles y permisos modelados como capacidades del negocio, no verbos HTTP.
✅ Tablas en snake_case, modelos en PascalCase, campos en camelCase.
✅ IDs con cuid().
✅ Refresh Tokens persistidos con rotación.
✅ Seguridad construida antes que el dominio del negocio.

