# US23 — Gestión de categorías

Estado al 04/11/2026: **INCOMPLETA**. API corregida y base Angular probadas; cuatro pantallas y modal pendientes de implementación visual y conexión. No constituye aceptación funcional completa.

## Alcance y fuentes

S2-TSK-013 y S2-TSK-014. Criterios US23-CA01 a CA05 del SPEC común (transcripción del reporte, páginas físicas 72–73): crear categoría del local con nombre obligatorio y descripción opcional; rechazar nombre vacío; editar datos válidos; eliminar únicamente sin asociaciones impeditivas; impedir edición/eliminación ajena.

Se revisaron AGENTS.md, memory.md, SPEC.md, asignación estructurada, rutas, inventario, servicios y contratos reales del backend. La asignación conserva a su mantenedora y no se modifica.

| Pantalla | Ruta conservada | Estado |
| --- | --- | --- |
| op-categorias | /operacion/categorias | Plantilla pendiente |
| op-categoria-nueva | /operacion/categoria/nueva | Plantilla pendiente |
| op-categoria-editar | /operacion/categoria/editar | Plantilla pendiente |
| op-categoria-eliminar | /operacion/categoria/eliminar | Plantilla pendiente |
| op-categoria-eliminar-dialog | src/app/dialogs/op-categoria-eliminar/ | Modal pendiente |

No se modificaron ScreenHost, rutas, componentes compartidos ni inventario: las pantallas siguen declaradas pendientes.

## Referencias visuales y bloqueo

Original: https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92

Duplicado autorizado expresamente para esta tarea: https://www.figma.com/design/6dDJNh7MMb3pU1UbL8sb2r/RestoPilot--copia-?node-id=5-124

La comprobación inicial de identidad encontró una cuenta distinta de la institucional autorizada. La creación de sesión del duplicado fue rechazada por permisos. Tras la reconexión indicada por la usuaria, Figma figuró instalado y habilitado, pero dejó de exponer herramientas MCP en esta conversación. No se verificó la nueva identidad ni se recuperaron frames US23. Las exportaciones locales localizadas corresponden a US10, no a categorías.

La skill figma-design-to-code exige: “You MUST implement exclusively from the high-fidelity get_design_context responses”. No se alteró esa instrucción ni AGENTS.md. Falta recuperar contexto y captura de listado, creación, edición y eliminación en escritorio/móvil, además del modal y assets originales. No se inventó apariencia ni se afirma equivalencia visual. No hay evidencia visual US23 nueva.

## Contratos existentes

Base configurable environment.apiUrl (actualmente /api sobre el servidor de desarrollo). Interceptor y API_SESSION ya existentes.

| Método y recurso | Entrada | Respuesta |
| --- | --- | --- |
| GET /api/categorias/restaurante/{restauranteId} | ID positivo del restaurante | 200 Categoria[] |
| POST /api/categorias | restauranteId, nombre, descripcion opcional | 201 Categoria |
| PUT /api/categorias/{id} | nombre y/o descripcion | 200 Categoria |
| DELETE /api/categorias/{id} | ID de categoría | 204 sin cuerpo; 409 si hay asociaciones |

No existe GET individual de categoría. La edición se prepara consultando el listado del restaurante de la sesión y seleccionando su ID; no se añadió un endpoint duplicado.

Categoria: id, restauranteId, nombre, descripcion nullable, creadoEn y actualizadoEn nullable. Los timestamps son del servidor. El alta no acepta ID preexistente y ya no acepta fechas proporcionadas por el cliente. El nombre es no vacío y tiene límite técnico de 100 caracteres, según la columna JPA. Se quitan espacios exteriores al guardar. Descripción opcional, sin máximo comercial inventado; enviar cadena vacía permite borrarla. En PUT, null/omisión conserva el campo, por compatibilidad con el contrato existente.

GET permanece disponible a usuarios autenticados para no romper la carta del cliente. Escrituras requieren ADMINISTRADOR o DUENO y pertenencia al restaurante, verificada con AccesoRestaurante. La UI no puede autorizar operaciones por sí misma. Categorías ajenas: 403; inexistentes: 404; datos inválidos: 400. No se añadieron reglas de nombres únicos, orden manual ni desactivación lógica.

Eliminar conserva el borrado físico ya existente, sin cascada: comprobación de platos asociados y protección final por FK. Un conflicto se comunica como 409 y no elimina los platos.

## Implementación Angular preparada

Se amplió CatalogoService; no se creó otro servicio HTTP. CategoriaResponse, el método categorias() y readCategorias reutilizan la porción indispensable de feature/carta-api. El lector se conserva en el mismo archivo previsto por US10; no se copiaron CartaStore, pantallas, carrito ni commits completos. Al integrar ambas ramas, conservar también readCartaPlato de US10 y las mutaciones de US23.

CategoriasStore se debe proveer por pantalla, no en root. Lee API_SESSION/activeOperationSession. load() usa únicamente el restaurante de la sesión; load(id) verifica que la categoría está en ese listado. Estados idle/loading/ready/error; ready sin entradas es vacío. ID inválido o ausente en el local no muestra otra categoría.

create/update validan nombre antes de enviar; remove requiere confirmación explícita. busy bloquea doble envío. Los datos solo cambian tras respuesta confirmada. La destrucción del contexto o cambio de sesión cancela subscriptions y resuelve acciones pendientes como false. Las respuestas viejas no reemplazan la selección nueva. La vista filtra inmediatamente datos cuyo propietario no coincide con la sesión.

Ante 401/403/404 se limpian los datos. Ante fallo de red, respuesta incompatible o error 5xx, uncertain bloquea un reenvío: es obligatorio consultar el listado y revisar si se guardó antes de repetir. Cancelar una petición HTTP no revierte una escritura ya procesada en el servidor. El store no navega; la futura capa de pantalla debe navegar solo tras true y mientras siga activa.

## Archivos de esta etapa

- src/app/core/models/catalogo-api.model.ts: CategoriaResponse reutilizada.
- src/app/core/models/catalogo-query.model.ts: lector reutilizado de categorías.
- src/app/core/services/catalogo.service.ts: consulta y escrituras.
- src/app/pages/operacion/categorias-ui/categorias-store.ts: estado y operaciones sin diseño.
- scripts/us23-categorias.test.cjs: 17 pruebas unitarias y HTTP simuladas.
- SPEC.md: enlace al presente complemento.
- docs/specs/us23/SPEC.md: decisiones, evidencia y pendientes.

Backend, rama independiente: CategoriaService.java, PlatoRepository.java, Us23HttpIntegrationTest.java y docs/US23-VALIDACION.md.

## Verificaciones ejecutadas

- npm run verify: compilación Angular y chequeo de 120 escenarios correctos (51 interfaces declaradas, 69 pendientes en esta rama).
- tsc --noEmit -p tsconfig.app.json: correcto.
- Comprobación TypeScript estricta adicional del nuevo store, aún no importado por una pantalla: correcta.
- node --test scripts/us23-categorias.test.cjs: 17/17 correctas. Listado/vacío/error, validación, crear/editar/eliminar, confirmación, doble envío, destrucción, cambio/expiración de sesión, consultas obsoletas, permisos, respuestas inciertas y contratos HTTP. Son pruebas simuladas, no navegador conectado.
- node --test scripts/*.test.cjs scripts/*.test.mjs: 189/189 correctas, incluyendo regresiones existentes de pedidos, cocina y reservas.
- Backend: suite completa de 113 pruebas correcta con los ocho casos iniciales US23; comprobación CORS adicional registrada en docs/US23-VALIDACION.md del backend.
- No se ejecutaron pruebas de formularios/componentes US23 ni recorrido Angular → backend: las interfaces siguen pendientes. No se generaron capturas de una UI inexistente.

## Dependencias y cierre pendiente

1. Recuperar las herramientas Figma MCP, verificar cuenta institucional y obtener frames/capturas/recursos de las cuatro pantallas y modal. Implementar visuales con Material y controles reactivos; validar escritorio, móvil, anchos intermedios y teclado.
2. Conectar las pantallas al store con IDs explícitos y confirmación real. Añadir pruebas DOM, formularios, navegación y diálogo.
3. develop contiene AuthService.login e interceptor, pero acceso.ts aún informa que el login no está conectado. Cuando se conecte US23, reutilizar solo la integración de acceso necesaria de US10 (commit 665b62c, acceso.ts/html), revisando que el retorno de operaciones sea interno y autorizado. No se modificó autenticación en esta etapa ni se afirma login de navegador funcional en esta rama.
4. Ejecutar recorrido de navegador real contra Spring Boot y H2 aislado; incluir creación, edición, cancelación, integridad, errores y roles. Actualizar inventario solo después de implementar las interfaces.
5. PostgreSQL: continúan solo .env.example y .env.supabase.example; no se encontraron variables DB_/JWT_/SPRING_DATASOURCE/PG de conexión. Se necesita un archivo local de desarrollo autorizado con DB_URL, DB_USERNAME, DB_PASSWORD y JWT_SECRET del responsable del backend. No compartir secretos por chat ni versionarlos. No se inició PostgreSQL con credenciales inventadas ni se tocaron datos existentes. H2 no valida PostgreSQL.

Ramas: frontend feature/us23-gestion-categorias desde origin/develop 75258a9; backend feature/us23-categorias-api desde origin/develop 734bc95. Sin merge, rebase, push ni PR. US10 permanece intacta en su rama.
