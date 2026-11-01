# SPEC — Detalle y seguimiento del pedido del cliente

Fecha: 01/11/2026. Estado: especificación preparada; implementación pendiente. Rama propuesta: feature/cliente-pedido. PR hacia develop. Entrega inicial: interfaz y navegación local, sin API.

Leer [SPEC común](../../../SPEC.md) y [AGENTS.md](../../../AGENTS.md). No contiene nombres de integrantes; la coordinación vigente continúa en los documentos de asignación.

## 1. Objetivo y límites

Permitir al cliente revisar un pedido propio, su desglose y registro de pago, y comprender su estado de preparación/entrega. US12 y US13 comparten detalle y estados alternativos: se desarrollan en la misma rama con dos commits de implementación separados.

| Historia | Tareas originales | Entrega |
| --- | --- | --- |
| US12 | S2-TSK-033 construir detalle; 034 integrar consulta propia y pago | Primero detalle y consulta visual de pago; integración posterior |
| US13 | S2-TSK-041 construir seguimiento; 042 actualizar desde API | Después estados y progreso; integración posterior |

No implementar en esta entrega HTTP, JWT, autenticación, pedidos reales, cobros, cancelación, edición administrativa, cocina, IA, notificaciones operativas ni polling/WebSocket. Tampoco crear carrito o historial completo por depender de ellos.

Los 11 criterios originales se conservan íntegros al final. En esta etapa solo puede validarse representación y navegación con datos de muestra identificados. La privacidad, persistencia y actualización real requieren integración y pruebas posteriores.

## 2. Evidencia de diseño

Archivo vigente: [RestoPilot](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=5-92), página 5:92. IDs comprobados en esta copia el 01/11/2026, sin asumir continuidad por el archivo anterior.

| Escenario | Desktop | Mobile | Alcance |
| --- | --- | --- | --- |
| cliente-pedido-detalle | 84:33478, 1440 × 960.60 | 84:33631, 390 × 1483.10 | Commit de detalle; progreso se completa en seguimiento |
| cliente-pedido-listo | 84:39170, 1440 × 960.60 | 84:39323, 390 × 1450.70 | Seguimiento |
| cliente-pedido-entregado | 84:33776, 1440 × 960.60 | 84:33929, 390 × 1483.10 | Seguimiento |
| cliente-pedido-cancelado | 84:33092, 1440 × 920.60 | 84:33225, 390 × 1373.70 | Seguimiento |
| cliente-pago | 84:32934, 1440 × 900 | 84:33017, 390 × 918.20 | Consulta visual, no registro administrativo |
| cliente-pago-pendiente | 84:32798, 1440 × 900 | 84:32870, 390 × 817.20 | Consulta visual |
| cliente-pedidos | 84:39468 | 84:39590 | Destino/listado existente; no implementar listado completo aquí |
| cliente-pedido-creado | 84:33350 | 84:33418 | Referencia de US11; fuera del alcance de archivos |

Enlaces de referencia: [detalle desktop](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=84-33478) y [detalle mobile](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=84-33631).

Consultado: inventario de secciones/frames, contenido textual y reacciones de seis frames desktop, dimensiones mobile y texto del detalle mobile. Capturas de detalle desktop/mobile inspeccionadas. No se inspeccionaron capturas individuales de todos los otros estados ni se ejecutaron clics de prototipo: recuperarlos antes de implementar cada variante.

Se conserva configuración ON_CLICK del enlace «Ver registro de pago» hacia 84:32934 en desktop, incluidos Listo/Entregado/Cancelado. Es configuración leída, no recorrido ejecutado.

## 3. Rutas y archivos existentes

No crear /cliente/pedido-seguimiento ni una nueva ruta por estado. Conservar ScreenHost, la base y los valores ?vista=.

| Escenario | URL actual |
| --- | --- |
| Detalle canónico | /cliente/pedido |
| Listo | /cliente/pedido?vista=cliente-pedido-listo |
| Entregado | /cliente/pedido?vista=cliente-pedido-entregado |
| Cancelado | /cliente/pedido?vista=cliente-pedido-cancelado |
| Pago registrado | /cliente/pago |
| Pago pendiente | /cliente/pago?vista=cliente-pago-pendiente |
| Listado de referencia | /cliente/pedidos |

Cada escenario se encuentra en src/app/pages/cliente/<slug>/ con sus archivos <slug>.ts, <slug>.html y <slug>.css. Se comprobaron sus rutas en src/app/routes/cliente/cliente.routes.ts y el manifiesto.

El manifiesto relaciona cliente-pedido-entregado con US11, aunque su contenido sirve a US13-CA03 y las fichas del reporte lo vinculan al detalle/seguimiento. Registrar esta discrepancia; no reasignar silenciosamente el inventario ni excluir Entregado de las pruebas de US13.

?vista= selecciona una composición, no identifica una operación ni concede permisos. No inventar un parámetro id, pedidoId o ruta :id sin acordar el contrato de selección. En el modo visual, compartir una muestra local entre detalle y pago; en integración, conservar el identificador real por el mecanismo verificado.

## 4. Dependencias y organización

Archivos principales del primer commit: escenarios cliente-pedido-detalle, cliente-pago y cliente-pago-pendiente. Segundo commit: escenario detalle para el progreso y escenarios listo, entregado y cancelado.

Reutilizar composición mediante una pieza local de presentación dentro del área de pedido si evita duplicar tabla, resumen y datos entre cuatro estados. Mantener los componentes de escenario como entradas del inventario; no eliminarlos ni renombrarlos. No duplicar servicios o estado por cada carpeta. Un modelo local de vista no es un DTO API.

Candidatos compartidos: ClienteLayout, client-header, client-footer, page-heading, status-badge, loading-state, empty-state y data-table. La revisión encontró plantillas TODO en layout/cabecera y componentes de estado; existencia no equivale a disponibilidad funcional. Antes de implementar, decidir el mínimo de infraestructura compartida necesario y coordinarlo según la asignación. No implementar toda la navegación de cliente como efecto secundario.

Si el marco se completa para estas pantallas, debe ser reutilizable y no duplicarse dentro de cada estado. Conservar router-outlet. No cambiar la landing ni aplicar su variante de marketing.

## 5. Detalle visual — primer commit

### Composición

1. Marco cliente: marca, navegación contextual y pie según diseño; contexto de muestra identificado. No crear sesiones ni permisos ficticios.
2. Encabezado «PEDIDOS CLIENTE», título «Estamos preparando algo bueno» y apoyo «Cada paso, sin perderte nada.».
3. Tarjeta «Pedido #1042» con estado actual; reservar espacio para el progreso del segundo commit.
4. Panel «Tu selección»: Plato, Cantidad, Precio unitario, Subtotal; resumen y total.
5. Panel «Información del pedido»: modalidad, restaurante, fecha de solicitud y datos de ubicación que correspondan.
6. Acción «Ver registro de pago».

La referencia RP / 023 y los códigos RP / 024–028 son identificadores del diseño, no texto de producto. No trasladarlos a la UI final.

### Muestra documentada, no transacción

- Restaurante: La Mesa Verde.
- Pedido #1042; fecha de solicitud: 20 oct 2026 · 13:30.
- Modalidad del ejemplo: Recoger en restaurante.
- Lomo saltado: cantidad 1, unitario S/ 38.00, subtotal S/ 38.00.
- Ají de gallina: cantidad 1, unitario S/ 28.00, subtotal S/ 28.00.
- Total: S/ 66.00; dos platos.
- Dirección del local: Av. Primavera 240, Lima.

S/ es el formato de esta muestra Figma, no confirmación de un contrato multi-moneda. Conservar nombres y precios de la compra aunque cambie la carta (US12-CA06); no recalcular con precios actuales del catálogo. En integración, total y subtotales provienen de la operación confirmada.

El diseño dice «El total definitivo lo calcula el restaurante. No se cobra desde esta pantalla.». Mantener el sentido de consulta sin cobro; no añadir propinas, tasas, descuentos o botón Pagar.

### Datos según modalidad

Mostrar SALON/LLEVAR/RECOGER/DELIVERY con etiquetas del producto y campos aplicables según US11/US12. Mesa solo cuando corresponda. Diferenciar dirección del restaurante para recoger de dirección de entrega en delivery. No inventar dirección de cliente ni etiquetar la dirección del local como entrega. La matriz exacta de campos se verifica con US11 y el contrato antes de integrar.

## 6. Consulta de pago — primer commit

Pago registrado: encabezado «El registro de tu pago», apoyo «Tu información, en un solo lugar.», pedido, estado Pagado, monto, método, referencia y fecha disponibles. Aviso: «El restaurante registró este pago recibido por un medio externo. RestoPilot no procesa el cobro.».

Pago pendiente: «Tu pago está pendiente», «El estado se actualiza cuando el restaurante lo registra.», importe y aviso «Aún no hay un pago confirmado por el restaurante. Consulta con el personal cómo realizarlo.». Si no hay método elegido, conservar «No se ha elegido un método de pago. No hay pasarela ni captura de tarjeta.».

No confundir:
- Pendiente: existe registro pendiente, sin confirmación.
- Sin registro: no hay registro disponible; informar sin usar otro pedido.
- No encontrado: pedido inexistente/ajeno; no revelar sus datos.

Datos de ejemplo del frame Pagado: Yape, OP-204812, 20 oct 2026 · 13:35 y S/ 66.00. El frame usa #1034, pero el detalle enlazado usa #1042. **Corregir consistencia en la muestra navegable:** pago y detalle deben pertenecer al mismo pedido; no copiar el desacuerdo ni atribuir el pago de #1034 a #1042 como dato real.

No agregar formulario de pago, captura de tarjeta, confirmación, cambio de método, reembolso o alta administrativa US18. US12 requiere consulta, no operación de cobro.

## 7. Seguimiento — segundo commit

El seguimiento es representación de un estado de negocio, no un control para que el cliente lo avance.

| Estado del negocio | Representación |
| --- | --- |
| Pendiente | Primera etapa recibida; las posteriores no se presentan completadas |
| En preparación | Recibido completado y preparación actual; Listo/Entregado futuros |
| Listo | Hasta Listo alcanzado; Entregado futuro |
| Entregado | Proceso completado, sin etapa posterior |
| Cancelado | Insignia/mensaje de cancelación; conservar desglose y datos, sin simular avance exitoso |

El frame usa «Recibido» como etiqueta del primer paso; no añadir RECIBIDO como enum de negocio. Estados originales: Pendiente, En preparación, Listo, Entregado, Cancelado.

Títulos observados: «Estamos preparando algo bueno», «Tu pedido está listo», «Esperamos que lo hayas disfrutado» y «Pedido cancelado». El título de Pendiente sin alta no está documentado como frame específico: definirlo coherentemente como presentación de estado sin reutilizar la pantalla US11 para aparentar crear un pedido.

Representar orden/progreso con lista semántica y aria-current="step" donde proceda. No usar un stepper editable si permite cambiar estado de negocio. No inventar tiempos estimados, porcentajes, ubicación de repartidor o timestamps de etapas.

En interfaz visual, elegir escenarios con las URLs de demostración del inventario; no instalar botones de avance/cancelación del pedido. En integración, el estado cambia solo por nueva consulta/respuesta válida del servidor. No autorizar polling, WebSocket o notificaciones reales implícitamente por US13-CA02.

## 8. Navegación

| Acción | Destino | Restricción |
| --- | --- | --- |
| Mis pedidos / retorno al listado | /cliente/pedidos | Ruta existe; listado sigue fuera del trabajo de implementación de detalle |
| Ver registro de pago | /cliente/pago o variante pendiente según muestra | Mantener el mismo pedido |
| Notificaciones de referencia | /cliente/notificaciones | No implementar US28 ni afirmar entrega real |
| Inicio cliente | /cliente | No reconstruir pantalla de inicio |
| La carta | /cliente/carta | No implementar catálogo |
| Mis reservas | /cliente/reservas | No implementar reservas |
| Asistente IA | /cliente/asistente | IA prevista; no conectar servicio |
| Cerrar sesión de muestra | Destino de acceso solo si el modo muestra está explícito | No simular cierre de sesión real ni borrar credenciales sin integración autorizada |

Los iconos de cabecera deben tener nombre accesible y destino verificado; no deducirlo del glifo. Conservar rutas existentes con routerLink. El destino puede ser una plantilla pendiente; navegar a ella no valida su funcionalidad.

Probar ida/vuelta detalle → pago sin mezclar operaciones. Si la UI incorpora «Volver al pedido», el destino debe conservar el estado/pedido; es una decisión de navegación propuesta, no una conexión de Figma ya ejecutada.

## 9. Estilo y responsive

Aplicar la base de la aplicación de SPEC común y AGENTS.md: primary #1B7954, navy #15324E, surface #FFFBF7, ink #172D3B, container #D8F2E3, error #BA1A1A; Roboto y respaldos declarados. Verificar propiedades específicas de los frames antes de codificar. No copiar Manrope/DM Sans, colores de marketing ni barra flotante de la landing.

Material para tablas, tarjetas, botones y estados compatibles. CSS local para composición; tokens --rp-* y APIs públicas. @if/@for con track y standalone .ts/.html/.css. No nuevas dependencias.

Desktop: progreso ancho completo arriba; selección y resumen en dos columnas. Mobile: bloques apilados, selección antes del resumen, encabezado/nav legibles.

La captura mobile recorta columnas y solapa rótulos de progreso; no reproducir esos problemas. Elegir tabla dentro de región de scroll accesible o desglose apilado con etiquetas completas. Mantener subtotal/total disponibles, sin ocultar datos para caber. Usar progreso vertical o composición en filas sin solapamiento si el ancho lo exige; registrar la adaptación frente al diseño.

Probar 1440/390 como referencias y 320/768/1280 como tamaños QA propuestos. No fijar alturas del frame ni ocultar overflow global. Probar zoom 200 %, nombres de platos largos, moneda/importe largo y ausencia de campos opcionales.

## 10. Carga, vacío, errores y privacidad

Estados locales de presentación para revisar criterios:
- Cargando consulta, sin anunciar éxito anticipado.
- Pedido disponible.
- Registro pendiente de pago.
- Sin registro de pago.
- Pedido no encontrado.
- Error de consulta con acción de recuperación cuando aplique.

No se halló ruta específica para cada error: usar un estado de vista del mismo componente o fixture de prueba, sin inventar ?vista= no reconocido. El estado «No encontrado» no muestra tabla, importe ni datos ajenos debajo del mensaje.

Las muestras deben identificarse como demostración; no crear usuarios ficticios autenticados ni afirmar aislamiento por tener un objeto local. Usar fixtures para probar representación de permiso/rechazo, documentando que el servidor todavía no se consultó.

En integración futura: comprobar identificador, usuario propietario, contrato de respuesta y errores. No filtrar datos de otro pedido desde caché cuando cambie el contexto. Para pedido ajeno/inexistente conservar el mensaje de no encontrado de los criterios; no revelar existencia de otra cuenta.

## 11. Trazabilidad y aceptación local

| Referencia original | Presentación/escenario de esta entrega | Prueba propuesta |
| --- | --- | --- |
| US12-CA01 | Detalle/desglose y campos de modalidad | Fixture completo; desktop/mobile |
| US12-CA02 | Pago consultable | Datos disponibles del mismo pedido |
| US12-CA03 | Pago pendiente sin método | No mostrar confirmación/fecha inventada |
| US12-CA04 | Sin registro | Mensaje sin pago de otra operación |
| US12-CA05 | No encontrado | No revelar datos en DOM |
| US12-CA06 | Snapshot de compra | Cambiar carta de fixture sin cambiar desglose |
| US13-CA01 | Cinco estados | Etiqueta y progreso coherentes |
| US13-CA02 | Actualización representada | Cambiar fixture de respuesta; integración pendiente |
| US13-CA03 | Entregado | Sin pasos posteriores ni controles de avance |
| US13-CA04 | Cancelado | Conservar datos sin progreso exitoso |
| US13-CA05 | No encontrado | Sin contenido de otro cliente |

Aceptación común de interfaz: rutas directas/refresh correctos; un h1 por pantalla, tablas con encabezados; estado con texto además de color; precios con formato consistente; acciones navegables por teclado; foco visible y retorno; regiones de error/estado anunciables sin leer toda la tabla repetidamente.

Conservar jerarquía y contenido al pasar de detalle a variantes. No insertar nombres de integrantes o IDs RP internos en la interfaz. No marcar tareas API 034/042 como realizadas por probar fixtures.

## 12. Heurísticas y QA

| Heurística | Aplicación |
| --- | --- |
| H1 Estado visible | Progreso, pago y carga comprensibles |
| H2 Lenguaje | Pedido, modalidad, cantidades y registro de pago |
| H3 Control | Volver sin modificar la compra |
| H4 Consistencia | Mismo pedido/datos entre detalle, pago y seguimiento |
| H5 Prevención | Sin controles que aparenten cobrar/cancelar/avanzar estado |
| H6 Reconocimiento | Desglose y resumen visibles, sin memorizar la compra |
| H7 Eficiencia | Acceso directo a pago y retorno |
| H8 Prioridad | Importe y estado claros, sin datos técnicos |
| H9 Recuperación | Mensaje de no encontrado/error sin datos ajenos |
| H10 Ayuda | Explicar pago externo y carácter de muestra |

Comprobar cada criterio con fixture y evidencia de plataforma. Para actualización real y privacidad, repetir con entorno/contrato autorizados cuando se integre la API; los fixtures no demuestran autorización del backend.

Comandos de implementación: npm.cmd run check y npm.cmd run build. El chequeo actual rechaza contenidoImplementado=true para las 120 pantallas; al implementar acordar una actualización del chequeo y estados basada en evidencia, sin desactivar controles ni dejar pendiente un contenido que sí se entregó.

Hoy solo se revisan enlaces, cobertura y estructura; no ejecutar ni registrar como aprobadas pruebas funcionales de una interfaz todavía inexistente.

## 13. Orden de trabajo y commits

Una rama feature/cliente-pedido desde develop actualizado; comprobar cambios existentes y no cambiar de rama descartando trabajo.

1. **Documentación actual:** docs(cliente-pedido): define el detalle y seguimiento del pedido.
2. **Implementación 1:** feat(cliente-pedido): implementa el detalle del pedido. Incluye desglose, consulta visual de pago, estados de consulta y componentes de presentación mínimos reutilizables.
3. **Implementación 2:** feat(cliente-pedido): implementa el seguimiento del pedido. Reutiliza detalle, añade progreso y estados Listo/Entregado/Cancelado.
4. Un PR hacia develop con alcance por historia, pruebas separadas, capturas y pendientes. No publicar automáticamente.

No incluir en esos commits implementación de listado, carrito, alta de pedido, cocina o pago administrativo. Si una dependencia compartida excede lo necesario para este flujo, coordinarla y separarla en un cambio explícito.

## 14. Pendientes antes de implementar

- Consultar propiedades/capturas individuales de cada variante y contexto compartido; este SPEC no acredita inspección visual de todas.
- Completar o adaptar el marco cliente actualmente TODO sin alterar otras pantallas.
- Acordar identidad/contexto del pedido para navegación futura; ?vista= no es identificador de operación.
- Diseñar estados de carga/no encontrado/sin pago dentro de componentes existentes.
- Mantener #1042 en la muestra enlazada; #1034 del frame Pagado es una discrepancia de ejemplo.
- Corregir presentación mobile de tabla/progreso y revisar contraste, teclado y textos largos.
- Coordinar ajuste del chequeo de estructura cuando se autorice implementar pantallas.
- Verificar contratos API antes de la fase de integración; no se inventan endpoints, enums, refresco o política JWT.

## 15. Historias y criterios originales completos

Texto conservado desde SPEC común cotejado con el reporte. Los números CA identifican los escenarios originales. Las pruebas locales de presentación anteriores no sustituyen estos requisitos de negocio.

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
