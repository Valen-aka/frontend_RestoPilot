# SPEC — Mis pedidos: listado y continuidad de consulta

Fecha: 01/11/2026. Rama: feature/cliente-pedidos. Alcance: frontend de muestra y navegación.

Leer [AGENTS.md](../../../AGENTS.md), el [SPEC común](../../../SPEC.md), [US12](../us12/SPEC.md), [US13](../us13/SPEC.md) y la [asignación del equipo](../../ASIGNACION-EQUIPO.md). La pantalla cliente-pedidos está asignada a Alexandra y asociada a US12/US13. El historial se cruza con US07; esta entrega se limita a pedidos y no completa el historial de reservas.

## Objetivo

Completar /cliente/pedidos y permitir consultar el detalle, seguimiento y pago de cada registro sin sustituirlo por el ejemplo fijo #1042. Conservar selección, página y datos de compra al volver. No incluye operaciones persistentes ni servicios reales.

## Referencia visual verificada

Fuente única: [Figma original](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=84-39467).

| Variante | Frame | Dimensiones |
| --- | --- | --- |
| Desktop | 84:39468 | 1440 × 900 |
| Mobile | 84:39590 | 390 × 844 |

Ambos contextos de diseño y sus capturas se consultaron mediante MCP. La referencia muestra #1042 En preparación, #1034 Entregado y #1028 Cancelado. Se conserva el recurso local exacto de marca, con slot de 43 × 43 y capa blanca del diseño. Fuentes locales y CSS de pedido existentes. No se incrustan capturas ni URLs temporales.

Adaptaciones funcionales: datos identificados como muestra, fechas completas en lugar de «hoy», acceso adicional a pago y paginación local. La tabla conserva desplazamiento propio en móvil; no se ocultan columnas para impedir la consulta.

## Datos y estados

- ClientePedidosStore es la fuente común de lectura para listado y selección. Cada registro conserva identificador, contexto de cliente, fecha ordenable, snapshot de compra, estado y pago propio.
- Orden cronológico descendente y desempate por identificador; sin mutar la fuente. Paginación Material en español, tamaños 5/10/20, conservada durante la navegación.
- Muestras: #1042, S/ 66, En preparación, pago Yape; #1034, S/ 38, Entregado, Efectivo; #1028, S/ 28, Cancelado, sin registro de pago disponible. No heredar método, referencia o importe de otra operación.
- Consulta normal, carga, vacío, error y datos incoherentes diferenciados. Recuperar una consulta no repuebla un vacío legítimo con datos fabricados.
- La selección admite únicamente un ID y consulta la colección. ID inválido, desconocido, ajeno o ambiguo muestra no encontrado sin desglose, progreso o pago ajeno. No aceptar snapshots arbitrarios de navegación.
- El filtro de fixtures propios no acredita autenticación ni autorización real.
- El estado del registro elegido prevalece sobre la variante visual ?vista=. Cambiar la URL no crea una transición. El detalle incluye el seguimiento existente de US13.
- Conservar líneas, cantidades, nombres, precios históricos, modalidad, mesa/dirección y total. No recalcular con la carta actual.

## Navegación y continuidad

Rutas existentes: /cliente/pedidos, /cliente/pedido y /cliente/pago, con sus variantes del inventario. Se conservan las rutas hijas, clases, responsables, cargadores y archivos de entrada.

PedidoSelectionView adapta las entradas existentes para consultar el registro seleccionado y reutilizar PedidoView. Las visitas directas sin selección mantienen las variantes de muestra anteriores. El retorno de pago conserva el pedido y su estado; el retorno al listado conserva página y foco en el acceso correspondiente.

Las confirmaciones locales del carrito reciben IDs independientes (#1043, #1044, …) en PedidoDemoContext. Aparecen en el listado y mantienen estado/pago Pendiente. Una segunda confirmación no reemplaza la primera ni el histórico #1042. Se conserva cada snapshot durante el recorrido.

Recargar reinicia los pedidos temporales; intentar reabrir uno que ya no existe muestra no encontrado, sin sustituirlo por otro. Los registros iniciales conocidos pueden reabrirse conservando el ID de navegación. No se añade almacenamiento persistente.

## Trazabilidad del alcance local

| Referencia | Evidencia de presentación/navegación |
| --- | --- |
| US07-CA01/03/04/05 | Lista de muestras propias, vacío, paginación y error. No incluye la sección de reservas ni aceptación integrada de US07. |
| US12-CA01/06, tarea 033 | El pedido seleccionado conserva desglose, modalidad y precios históricos. |
| US12-CA02/03/04/05 | Pago del mismo ID, Pendiente/sin registro y no encontrado sin datos alternativos. |
| US13-CA01/03/04, tarea 041 | Estado recibido, progreso, Entregado y Cancelado conservados en el recorrido. |
| US13-CA02/05 | Actualizar la entrada de muestra cambia la presentación; selección ajena/inexistente no revela otro pedido. |

Se implementa presentación y navegación. Los criterios que requieren respuestas o permisos reales no se consideran aceptados por estas muestras.

## Verificación ejecutada

- node --test scripts/cliente-pedidos.test.mjs: 6 pruebas correctas de orden, conservación, selección, contexto, estados y datos incompletos.
- Chequeo estructural: 120 escenarios conservados, 26 interfaces declaradas y 94 pendientes; landing adicional. No acredita aceptación funcional.
- Build de producción correcto.
- Listado → detalle → pago en cinco anchos: 320, 390, 768, 1024 y 1440 px. Sin desbordamiento de página. Marca local cargada y geometría de 43 × 43 comprobada; capturas desktop/mobile inspeccionadas.
- Recorridos de #1042/#1034/#1028: importes 66/38/28, pago propio o ausente, retorno, foco y recarga de registros conocidos.
- Variante incompatible con la selección muestra el estado real de la muestra. IDs inválidos, desconocidos y ajenos no muestran tablas, progreso ni datos de otro registro.
- Carga, error, reapertura, vacío legítimo y actualización a Listo comprobados con entradas locales.
- Colección de 12 registros: cambio de página, retorno a la página elegida, foco, atrás/adelante y selección conservados.
- Teclado, salto al contenido, textos largos y zoom al 200 % sin desbordamiento de página.
- Carrito: dos confirmaciones distintas, #1043 para llevar y #1044 delivery, conservadas en el listado; modalidad/dirección propias y #1042 con su pago histórico intacto. Recarga de un pedido temporal muestra falta de contexto.
- Regresión de las cuatro variantes existentes de detalle/seguimiento y retorno desde pago correcta. Sin errores JavaScript ni solicitudes de escritura en los recorridos comprobados.

No se crean commits ni PR automáticamente. Mensaje propuesto: feat(pedidos): completa el listado y conserva la selección.
