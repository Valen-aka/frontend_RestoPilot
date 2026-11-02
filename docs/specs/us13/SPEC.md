# SPEC — US13: seguimiento del pedido

Fecha: 01/11/2026. Entrega actual: documentación independiente de US13. Rama propuesta: feature/cliente-pedido. PR hacia develop.

Leer [SPEC común](../../../SPEC.md), [AGENTS.md](../../../AGENTS.md) y [SPEC de US12](../us12/SPEC.md). Este documento no sustituye el de US12 ni reúne sus commits.

## 1. Objetivo y secuencia

Como cliente, consultar el estado actualizado del pedido para conocer el avance de su preparación y entrega.

Secuencia de entregas acordada:
1. Documento de US12 y su commit.
2. Implementación de US12 y su commit.
3. Este documento de US13 y su commit.
4. Implementación de US13 y su commit.

La existencia de código de seguimiento del intento conjunto anterior no acredita revisión, aceptación ni creación de sus commits. Este cambio es exclusivamente documental. No incorporar modificaciones de código al commit del SPEC mediante una selección masiva.

## 2. Alcance

| Tarea original | Alcance |
| --- | --- |
| S2-TSK-041 | Construir la visualización del estado del pedido y su avance |
| S2-TSK-042 | Integrar después actualización desde API y errores de consulta |

Primera implementación: presentación responsive, navegación existente y fixtures de los cinco estados de pedido. La integración posterior requiere contrato y entorno autorizados; una muestra local no cumple S2-TSK-042.

Incluye:
- Estado actual Pendiente, En preparación, Listo, Entregado o Cancelado.
- Progreso informativo, sin controles para modificar la operación.
- Vistas existentes de pedido listo, entregado y cancelado.
- Conservación del desglose de US12 entre variantes.
- Carga, error y pedido no encontrado con una presentación consistente.
- Acceso de referencia a notificaciones, sin implementar su módulo.

Excluye:
- Reconstruir el detalle y la consulta de pago de US12.
- Crear pedidos, cobrar, editar, cancelar o marcar entregas desde el cliente.
- Operación de cocina, administración, carrito e historial completo.
- IA, autenticación, JWT, permisos ficticios o servicios de notificaciones.
- Polling, WebSocket, mapas de repartidor, tiempos estimados y porcentajes no documentados.

## 3. Requisitos y evidencia

Fuente funcional: US13 del reporte report_1ACC0236-20262.pdf, páginas físicas 54–55. Sus cinco criterios originales se reproducen íntegros al final.

Fuente visual: [Figma vigente](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=5-92), página RestoPilot 5:92.

| Escenario | Desktop | Mobile |
| --- | --- | --- |
| cliente-pedido-detalle, preparación | 84:33478, 1440 × 960.60 | 84:33631, 390 × 1483.10 |
| cliente-pedido-listo | 84:39170, 1440 × 960.60 | 84:39323, 390 × 1450.70 |
| cliente-pedido-entregado | 84:33776, 1440 × 960.60 | 84:33929, 390 × 1483.10 |
| cliente-pedido-cancelado | 84:33092, 1440 × 920.60 | 84:33225, 390 × 1373.70 |

Referencias: [Listo](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=84-39170), [Entregado](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=84-33776), [Cancelado](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=84-33092).

Se reutilizan lecturas de diseño ya realizadas en esta sesión: contexto y capturas desktop de detalle/Listo/Entregado/Cancelado, detalle mobile y dimensiones de variantes mobile. No se repiten como inspecciones nuevas ni como pruebas de integración. Antes de cerrar implementación, comparar cada variante mobile con su referencia.

Pendiente no tiene un frame independiente identificado en este conjunto. Representarlo como estado de consulta del detalle con texto coherente, sin simular el alta del pedido ni reutilizar la confirmación de US11 como transacción nueva.

## 4. Dependencia con US12

Reutilizar el pedido seleccionado, el desglose, los precios históricos, la modalidad y el contexto de navegación ya definidos en US12. Cambiar de estado no modifica platos, cantidades, precios, total o identidad del pedido.

El segundo commit de implementación debe partir de una versión de US12 que compile y sea revisable por sí sola. Añadir el componente de progreso y su enlace a la presentación compartida, sin introducir antes esa dependencia en el commit de US12.

El pago es independiente del progreso: Pagado no implica Entregado y Cancelado no permite inferir un reembolso. No añadir reglas de cobro/cancelación desde la etiqueta de seguimiento.

## 5. Rutas y archivos

| Vista | Ruta actual |
| --- | --- |
| Preparación, canónica | /cliente/pedido |
| Listo | /cliente/pedido?vista=cliente-pedido-listo |
| Entregado | /cliente/pedido?vista=cliente-pedido-entregado |
| Cancelado | /cliente/pedido?vista=cliente-pedido-cancelado |
| Notificaciones de referencia | /cliente/notificaciones |
| Listado de referencia | /cliente/pedidos |

No crear /cliente/pedido-seguimiento ni renombrar carpetas para separar las historias. ?vista= selecciona composición, no identifica pedido ni concede permisos.

Archivos:
- src/app/pages/cliente/cliente-pedido-detalle/: incorporar progreso al detalle existente.
- src/app/pages/cliente/cliente-pedido-listo/, cliente-pedido-entregado/ y cliente-pedido-cancelado/: entradas de sus variantes.
- src/app/pages/cliente/pedido-ui/pedido-progress.ts, .html y .css: progreso reutilizable, si se conserva la organización actual.
- Presentación/modelo local compartidos: solo los cambios necesarios para vincular estado y progreso.

Conservar archivos .ts/.html/.css, cargadores y rutas existentes. Coordinar cambios de infraestructura compartida; no alterar layout, tema global o módulos ajenos si no es necesario.

Discrepancia del manifiesto: Entregado referencia US11, aunque la consulta del estado entregado está definida por US13-CA03. Mantener la identificación del escenario, documentar su relación con este criterio y no reasignar silenciosamente el reparto.

## 6. Modelo de estados y progreso

| Estado del negocio | Presentación |
| --- | --- |
| Pendiente | Pedido recibido; primera etapa actual y futuras no completadas |
| En preparación | Recibido alcanzado y preparación actual |
| Listo | Etapas anteriores alcanzadas y Listo actual; entrega futura |
| Entregado | Entrega completada; sin etapa posterior ni posibilidad de avance |
| Cancelado | Estado de cancelación explícito; sin progreso de éxito; desglose conservado |

Orden de preparación: Recibido → En preparación → Listo → Entregado. «Recibido» es una etiqueta visual de Pendiente, no un enum nuevo.

Distinguir etapa completada, actual y futura mediante texto además de color. Lista semántica no editable y aria-current="step" para la etapa actual cuando corresponda. Las etapas no son botones de avance ni un formulario.

En Entregado no mostrar nuevos pasos, cuenta regresiva o acciones de preparación. En Cancelado no completar en verde todas las etapas ni sustituir el pedido por una operación vacía.

Títulos observados:
- Preparación: «Estamos preparando algo bueno».
- Listo: «Tu pedido está listo».
- Entregado: «Esperamos que lo hayas disfrutado».
- Cancelado: «Pedido cancelado».

Texto de apoyo: «Cada paso, sin perderte nada.». No mostrar códigos RP / 023–026 del diseño. Datos de ejemplo identificados como muestra; no crear un usuario autenticado ficticio.

## 7. Actualización y errores

### Etapa visual

El estado procede de una entrada/fixture de presentación o de la variante reconocida por el inventario. No añadir botones de producto para que el cliente lo modifique. Los cambios de fixture durante pruebas no son actualizaciones del restaurante ni llamadas al servidor.

### Integración futura

Al volver a consultar, mostrar el estado devuelto por la API para el mismo pedido propio. Verificar contrato, identificador, autorización, enums, errores y mecanismo de refresco. No inventar endpoints ni asumir actualización en tiempo real.

US13-CA02 requiere además poder consultar la notificación correspondiente. Esta entrega puede conservar el acceso a /cliente/notificaciones, pero no acredita generación ni recepción de avisos reales.

### Consulta

- Carga: estado perceptible, sin fingir una respuesta nueva.
- Error: no reemplazar datos con los de otro pedido ni marcar un nuevo estado como confirmado.
- No encontrado: mensaje sin datos del pedido ajeno/inexistente.
- Finales: Entregado y Cancelado conservan la información y no se reinician por navegación.

No deducir una transición autorizada solo porque el cliente pueda abrir una URL de ejemplo. La autorización definitiva corresponde al servidor.

## 8. Navegación

Conservar el identificador/contexto que suministre US12. En modo visual, la muestra debe ser consistente entre estados y consulta de pago; no cambiar de pedido al regresar.

«Mis pedidos» y «Volver» conducen a rutas existentes sin implementar el listado por arrastre. El enlace a pago continúa según US12, sin incluir nuevos registros o cambios administrativos.

No añadir parámetros de URL no acordados, controles de cocina, ni acciones Cancelar/Entregar/Marcar listo. Si se usa history.state para retorno, validar únicamente escenarios reconocidos y tratarlo como navegación, no como identidad o permiso.

## 9. Estilo, responsive y accesibilidad

Usar el sistema de aplicación del SPEC común y los tokens --rp-*; no copiar la paleta o tipografía de marketing de la landing. Mantener coherencia con la implementación revisada de US12.

Desktop: progreso a lo ancho sobre selección/resumen. Mobile: distribuir etapas en filas o verticalmente para evitar solapar los rótulos observados en el frame. No ocultar nombres de etapa ni depender de scroll horizontal de toda la página.

Estado con texto y color, nombre accesible y foco visible donde haya navegación. Los indicadores sin acción no reciben foco como botones. Un solo h1 por pantalla; no anunciar repetidamente todo el pedido al cambiar la etiqueta de estado.

Pruebas a 1440/390 de referencia y 320/768/1280 adicionales; zoom 200 %, texto largo, teclado y reduced-motion si existe animación. No introducir avance automático ornamental.

## 10. Trazabilidad y aceptación

| Criterio | Verificación visual/local | Pendiente de integración |
| --- | --- | --- |
| US13-CA01 | Cinco estados con etiqueta y progreso correctos | Estado real de pedido propio |
| US13-CA02 | Nueva entrada actualiza presentación sin mezclar pedido | Consulta API y aviso correspondiente |
| US13-CA03 | Entregado sin etapas posteriores | Estado final retornado por servidor |
| US13-CA04 | Cancelado conserva datos sin progreso exitoso | Cancelación registrada por operación autorizada |
| US13-CA05 | No encontrado sin datos en DOM | Rechazo del pedido ajeno/inexistente |

Verificar que detalle/total/precios de US12 no cambian entre variantes. Conservar formato, retorno y navegación. No confundir pruebas de fixtures con aislamiento de cuentas real.

Heurísticas aplicables: estado visible, lenguaje familiar, consistencia entre vistas, prevención de cambios involuntarios, reconocimiento de etapas y recuperación de errores. Es guía de revisión, no certificación de usabilidad.

Comandos de implementación: npm.cmd run check y npm.cmd run build. Registrar además capturas y pruebas de navegador por estado/plataforma. No declarar S2-TSK-042 terminada por compilar o representar una muestra.

Para este commit documental, comprobar enlaces, cobertura de cinco criterios y separación de US12; no incluir código, manifiesto ni recursos de implementación pendientes.

## 11. Commits previstos

**Documento actual**
- Título: docs(us13): define el seguimiento del pedido.
- Descripción: Especifica la consulta del estado del pedido según los cinco criterios de US13. Define progreso, vistas Listo/Entregado/Cancelado, errores, navegación y verificación responsive/accesible, reutilizando US12 sin modificar su alcance. Mantiene la primera entrega visual sin integración API.

**Implementación posterior**
- Título: feat(us13): implementa el seguimiento del pedido.
- Alcance: progreso informativo y variantes de estado, conservando detalle y datos de US12. Sin cambios operativos de pedido ni actualización real del servidor.

No se crean commits automáticamente al preparar este archivo.

## 12. Criterios originales completos

### US13 — Consulta del estado del pedido

Actor documentado: cliente. Páginas físicas: 54, 55.

Como cliente, quiero consultar el estado actualizado de mi pedido para conocer el avance de su preparación y entrega.

#### US13-CA01 — Estado actual

Escenario 1: Estado actual Dado que el cliente posee un pedido asociado a su cuenta. Cuando consulta su estado. Entonces el sistema muestra si está Pendiente, En preparación, Listo, Entregado o Cancelado.

#### US13-CA02 — Avance de preparación

Escenario 2: Avance de preparación Dado que el restaurante cambió válidamente el estado del pedido. Cuando el cliente vuelve a consultar su pedido. Entonces el sistema muestra el nuevo estado y permite consultar la notificación correspondiente en su cuenta.

#### US13-CA03 — Pedido entregado

Escenario 3: Pedido entregado Dado que el pedido está Entregado. Cuando el cliente consulta su estado. Entonces el sistema muestra que la entrega fue completada y no presenta una etapa posterior de preparación.

#### US13-CA04 — Pedido cancelado

Escenario 4: Pedido cancelado Dado que el pedido fue cancelado. Cuando el cliente consulta su estado. Entonces el sistema muestra Cancelado y conserva los datos de la operación.

#### US13-CA05 — Pedido ajeno o inexistente

Escenario 5: Pedido ajeno o inexistente Dado que el pedido no existe o no pertenece al cliente. Cuando el cliente consulta su estado. Entonces el sistema informa que no se encontró el pedido y no revela datos de otra cuenta.
