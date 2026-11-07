# Verificación de pagos

## Integración US18 — revisión 2026-11-06

Rama `feature/payments-integration`, basada en `develop` `6e8a036`.
Las notas de octubre al final son evidencia histórica de la implementación visual,
no describen el comportamiento HTTP de esta rama.

### Comportamiento conectado

- Las cuatro entradas del inventario reutilizan `PagosView`; no contienen pedidos,
  importes ni confirmaciones de muestra. Las variantes confirmado/error no fabrican
  éxitos ni errores: consultan el pedido indicado por `pedidoId`.
- La búsqueda consulta `PedidoService.obtener(id)` y después
  `PagoService.consultar(id,total)`. Un identificador ausente pide seleccionar un
  pedido; uno explícito inválido produce error, sin recurrir a otro ID.
- `PagoService.registrar` usa `POST /api/pedidos/{pedidoId}/pagos`, exige 201 y valida
  identidad, importe, método, estado, referencia y fecha de la respuesta antes de
  mostrar el detalle. Solo se envían `monto`, `metodo`, `codigoReferencia` y `estado`.
- CA01/CA09: se muestran importe/estado reales y los campos opcionales de un pago
  pendiente, sin inventar método ni fecha. CA02–CA08/CA10/CA11: total exacto,
  Yape/Plin/Tarjeta/Efectivo, referencia electrónica de hasta 100 caracteres,
  efectivo sin referencia, bloqueos para cancelados/confirmados y sin pasarela.
- CA12: se puede guardar `PENDIENTE` explícitamente. La referencia es opcional y
  la respuesta debe conservar `fechaPago: null`. No se afirma dinero recibido al
  guardar ese estado.
- Carga, errores 400/401/403/404/409/red, reconsulta y navegación conservan el ID.
  Los enlaces hacia edición de US24 usan `/operacion/pedido/editar?pedidoId=...`.
- El store raíz conserva el POST pendiente aunque cambie la variante o se abandone
  la pantalla; bloquea otros envíos y deshabilita los campos mientras está activo.
  Si se pierde la respuesta, no reintenta automáticamente. Exige una consulta
  explícita de reconciliación antes de permitir repetir el registro. Un POST que
  sigue activo no admite reconciliación anticipada.
- Un cambio de sesión oculta los datos inmediatamente; consultas anteriores se
  cancelan y respuestas tardías no confirman pagos ni navegan en otra cuenta.
  La API conserva la autorización definitiva del rol y restaurante.

### Verificación ejecutada

- `npm.cmd run check`: aprobado, 120 escenarios conservados y rutas sin duplicados.
- `npm.cmd run build`: aprobado en la primera compilación de esta integración
  (32,5 s). La compilación final se inició tras las defensas adicionales pero no
  produjo un resultado verificable antes de detener la ejecución por lentitud del
  entorno; el coordinador verificará el conjunto integrado.
- `node --test scripts/us18-api.test.cjs`: 10 pruebas aprobadas. Cubren ID inválido,
  carga real, cancelación de consultas, local ajeno, 401/403/404/500, doble envío,
  respuesta incierta/reconciliación, cambio de sesión antes de ejecutar sus efectos,
  datos inválidos, CA12 y validación estricta del POST.
- `scripts/us18-api-browser.cjs`: 12 escenarios aprobados con HTTP interceptado y
  Microsoft Edge headless en el puerto 4363. Incluyen búsqueda/404, consulta real,
  efectivo confirmado, pendiente electrónico sin referencia/fecha, validación,
  respuesta perdida, doble submit, recuperación de 409, permiso 403 y anchos
  390/768/1440 sin desbordamiento horizontal en esos escenarios. Captura de 390 px
  inspeccionada; no acredita accesibilidad completa ni equivalencia con Figma.
- Evidencia controlada generada en `artifacts/us18-api/resultado.json` y capturas.
- La repetición final del navegador tras deshabilitar los campos durante el POST
  llegó a siete escenarios aprobados antes de solicitar su interrupción. No se
  acredita esa repetición como una nueva ejecución completa de doce escenarios.
- La suite completa de frontend se inició, pero se interrumpió tras 179 casos
  emitidos por lentitud del entorno. No se declara un total aprobado de esa
  ejecución; la verificación consolidada corresponde al coordinador.

### Límites

Estas pruebas de frontend usan mocks HTTP, no PostgreSQL ni una transacción de
pago real. No se crearon usuarios ni registros en una base compartida. No se
modificó backend, sesión, rutas, dependencias o pantallas de otros responsables.
Falta aceptación con dueño/administrador y backend/PostgreSQL reales, incluyendo
concurrencia con US24 y verificación de los importes de la base real. Los checks
y mocks no marcan la historia como aceptada ni Done.

## Evidencia visual histórica

Fecha: 2026-10-30. Rama: feature/pagos.

- `npm.cmd run verify`: estructura y build correctos.
- Navegador: cuatro URLs directas y revisión visual móvil de 390 px sin desbordamiento horizontal. Búsqueda y registro revisados también a 1440 px.
- Búsqueda vacía muestra error; 999 muestra ausencia de coincidencias y 1042 muestra la referencia y permite abrir el formulario.
- Formulario vacío exige importe y referencia; 65 se rechaza. Importe66 con efectivo y referencia vacía muestra aviso de datos validados sin pago/cobro real.
- Variantes confirmado/error identificadas como referencia visual. Logo visible, sin flechas decorativas.
- Revisión estática de seguridad sin hallazgos bloqueantes en alcance visual.

Sin integración, persistencia, cobros ni validación de permisos reales.

Revision visual US18: consulta con carga/vacio/error/permisos, registro en memoria de demostracion y detalle coherente. Yape/Plin/Tarjeta/Efectivo, importe exacto, referencia condicional, pendiente sin fecha y bloqueo al confirmar o cancelar. La muestra compartida se reinicia explicitamente y al recargar; no hay HTTP ni cobro. Checker y build aprobados.


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

Resultado de navegador de esta funcionalidad: `evidencias/pagos-api/resultado.json`.
