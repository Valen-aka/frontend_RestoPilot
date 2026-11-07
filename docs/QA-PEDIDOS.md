# Verificación de pedidos

Fecha: 2026-10-30. Rama: feature/pedidos.

- `npm.cmd run verify`: estructura y build correctos.
- Navegador: edición, bloqueo y cancelación por URL directa; revisión visual a 1440 y 390 px, sin desbordamiento global. Tabla con desplazamiento interno móvil.
- Cambiar Lomo a 2 recalcula total a S/104; guardar muestra aviso sin persistencia. Cantidad -1 muestra validación.
- Diálogo: abre con acción explícita, foco inicial en Volver, cerrar y confirmar funcionan; confirmación muestra que no se canceló un pedido real. Diálogo móvil sin desbordamiento.
- Revisión estática de seguridad: sin hallazgos bloqueantes en alcance visual; sin HTTP ni almacenamiento.

Datos de diseño. Backend, permisos efectivos y operaciones reales pendientes.

Revision visual US24: borrador separado del pedido de muestra, total recalculado al guardar, pago pendiente coherente, bloqueos por pago/estado, dialogo de cancelacion y resultado con historial/aviso de ejemplo. No hay API ni cancelaciones reales. Checker y build aprobados; recorrido integrado pendiente.

## Integración US24 — 2026-11-06

Rama `feature/order-management-integration`, basada en `develop` `6e8a036`.
Las notas anteriores describen la entrega visual histórica; las tres entradas
de US24 ahora cargan el pedido y su pago reales mediante `pedidoId` positivo.

- Reutiliza sesión, interceptor, `PedidoService`, `PagoService` y `CatalogoService`.
  No se añade infraestructura de sesión ni backend.
- Edición mediante `PUT /api/pedidos/{id}` con el DTO existente. Conserva
  restaurante, cliente y creación; no envía precios o total calculados en cliente.
  Los platos, notas, cantidades, modalidad, mesas y disponibilidad provienen del
  pedido/catálogo real. El total mostrado después de guardar se confirma con una
  lectura del pedido y su pago pendiente.
- Cancelación mediante `DELETE /api/pedidos/{id}` exige 204, reconsulta el estado
  Cancelado y conserva la lectura del pago. El diálogo identifica el pedido real.
- Bloqueo por estado distinto de Pendiente o pago Pagado. La vista alternativa
  bloqueada consulta el estado real y no fabrica una restricción por `vista`.
- La cancelación solo depende del pedido/pago. Editar omite la consulta de mesas
  si el restaurante no tiene atención física.
- Se gestionan carga, 401/403/404, errores de negocio y red; bloqueo de doble envío
  y navegación pendiente. Una respuesta incierta bloquea nuevos envíos hasta
  reconciliar el resultado o una verificación manual explícita. Ese bloqueo se
  conserva al recorrer pedido A → B → A durante la misma sesión.
- Un error de lectura posterior a una escritura exitosa, incluso 4xx, conserva
  incertidumbre. Cambiar de cuenta oculta los datos inmediatamente y descarta
  respuestas tardías.
- Los enlaces del detalle real de cocina permiten abrir edición/cancelación con
  el mismo `pedidoId`; desde US24 se puede consultar el pago del mismo pedido.

### Verificación y límites

`npm.cmd run check` pasó. `node --test scripts/us24-api.test.cjs` pasó con
9 pruebas, 0 fallidas, incluyendo incertidumbre A → B → A, escritura exitosa con
lectura posterior 403, doble envío, cambio de cuenta, contrato y cancelación sin
catálogo/edición sin salón sin dependencia de mesas. Son servicios/HTTP controlados.
Una compilación previa pasó; la compilación del último ajuste de carga se delega
a la verificación conjunta del coordinador. La revisión de navegador del conjunto
también corresponde al coordinador.
No se ejecutaron operaciones contra PostgreSQL compartido ni se crearon pedidos
reales durante esta implementación. No se acredita aceptación del flujo real,
equivalencia con Figma ni auditoría completa de accesibilidad.

El contrato del backend se contrastó en lectura. La generación de notificación al
cancelar corresponde al backend existente. `PUT` de ajuste no genera un aviso;
la interpretación de US28-CA02 respecto a cambios de contenido queda documentada
por la coordinación, sin añadir comportamiento de backend fuera del alcance.


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

Resultado de navegador de esta funcionalidad: `evidencias/pedidos-api/resultado.json`.


### Cierre de integridad y controles

Se amplió la clasificación de escritura incierta: una respuesta HTTP exitosa
con JSON ilegible tampoco demuestra que la operación haya fallado. La regresión
unitaria A → B → A cubre estados 0, 200 y 408. Las 9 pruebas US24 se repitieron
y aprobaron tras el cambio. La compilación final volvió a aprobarse y una
regresión de navegador dirigida confirmó el bloqueo y la reconciliación
con un único PUT, con HTTP controlado. Resultado:
`evidencias/pedidos-api/respuesta-ilegible.json`.

También se retiró el atributo disabled sobre un control reactivo de selección:
el formulario y el selector de platos se habilitan o bloquean mediante sus
controles Angular. El artefacto final incluye esa corrección.

Total de navegador conjunto: 45 escenarios de recorrido más esta regresión
dirigida (46 aprobados: 12 pagos, 20 pedidos, 14 notificaciones).
