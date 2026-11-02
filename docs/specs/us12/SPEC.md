# SPEC — US12: detalle del pedido y consulta de pago

Fecha: 01/11/2026. Entrega actual: documentación de US12. Rama de trabajo: feature/cliente-pedido. PR hacia develop.

Leer [SPEC común](../../../SPEC.md) y [AGENTS.md](../../../AGENTS.md). Este documento sustituye el SPEC conjunto anterior. La siguiente implementación se revisa únicamente contra US12; el seguimiento se prepara después, mediante otro SPEC y otro commit.

## 1. Objetivo y secuencia

Permitir al cliente consultar el detalle de un pedido propio y el registro de su pago para revisar lo comprado, su importe y los datos disponibles de la operación.

Secuencia acordada:
1. Preparar y revisar este SPEC de US12; commit documental.
2. Implementar/revisar únicamente US12; commit de implementación.
3. Preparar el SPEC de la siguiente historia en una entrega posterior.
4. Implementar esa historia en otro commit.

Hay modificaciones de implementación pendientes en el directorio de trabajo procedentes del intento conjunto anterior. Este documento no las elimina, no las incorpora automáticamente al commit documental y no las declara aceptadas. No usar git add . para este commit; seleccionar únicamente sus archivos documentales.

## 2. Alcance de US12

| Tarea | Alcance |
| --- | --- |
| S2-TSK-033 | Construir detalle con platos, cantidades, precios y total |
| S2-TSK-034 | Integrar posteriormente consulta propia y pago, carga y acceso denegado |

Primera implementación: interfaz responsive y navegación con datos de muestra identificados. S2-TSK-034 no se considera cumplida por representar fixtures.

Incluye:
- Desglose del pedido y conservación de los precios registrados.
- Modalidad, restaurante, fecha y mesa/dirección cuando corresponda.
- Consulta de pago Pagado, Pendiente o registro no disponible.
- Carga, error y pedido no encontrado.
- Navegación detalle → pago → retorno, sin mezclar operaciones.
- Responsive, semántica y teclado.

Fuera de este SPEC: progreso de preparación, etapas de entrega, vistas Listo/Entregado/Cancelado, controles de seguimiento y actualización en tiempo real. Mostrar el estado actual del pedido sí forma parte de US12-CA01; no requiere implementar el proceso de seguimiento.

También quedan fuera cobros, formularios de tarjeta, registro administrativo de pagos, carrito, creación/edición/cancelación de pedidos, listado completo, autenticación y servicios IA.

## 3. Fuentes y pantallas

Fuente funcional: reporte report_1ACC0236-20262.pdf, US12, páginas físicas 52–54; sus seis criterios completos se conservan al final.

Fuente visual: [Figma vigente](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=5-92), página RestoPilot 5:92.

| Pantalla | Desktop | Mobile |
| --- | --- | --- |
| cliente-pedido-detalle | 84:33478, 1440 × 960.60 | 84:33631, 390 × 1483.10 |
| cliente-pago | 84:32934, 1440 × 900 | 84:33017, 390 × 918.20 |
| cliente-pago-pendiente | 84:32798, 1440 × 900 | 84:32870, 390 × 817.20 |

Se reutilizan las consultas de Figma realizadas en esta sesión: contextos de detalle desktop/mobile y de pago desktop; composición y textos disponibles en el SPEC común. La captura de detalle mobile fue inspeccionada. No se atribuyen a estas lecturas pruebas de aplicación ni autorización real.

El frame de detalle incluye un progreso de preparación compartido con otra historia. Para US12 implementar la información del pedido y su etiqueta de estado; reservar el progreso para su entrega posterior.

## 4. Rutas y archivos

| Escenario | Ruta existente |
| --- | --- |
| Detalle | /cliente/pedido |
| Pago registrado | /cliente/pago |
| Pago pendiente | /cliente/pago?vista=cliente-pago-pendiente |
| Listado de referencia | /cliente/pedidos |

Archivos de pantalla: src/app/pages/cliente/cliente-pedido-detalle/, cliente-pago/ y cliente-pago-pendiente/, cada uno con .ts, .html y .css del mismo nombre.

Reutilizar el área local pedido-ui cuando corresponda, limitando el commit de US12 a presentación de detalle/pago y datos compartidos necesarios. No incorporar import/uso de componentes de progreso ni variantes de otras historias en ese commit. El primer commit de implementación debe compilar por sí solo.

Conservar rutas, cargadores y ScreenHost. ?vista= selecciona composición, no identifica un pedido ni concede permisos. No inventar identificadores de URL ni endpoints. En la entrega visual compartir la misma muestra; en integración confirmar el mecanismo real de identificación.

## 5. Detalle y contenido

Encabezado «PEDIDOS CLIENTE», título de referencia «Estamos preparando algo bueno», texto «Cada paso, sin perderte nada.». Reconsiderar el título si se usa otro estado, sin inventar hechos de preparación. No mostrar RP / 023 ni códigos internos del diseño.

Secciones:
1. Identificador de pedido y estado actual como información.
2. «Tu selección»: Plato, Cantidad, Precio unitario, Subtotal; resumen y total.
3. «Información del pedido»: modalidad, restaurante, fecha y datos condicionales.
4. Acción «Ver registro de pago».

Muestra visual, no transacción real:
- Pedido #1042, restaurante La Mesa Verde.
- Lomo saltado: 1 × S/ 38.00; subtotal S/ 38.00.
- Ají de gallina: 1 × S/ 28.00; subtotal S/ 28.00.
- Total S/ 66.00.
- Solicitud: 20 oct 2026 · 13:30.
- Modalidad: Recoger en restaurante.
- Dirección del local: Av. Primavera 240, Lima.

El desglose representa nombres y precios guardados al comprar; no leerlos de la carta actual ni recalcular con precios nuevos. Total integrado proviene del servidor. No añadir tasas, propinas, promociones o cargos no documentados.

Mostrar mesa para SALON cuando exista. Distinguir dirección del restaurante en RECOGER de dirección de entrega en DELIVERY. Omitir campos no aplicables; no inventar ubicación de cliente. Comprobar la matriz de modalidad con US11 y contrato antes de integrar.

Conservar el sentido del aviso «El total definitivo lo calcula el restaurante. No se cobra desde esta pantalla.».

## 6. Consulta del pago

### Pagado

Mostrar pedido, importe y estado. Método, referencia y fecha solo cuando estén registrados. Muestra del frame: Yape, OP-204812, 20 oct 2026 · 13:35, S/ 66.00.

El frame usa #1034 mientras el detalle usa #1042. En la muestra enlazada mantener coherencia de #1042; no copiar el desacuerdo ni presentar datos reales de otra operación. Antes de mostrar referencia, verificar que el registro corresponde al pedido consultado.

Aviso: «El restaurante registró este pago recibido por un medio externo. RestoPilot no procesa el cobro.».

### Pendiente

Mostrar Pendiente e importe disponible. Si no se eligió método, no mostrar uno ni inventar referencia o fecha de confirmación.

Textos de referencia:
- «Tu pago está pendiente».
- «Aún no hay un pago confirmado por el restaurante. Consulta con el personal cómo realizarlo.».
- «No se ha elegido un método de pago. No hay pasarela ni captura de tarjeta.».

### Registro no disponible

Informar «No existe un registro de pago para este pedido». No sustituirlo por un pago de otra operación, ni mostrar una confirmación inexistente. No confundir ausencia de registro con pago Pendiente.

No incluir formularios de cobro, cambio de método, confirmación administrativa o reembolso.

## 7. Estados de consulta y privacidad

- Carga: indicar consulta pendiente sin revelar datos anteriores.
- Disponible: mostrar solo la información del pedido seleccionado.
- No encontrado: pedido inexistente o ajeno; mismo mensaje de negocio sin revelar su existencia o datos.
- Error: explicación comprensible y salida/reintento coherente con el alcance.
- Sin pago: ausencia de registro diferenciada de pago Pendiente.

Usar estados de presentación o fixtures, sin añadir ?vista= no reconocido. Un objeto local de muestra no demuestra control de acceso; mantener esa limitación explícita.

No conservar un pago de otra operación al cambiar el pedido. En fase integrada verificar identificador y propietario en el servidor. No introducir JWT, almacenamiento de credenciales, HTTP o caché real en esta primera entrega.

## 8. Navegación y dependencias

«Ver registro de pago» usa la ruta/variante correspondiente y conserva el pedido. «Volver al pedido» recupera el contexto de detalle sin crear operaciones. «Mis pedidos» usa /cliente/pedidos; el listado puede seguir pendiente y no debe implementarse por arrastre.

El marco cliente compartido debe reutilizarse o completarse de forma mínima y coordinada; no reconstruir navegación de módulos ajenos. No mostrar una cuenta ficticia autenticada: en la etapa visual usar identificación explícita de muestra.

Navegación interna con routerLink. No hacer que enlaces de salto internos resuelvan a la landing debido a base href; comprobar foco y ruta actual.

## 9. Estilos y accesibilidad

Aplicar el sistema de aplicación del SPEC común: Roboto y sus respaldos; primary #1B7954, navy #15324E, surface #FFFBF7, ink #172D3B y error #BA1A1A. Usar tokens --rp-* y APIs públicas de Material. No copiar tipografía ni paleta de marketing de la landing.

Desktop: desglose y resumen en dos columnas; móvil: selección antes del resumen. El frame móvil recorta columnas: corregirlo mediante tabla desplazable dentro de una región accesible o desglose apilado con etiquetas completas. No ocultar subtotal/total ni desbordar toda la página.

Un h1; tablas con encabezados y nombre accesible; foco visible, navegación por teclado y texto además del color en estados. Carga/error anunciables sin repetir todo el desglose. Textos largos, importes y opcionales no deben causar recortes.

Probar 1440/390 de referencia, 320/768/1280 como QA adicional y zoom 200 %. No fijar altura del frame ni ocultar overflow global.

## 10. Trazabilidad y verificación de US12

| Criterio | Prueba visual/local | Verificación integrada posterior |
| --- | --- | --- |
| CA01 | Desglose y campos por modalidad con fixtures | Consulta de pedido propio |
| CA02 | Registro completo del mismo pedido | Respuesta de pago autorizada |
| CA03 | Pendiente sin datos de confirmación inventados | Estado real sin método elegido |
| CA04 | Sin pago, sin registro de otra operación | Ausencia real de registro |
| CA05 | No encontrado sin datos en DOM | Rechazo de pedido ajeno/inexistente |
| CA06 | Snapshot mantiene precios aunque cambie carta | Precio histórico retornado por API |

Heurísticas: estado visible, lenguaje de compra, retorno sin cambios, consistencia de importes, prevención de cobros ficticios, desglose reconocible y errores con recuperación. Estas son revisiones propuestas, no certificación.

Para implementación: npm.cmd run check y npm.cmd run build; pruebas de navegador de rutas directas, navegación a pago/retorno, teclado y responsive. Registrar resultados realmente ejecutados por criterio. Compilar no valida seguridad ni negocio.

En el commit documental solo verificar referencias, cobertura de los seis criterios y consistencia del alcance. No incluir modificaciones de código o manifiesto pendientes por usar un agregado masivo.

## 11. Commits previstos

**Documento de US12**
- Título: docs(us12): define el detalle y consulta de pago.
- Descripción: Especifica la consulta del detalle del pedido y su registro de pago, con los seis criterios de US12, rutas, pantallas, reglas, estados y verificación responsive/accesible. Delimita la primera entrega visual sin API ni cobros y deja el seguimiento para una historia posterior.

**Implementación posterior de US12**
- Título: feat(us12): implementa el detalle y consulta de pago.
- Alcance: desglose, datos del pedido, consulta visual de pago, estados de consulta y navegación. Sin progreso ni variantes de seguimiento.

No crear commits automáticamente. Revisar y guardar primero el documento; después preparar la implementación aislada.

## 12. Criterios originales completos

### US12 — Consulta del detalle del pedido y su pago

Actor documentado: cliente. Páginas físicas: 52, 53, 54.

Como cliente, quiero consultar la información de un pedido propio y su registro de pago para revisar lo solicitado y el importe asociado a mi compra.

#### US12-CA01 — Detalle de pedido propio

Escenario 1: Detalle de pedido propio Dado que el cliente posee un pedido asociado a su cuenta. Cuando consulta su detalle. Entonces el sistema muestra platos, cantidades, precios unitarios, subtotales, total, modalidad, fecha y estado; incluye mesa o dirección cuando corresponde.

#### US12-CA02 — Consulta del pago

Escenario 2: Consulta del pago Dado que el pedido del cliente tiene un pago registrado. Cuando el cliente consulta ese pago. Entonces el sistema muestra el monto y estado, y el método, referencia y fecha cuando ya se hayan registrado.

#### US12-CA03 — Pago todavía pendiente

Escenario 3: Pago todavía pendiente Dado que el pedido tiene pago Pendiente y aún no se eligió un método. Cuando el cliente consulta el pago. Entonces el sistema informa que está pendiente sin presentar un método o una confirmación de pago inexistentes.

#### US12-CA04 — Sin registro de pago disponible

Escenario 4: Sin registro de pago disponible Dado que un pedido propio no tiene un registro de pago disponible. Cuando el cliente solicita consultarlo. Entonces el sistema informa que no existe un registro de pago para ese pedido, sin mostrar un pago de otra operación.

#### US12-CA05 — Pedido inexistente o ajeno

Escenario 5: Pedido inexistente o ajeno Dado que el pedido no existe o pertenece a otro cliente. Cuando el cliente intenta consultar su detalle o pago. Entonces el sistema no muestra la información y comunica que no se encontró el pedido.

#### US12-CA06 — Conservación del precio de compra

Escenario 6: Conservación del precio de compra Dado que un pedido fue registrado con nombres y precios determinados y la carta cambió después. Cuando el cliente consulta su pedido. Entonces el sistema conserva los nombres y precios registrados para esa compra, sin reemplazarlos por los actuales.
