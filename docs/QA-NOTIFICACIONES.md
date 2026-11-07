# Verificación de notificaciones

Fecha: 2026-10-30. Rama: feature/notificaciones.

- `npm.cmd run verify`: estructura y build correctos.
- Navegador: tres URLs directas y capturas móviles a 390 px, sin desbordamiento horizontal; lista cliente revisada también en escritorio1440.
- Enlaces de los tres detalles contrastados con las rutas/variantes del inventario. Las pantallas de detalle pertenecen a otros bloques y conservan su estado previo.
- Mensajes identificados como ilustrativos y estados vacíos explican servicio pendiente.
- Calidad revisó rutas, composición y estilos de estos archivos.

Sin notificaciones reales, sesiones ni consulta al servidor.

Revision visual US28: vista comun de avisos de ejemplo con identificador/fecha, orden descendente, paginador Material, carga/vacio/error/recuperacion y escenarios de permisos/sesion. No consulta AuthService ni HTTP. La integracion iniciada anteriormente se revirtio localmente. Checker y build aprobados; navegador integrado pendiente.

## Integración US28 — revisión actual

Rama `feature/notifications-integration`, base `develop` en `6e8a036`.
La evidencia visual anterior es histórica; la implementación actual consulta
`GET /api/notificaciones/me` mediante `NotificacionService`, reutilizando
`API_SESSION`, el interceptor y los guards existentes.

- CA01: se muestran ID, mensaje y fecha retornados. Se valida el orden descendente
  de fecha; `sort=id,desc` añade desempate a la consulta paginada del backend.
- CA02: se muestran los avisos existentes de reservas y cambios de estado o
  cancelación de pedidos; no se inventan mensajes. El PUT de ajuste de contenido
  de US24 no genera avisos actualmente. Si CA02 debe incluir esos ajustes, hay
  que acordar ese criterio antes de ampliar el backend.
- CA03: vacío únicamente según la respuesta HTTP. La variante del inventario
  `cliente-notificaciones-vacio` conserva su ruta y también consulta datos reales.
- CA04: el servidor filtra por usuario autenticado. Además se valida `usuarioId`
  antes de aceptar la página, sin enviar ese identificador como filtro HTTP.
  Logout/cambio de cuenta limpia datos y descarta respuestas tardías.
- CA05: paginación en servidor con tamaños 5/10/20 y actualización manual.
- Cliente y operación comparten una bandeja personal; cambia el shell de
  navegación. No hay bandeja global del restaurante, lectura/marcado ni push.
  Los productores actuales notifican a clientes, por lo que una cuenta operativa
  puede tener bandeja vacía legítimamente.
- Carga, red/contrato, 401, 403 y 404 tienen estados y recuperación explícitos.
  El 401 reutiliza expiración de sesión del interceptor; un 403 no se interpreta
  automáticamente como sesión vencida.

### Verificaciones ejecutadas

- `npm.cmd run check`: aprobado, 120 escenarios y rutas sin duplicados.
- `npm.cmd run build`: aprobado.
- `node --test scripts/us28-api.test.cjs`: 11 aprobadas. Contrato, paginación,
  orden/fechas, datos de otra cuenta, sesión, cancelación de consultas y errores.
- `scripts/us28-api-browser.cjs`: 14 escenarios aprobados con Microsoft Edge
  headless y HTTP interceptado. Login mediante formulario con respuestas fixture,
  carga, paginación, variante vacía, bandeja operativa vacía, 401/403/404/500,
  fallo de red, respuesta ajena y responsive 320/390/768/1440 sin overflow horizontal.
  Resultado sanitizado en `evidencias/notificaciones-api/resultado.json`.
- Equipo backend: 35 pruebas aisladas de reglas/validaciones y US13/US19 aprobadas
  con H2 (29+6). Incluyen notificaciones personales y aislamiento entre cuentas;
  no existe todavía una prueba backend específica de empate de fecha/paginación.

No se probaron estos cambios contra PostgreSQL/Supabase ni se crearon operaciones
en bases compartidas. HTTP interceptado y H2 no acreditan aceptación del flujo
real. No se volvió a verificar Figma ni toda la accesibilidad. Sin commits,
publicación ni historia marcada como aceptada.


### Verificación conjunta del coordinador

Se reunieron las tres integraciones en un worktree de revisión sin rama funcional
propia, basado en develop `6e8a036`. Se conservaron los cambios de cada historia
en su rama independiente, sin commits ni push.

- `npm.cmd run check`: aprobado; 120 escenarios y rutas sin duplicados.
- `node --test scripts/*.test.cjs scripts/*.test.mjs`: 260 aprobadas, 0 fallidas.
- Compilación conjunta de producción aprobada.
- Navegador sobre el artefacto conjunto con HTTP interceptado: 12 escenarios
  US18, 19 US24 y 14 US28 aprobados. El recorrido US24 adicional comprueba
  ajuste → registro de pago → bloqueo de nuevas ediciones con el mismo pedido.
- Tras ampliar la clasificación de respuesta ilegible/HTTP 200 de US24, se
  repitieron sus 9 pruebas dirigidas, todas aprobadas.
- Calidad revisó el conjunto sin hallazgos bloqueantes confirmados. Seguridad
  comprobó por lectura permisos, aislamiento y correcciones de incertidumbre.
  Estas revisiones no garantizan ausencia de vulnerabilidades.
- Equipo backend: 35 pruebas aprobadas con H2 (29 reglas/validaciones y 6 HTTP).

No se ejecutó aceptación contra PostgreSQL/Supabase, ni se registraron pagos
o cancelaciones en una base compartida. Las pruebas con HTTP controlado y H2
no sustituyen esa aceptación. La interpretación de US28-CA02 sobre notificar
ajustes de contenido sigue documentada; no se amplió el backend sin acuerdo.

Resultado de navegador de esta funcionalidad: `evidencias/notificaciones-api/resultado.json`.
