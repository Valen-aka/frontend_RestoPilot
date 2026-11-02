# SPEC — US11: carrito y registro del pedido según modalidad

Fecha: 01/11/2026. Entrega actual: interfaz y recorrido local implementados; integración y aceptación pendientes. Rama de trabajo: feature/cliente-pedido. PR hacia develop.

Leer el [SPEC común](../../../SPEC.md), [AGENTS.md](../../../AGENTS.md), [SPEC de US12](../us12/SPEC.md) y [SPEC de US13](../us13/SPEC.md). Este documento corresponde únicamente a US11 y no sustituye las historias ya preparadas.

## 1. Objetivo y secuencia

Como cliente, quiero registrar un pedido para salón, para llevar, para recoger o por delivery para solicitar los platos que deseo consumir mediante la modalidad disponible.

Secuencia acordada para esta historia:
1. Preparar este SPEC y guardarlo mediante un commit documental.
2. Implementar la interfaz y navegación de US11 en otro commit.
3. Revisar evidencias y limitaciones; integrar servicios solamente cuando exista autorización y contrato confirmado.

Preparar el documento no autoriza crear commits ni implementar automáticamente. No incluir cambios de US12/US13 en el commit documental. El directorio de trabajo estaba limpio antes de esta entrega.

## 2. Alcance y tareas originales

| Tarea | Alcance original |
| --- | --- |
| S2-TSK-031 | Construir el carrito y la selección de modalidad SALON, LLEVAR, RECOGER o DELIVERY con sus campos condicionales. |
| S2-TSK-032 | Integrar el registro de pedidos y mostrar totales confirmados por la API y restricciones de platos, mesas y atención. |

Primera implementación: ocho pantallas responsive, validaciones locales, estados de consulta y navegación con datos de muestra identificados. S2-TSK-032 queda pendiente mientras no haya integración real.

Incluye carrito con contenido y vacío; revisión de cantidades e importes; vaciado del borrador; cuatro modalidades; mesa o dirección condicional; restaurante cerrado; presentación de confirmación de muestra; continuidad hacia detalle y seguimiento existentes.

Excluye implementar carta y detalle de platos, historial completo, cocina, cambios operativos de estado, reservas, pagos, autenticación, JWT, notificaciones reales, servicios IA y persistencia de pedidos en servidor. No crear un backend ni inventar sus endpoints. La selección desde la carta se coordina mediante una interfaz de datos futura; no ampliar su módulo por arrastre.

## 3. Fuentes y estado comprobado

Fuente funcional: report_1ACC0236-20262.pdf, US11, páginas físicas 50–52. Los nueve criterios completos se conservan en la sección 14; también están en el SPEC común. Fichas de interfaz PDF-UI-020 a PDF-UI-027, páginas 112–117.

Fuente visual: [Figma vigente, página de aplicación](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=5-92).

| Escenario | Desktop | Mobile |
| --- | --- | --- |
| cliente-carrito | 84:17424 · 1440 × 900 | 84:17538 · 390 × 1087 |
| cliente-carrito-vacio | 84:17296 · 1440 × 900 | 84:17364 · 390 × 880.60 |
| cliente-entrega-salon | 84:24109 · 1440 × 907.30 | 84:24241 · 390 × 1281.10 |
| cliente-entrega-delivery | 84:18632 · 1440 × 907.30 | 84:18764 · 390 × 1332.10 |
| cliente-entrega-llevar | 84:18888 · 1440 × 907.30 | 84:19016 · 390 × 1232.60 |
| cliente-entrega-recoger | 84:19136 · 1440 × 907.30 | 84:19264 · 390 × 1257.10 |
| cliente-restaurante-cerrado | 84:48380 · 1440 × 900 | 84:48448 · 390 × 909.60 |
| cliente-pedido-creado | 84:33350 · 1440 × 900 | 84:33418 · 390 × 963 |

En esta entrega se consultaron estructura, identificadores, dimensiones y textos desktop de estas ocho vistas mediante Figma. No se realizaron comparaciones visuales por captura ni pruebas de navegador de US11. Antes de implementar, obtener contexto y capturas de las referencias desktop/mobile y revisar sus controles y recursos; esta lectura documental no sustituye esa comparación.

Al preparar el SPEC, las ocho entradas figuraban pendientes en el manifiesto y carrito conservaba la estructura base. El avance posterior se registra en la sección 15. El código de detalle, pago y seguimiento ya existe: reutilizar lo adecuado sin declarar terminada US11 por esa existencia.

## 4. Rutas y archivos

| Escenario | Ruta existente |
| --- | --- |
| Carrito | /cliente/carrito |
| Vacío | /cliente/carrito?vista=cliente-carrito-vacio |
| Salón | /cliente/entrega |
| Delivery | /cliente/entrega?vista=cliente-entrega-delivery |
| Para llevar | /cliente/entrega?vista=cliente-entrega-llevar |
| Recoger | /cliente/entrega?vista=cliente-entrega-recoger |
| Cerrado | /cliente/entrega?vista=cliente-restaurante-cerrado |
| Confirmación | /cliente/pedido?vista=cliente-pedido-creado |
| Carta, referencia | /cliente/carta |
| Detalle y seguimiento existentes | /cliente/pedido |

Cada escenario mantiene su carpeta src/app/pages/cliente/<escenario>/ y sus archivos .ts, .html y .css. Conservar nombres de clases, cargadores, rutas y los 120 identificadores del inventario. Las rutas están en src/app/routes/cliente/cliente.routes.ts.

?vista= selecciona presentación; no identifica al cliente, restaurante, mesa o pedido ni concede permisos. Abrir la URL de confirmación directamente muestra una referencia de muestra claramente identificada o un aviso de falta de contexto; nunca acredita que se haya enviado un pedido.

Puede añadirse un área local carrito-ui para estado del borrador y presentación común, evitando duplicar ocho formularios/tablas. Reutilizar componentes de pedido-ui únicamente si sus entradas y semántica son compatibles. Mantener separado el borrador mutable del snapshot de compra de US12. No refactorizar layout global ni dependencias para esta historia.

## 5. Carrito y datos de muestra

Título «Tu pedido, a tu gusto», apoyo «Una buena elección, dos veces.», bloque «Lo que elegiste» y resumen. Tabla: Plato, Cantidad, Precio unitario, Subtotal. Acciones «Seguir explorando», «Vaciar pedido» y «Elegir cómo disfrutarlo».

Muestra visual de La Mesa Verde: Lomo saltado, 1 × S/ 38.00; Ají de gallina, 1 × S/ 28.00; dos unidades y total estimado S/ 66.00. No contar filas como unidades cuando una cantidad sea mayor que uno. Formatear moneda con dos decimales y evitar errores de redondeo; para cálculos locales usar centavos enteros.

Revisión de cantidades: permitir cantidades enteras positivas en el borrador mediante controles con etiqueta por plato; no aceptar valores vacíos, cero, negativos, fraccionarios o no finitos al continuar. La exigencia de enteros es una decisión de interfaz para unidades de platos; el criterio original exige cantidades positivas. No inventar un máximo comercial ni permitir enviar un valor inválido porque el botón esté visualmente habilitado.

Vaciar elimina únicamente el borrador local y presenta el estado vacío. Por prevención de errores, solicitar confirmación mediante diálogo Material accesible; cancelar conserva la selección. Una eliminación de carrito no cancela pedidos ya registrados. No añadir eliminación individual u otras acciones sin necesidad de la referencia.

Vacío: «Tu pedido», «Encuentra tu próximo favorito.», «Aquí empieza algo rico», explicación de que aún no se añadieron platos y acción «Explorar la carta». No mostrar un envío habilitado ni un pedido de cero soles. Volver a la carta no autoriza implementar su contenido pendiente.

El importe local es estimado. Mantener el aviso «El total definitivo lo calcula el restaurante. No se cobra desde esta pantalla.». No añadir tasas, propinas, promociones, cargos de delivery o descuentos no documentados.

## 6. Modalidades y validaciones condicionales

Título «¿Cómo lo vas a disfrutar?» y apoyo «Elige la opción que va contigo.». Selector accesible de una sola modalidad, resumen de selección y acción de confirmación. Usar Angular Material y Reactive Forms; anunciar la selección mediante texto y semántica, además de color.

| Valor | Etiqueta | Condiciones y campos |
| --- | --- | --- |
| SALON | En salón | Atención física habilitada y mesa activa del mismo restaurante. Mesa obligatoria. |
| DELIVERY | Delivery | Delivery habilitado y dirección no vacía tras quitar espacios exteriores, de hasta 255 caracteres. |
| LLEVAR | Para llevar | No exigir ni enviar mesa o dirección de delivery. Conservar LLEVAR. |
| RECOGER | Recoger | No exigir ni enviar mesa o dirección de delivery. Conservar RECOGER. |

SALON: selector de mesas válidas, no un número libre aceptado como prueba de existencia. «Mesa 04 · 4 personas» es una opción de muestra, no disponibilidad real ni una reserva. No añadir requisitos de capacidad u ocupación que US11 no define.

DELIVERY: «Dirección de entrega», etiqueta persistente, contador/límite 255 y mensaje asociado. Texto del frame: «Av. Los Olivos 320, departamento 202», únicamente como muestra, sin rellenar silenciosamente la dirección del usuario en integración. No exigir geolocalización, teléfono, cobertura, pago o datos extra sin contrato.

LLEVAR: «Tu pedido se prepara para llevar.». RECOGER: indicar retiro en el local; el aviso de notificación del frame debe quedar condicionado a integración. En modo local, aclarar que los avisos son de muestra y no se enviarán.

Al cambiar modalidad, retirar validaciones y campos no aplicables del envío. No trasladar una dirección de delivery a dirección del restaurante ni conservar una mesa en un pedido para recoger. El resumen siempre debe coincidir con la modalidad seleccionada, incluso al usar atrás/adelante.

Si no hay mesas disponibles en la muestra o una modalidad está deshabilitada, comunicar la condición y permitir elegir otra modalidad válida. No seleccionar una mesa o habilitar delivery automáticamente para sortear el error.

## 7. Reglas de negocio y restricciones

1. En integración, se requiere cliente autenticado, restaurante activo y abierto, platos disponibles y selección válida. La interfaz local no simula permisos ni una sesión real.
2. El restaurante no recibe pedidos fuera de atención; la hora exacta de cierre también queda excluida. La comprobación definitiva depende de información y reloj del servidor. No fijar el horario de ejemplo como regla de todos los restaurantes.
3. Todos los platos y la mesa, si aplica, pertenecen al mismo restaurante del pedido. Un cambio de restaurante no puede mezclar selecciones de forma silenciosa.
4. Revalidar condiciones al confirmar: el plato puede agotarse o el restaurante cerrar después de abrir la pantalla. La validación del navegador no sustituye la del servidor.
5. Pedido válido: estado inicial Pendiente y pago Pendiente. No convertir la compra en Pagada ni En preparación automáticamente.
6. Total confirmado: suma de subtotales aceptados por servidor. Conservar nombres y precios de esa compra para US12, aunque la carta cambie después.
7. LLEVAR y RECOGER son valores distintos. La descripción de una ficha de interfaz usa «recojo» para llevar; prevalecen los cuatro valores del criterio funcional y del modelo existente.
8. No cobrar ni elegir método de pago desde US11. Mantener el aviso «El pago se realiza por los medios acordados con el restaurante. Esta pantalla no procesa cobros.».

Restaurante cerrado: título «Volvemos pronto», apoyo «Por ahora no podemos recibir pedidos.», mensaje «Nuestra cocina está descansando» y acción «Ver la carta». El horario 09:00–22:00 procede del frame y se identifica como muestra; en integración usar el horario real. Restaurante inactivo debe comunicar indisponibilidad sin prometer reapertura. Conservar el borrador ante rechazo.

## 8. Confirmación y estados de interacción

Flujo visual: carrito → modalidad → revisión → confirmación de muestra → detalle/seguimiento de muestra.

La acción del frame es «Enviar pedido». Al no existir servicio conectado, usar «Ver confirmación de muestra» o equivalente inequívoco y mostrar un aviso cercano «Vista de muestra. No se enviará un pedido al restaurante.». Validar la selección antes de abrirla. La confirmación debe decir que es una muestra; no anunciar un registro exitoso, ingreso a cocina o notificación real.

En integración posterior, restaurar «Enviar pedido», bloquear activaciones repetidas durante la solicitud y mostrar confirmación solo tras respuesta válida. No repetir automáticamente una creación fallida o con resultado incierto; confirmar el mecanismo contra duplicados con el backend. Ante error conservar el borrador y permitir corregir/revisar sin inventar un pedido confirmado.

Confirmación de referencia: pedido #1042, modalidad elegida, total y pago pendiente; acción «Seguir mi pedido». El número es un ejemplo, no un identificador generado localmente para simular una transacción. En integración todos estos datos deben proceder de la misma respuesta de registro.

Estados que debe permitir verificar la presentación:
- Carga de condiciones/mesas: mensaje perceptible y confirmación bloqueada hasta contar con datos válidos.
- Listo para revisar: selección y modalidad coherentes.
- Vacío o cantidad inválida: mensaje y bloqueo de avance.
- Dirección/mesa inválida o modalidad no habilitada: error concreto junto al control y resumen cuando proceda.
- Plato agotado/ajeno, cerrado o inactivo: rechazo sin limpiar el borrador ni mostrar éxito.
- Error de consulta o envío: explicación y recuperación; sin datos de otra operación.
- Confirmación: exclusivamente de muestra en la fase visual o respaldada por respuesta real en la fase integrada.

Los estados se prueban mediante entradas/fixtures; no añadir controles de producto para activar restricciones artificialmente.

## 9. Continuidad con US12 y US13

El borrador conserva restaurante, líneas, cantidades y modalidad al navegar entre carrito y entrega. Puede mantenerse en memoria durante el recorrido; no usar localStorage ni guardar dirección en URL. Documentar qué sucede al recargar: si no hay contexto, mostrar vacío/aviso o cargar explícitamente una muestra identificada, sin pretender restaurar un pedido real.

La confirmación y «Seguir mi pedido» deben conservar el mismo snapshot y mostrar estado Pendiente y pago Pendiente. No enlazar una confirmación SALON/DELIVERY a la muestra fija RECOGER ni reutilizar el pago Yape Pagado de US12 como resultado de una compra nueva.

La base actual de US12/US13 usa SAMPLE_ORDER inmutable, estado En preparación en la entrada canónica y una muestra de pago registrado. Antes de implementar la continuidad, añadir únicamente el mecanismo local necesario para transportar un contexto de muestra consistente, sin mutar esas constantes ni romper las visitas directas existentes. Si se usa history.state, validar su forma y tratarlo como presentación no confiable; nunca como prueba de identidad, autorización o creación de pedido.

El snapshot confirmado debe quedar separado del borrador: editar o vaciar un nuevo carrito no modifica un pedido consultado. Mantener el contrato de OrderSnapshot y Modality existente cuando sea adecuado; separar campos del borrador, estado de consulta y datos confirmados. El retorno pago → detalle debe conservar identidad, modalidad y estado de esa misma muestra.

No reconstruir seguimiento ni habilitar controles de cocina para completar este enlace. Las rutas directas y variantes de US12/US13 deben seguir funcionando.

## 10. Estilo, responsive y accesibilidad

Aplicar SPEC común, AGENTS.md y variables --rp-* del CSS global. Usar el estilo de aplicación, no el de marketing de la landing. Primary #1B7954, azul #15324E, superficies y texto conforme a los tokens; tipografía compartida y fuentes locales existentes verificadas antes de añadir recursos. Los tamaños y composición específicos se obtienen del contexto de los frames.

Desktop: tabla/revisión y resumen con jerarquía clara; mobile: apilar bloques y adaptar el selector de modalidades sin recortar etiquetas. La tabla puede disponer de scroll interno accesible si lo necesita; no permitir desbordamiento horizontal de toda la página ni ocultarlo globalmente.

Conservar los títulos y ayudas del diseño; omitir códigos RP / 014–021 y el perfil ficticio «Ana Pérez». Reutilizar la presentación «Vista de muestra / Sin sesión conectada» donde corresponda. No aparentar cierre de sesión real.

Un h1 por vista, regiones y tabla semánticas, encabezados identificados, campos etiquetados, errores asociados mediante aria-describedby y aria-invalid, foco visible y mensajes dinámicos moderados con aria-live. Selector de modalidad operable por teclado y con selección perceptible. Diálogo de vaciado con foco inicial/retorno correctos y cierre por teclado.

Botones con nombre específico, áreas táctiles adecuadas y tipos button/submit explícitos. No depender exclusivamente de color ni de placeholders. Respetar movimiento reducido; no introducir animaciones o recursos externos sin necesidad.

Revisar 1440 y 390 px contra Figma; añadir 320, 768 y 1280 px, zoom 200 %, dirección de 255 caracteres, nombres largos de platos/restaurante y cantidades de varios dígitos.

## 11. Heurísticas de usabilidad

Base: [diez heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), ya consultadas para el proyecto.

| Heurística | Aplicación verificable en US11 |
| --- | --- |
| Visibilidad del estado | Carrito, modalidad, validación y carga perceptibles; muestra distinguible de pedido real. |
| Correspondencia con el mundo real | Etiquetas En salón, Delivery, Para llevar y Recoger; moneda y cantidades comprensibles. |
| Control y libertad | Volver a revisar sin perder el borrador; cancelar el vaciado. |
| Consistencia y estándares | Mismos importes, datos, controles y términos entre carrito, entrega y confirmación. |
| Prevención de errores | Evitar carrito vacío, campos de otra modalidad y confirmaciones repetidas. |
| Reconocimiento antes que recuerdo | Resumen visible durante la elección, etiquetas y modalidad seleccionada explícitas. |
| Flexibilidad y eficiencia | Teclado y navegación directa; conservar la selección durante el recorrido. |
| Diseño estético y minimalista | Campos exclusivamente pertinentes; sin códigos internos ni información inventada. |
| Reconocer y recuperar errores | Explicar qué mesa, dirección o plato requiere revisión; conservar lo introducido. |
| Ayuda y documentación | Ayudas breves para modalidad, dirección y pago junto a su contexto. |

Esta tabla guía la revisión; no acredita una evaluación con usuarios ni certificación de accesibilidad.

## 12. Trazabilidad, pruebas y aceptación

| Criterio | Verificación de la primera entrega | Pendiente de integración |
| --- | --- | --- |
| US11-CA01 | Flujo válido de muestra con pedido/pago Pendiente | Sesión y registro real del pedido |
| US11-CA02 | Salón exige mesa válida de la muestra y la conserva | Mesa activa del restaurante comprobada en servidor |
| US11-CA03 | Dirección requerida, espacios, límite 255 y habilitación | Delivery habilitado y dirección guardada |
| US11-CA04 | LLEVAR/RECOGER distintos, sin campos ajenos | Conservación de enums reales |
| US11-CA05 | Bloqueo y mensajes de condiciones inválidas | Rechazo definitivo del servidor |
| US11-CA06 | Cerrado/inactivo bloquean; límite de cierre mediante fixture | Horarios, actividad y hora autoritativos |
| US11-CA07 | Fixture agotado/ajeno impide confirmación | Revalidación real de platos y pertenencia |
| US11-CA08 | Vacío, cero, negativo y valor inválido bloqueados | Rechazo del registro inválido por API |
| US11-CA09 | Subtotales/estimado coherentes y snapshot local conservado | Total y precios de compra confirmados por servidor |

Antes de cerrar implementación:
1. Ejecutar npm.cmd run check y npm.cmd run build desde el frontend; conservar los 120 escenarios.
2. Probar las ocho rutas por URL directa, recarga y navegación, además de atrás/adelante.
3. Recorrer cuatro modalidades; probar dirección vacía, espacios, 255/256 caracteres, mesa ausente/inactiva/ajena, ausencia de mesas y modalidad deshabilitada.
4. Probar cantidades, vaciado confirmado/cancelado, selección vacía, restaurante cerrado/inactivo y plato agotado/ajeno, conservando el borrador ante rechazo.
5. Verificar importes con cantidades mayores a uno y sin mezclar restaurantes; comprobar que LLEVAR no se convierte en RECOGER.
6. Verificar confirmación → detalle → pago → retorno, con datos, estado y pago de la misma muestra. Repetir rutas existentes de US12/US13 para detectar regresiones.
7. Revisar teclado, foco, etiquetas, anuncios, diálogo, anchos indicados y zoom; comparar capturas desktop/mobile.
8. Registrar errores de consola y solicitudes fallidas. Confirmar que la fase visual no envía pedidos ni ejecuta cobros.

Guardar resultados efectivamente ejecutados en una sección de ejecución posterior. No marcar las ocho entradas implementadas, S2-TSK-031 aceptada ni S2-TSK-032 terminada por crear este archivo. Al implementar, actualizar solo metadatos de avance comprobado, preservando reparto y referencias originales; no reasignar Entregado, que ya fue documentado en US13.

## 13. Commits previstos

Documento actual:
- Título: docs(us11): define el carrito y las modalidades del pedido
- Descripción: Especifica las ocho pantallas de US11 y sus nueve criterios de aceptación. Define carrito, modalidades, campos condicionales, restricciones, confirmación de muestra y continuidad con US12 y US13. Incluye referencias Figma, heurísticas y verificaciones responsive y de accesibilidad; mantiene la integración API como etapa pendiente.

Implementación posterior:
- Título: feat(us11): implementa el carrito y las modalidades del pedido
- Alcance: interfaz, validaciones y recorrido local coherente, sin registro real ni cobros.

No se crean commits, PR ni despliegues al preparar este documento.

## 14. Criterios originales completos

### US11 — Registro de pedido según modalidad de atención

Actor documentado: cliente. Páginas físicas: 50, 51, 52.

Como cliente, quiero registrar un pedido para salón, para llevar, para recoger o por delivery para solicitar los platos que deseo consumir mediante la modalidad disponible.

#### US11-CA01 — Pedido válido

Escenario 1: Pedido válido Dado que el cliente ha iniciado sesión, el restaurante está activo y abierto y los platos están disponibles. Cuando confirma una modalidad válida y uno o más platos con cantidades positivas. Entonces el sistema registra el pedido como Pendiente, calcula el total y deja su pago como Pendiente.

#### US11-CA02 — Consumo en salón

Escenario 2: Consumo en salón Dado que el restaurante tiene habilitada la atención física. Cuando el cliente elige consumo en salón e indica una mesa activa del mismo restaurante. Entonces el sistema registra el pedido asociado a esa mesa.

#### US11-CA03 — Delivery habilitado

Escenario 3: Delivery habilitado Dado que el restaurante acepta delivery. Cuando el cliente elige delivery e indica una dirección no vacía de hasta 255 caracteres. Entonces el sistema registra el pedido y conserva la dirección de entrega.

#### US11-CA04 — Pedido para llevar o recoger

Escenario 4: Pedido para llevar o recoger Dado que el restaurante está activo y abierto. Cuando el cliente elige Para llevar o Recoger y confirma una selección válida. Entonces el sistema conserva la modalidad elegida sin exigir una mesa ni una dirección de delivery.

#### US11-CA05 — Modalidad sin condiciones requeridas

Escenario 5: Modalidad sin condiciones requeridas Dado que el cliente está confirmando un pedido. Cuando elige salón sin atención física o mesa válida, o delivery no habilitado o sin dirección válida. Entonces el sistema rechaza el registro e informa qué condición no se cumple.

#### US11-CA06 — Restaurante cerrado o inactivo

Escenario 6: Restaurante cerrado o inactivo Dado que el restaurante está inactivo o la hora actual está fuera de su atención, incluida la hora de cierre. Cuando el cliente intenta registrar un pedido. Entonces el sistema informa que no puede recibir el pedido y no lo registra.

#### US11-CA07 — Plato agotado o de otro restaurante

Escenario 7: Plato agotado o de otro restaurante Dado que algún plato seleccionado ya no está disponible o pertenece a otro restaurante. Cuando el cliente confirma el pedido. Entonces el sistema rechaza el registro y solicita revisar la selección.

#### US11-CA08 — Pedido vacío o cantidad inválida

Escenario 8: Pedido vacío o cantidad inválida Dado que el cliente no seleccionó platos o indicó una cantidad menor que uno. Cuando intenta confirmar el pedido. Entonces el sistema solicita al menos un plato con una cantidad válida y no registra la orden.

#### US11-CA09 — Cálculo del importe

Escenario 9: Cálculo del importe Dado que el cliente confirma un pedido válido. Cuando el sistema registra los platos y sus cantidades. Entonces el total corresponde a la suma de sus subtotales y se conservan los nombres y precios utilizados en esa compra.


## 15. Ejecución de US11 — 01/11/2026

Implementación visual y de navegación en feature/cliente-pedido. Se preservaron las rutas hijas existentes de /cliente, sus cargadores y variantes ?vista=. No se implementaron los módulos de carta, cocina o reservas.

Cambios:
- Ocho entradas de pantalla con componentes standalone y archivos .ts/.html/.css separados.
- Componentes reutilizables CarritoView, CarritoTable y VaciarDialog; estado de borrador local CarritoStore.
- Angular Material para tablas, tarjetas, botones, campos, selector de mesa, modalidad, diálogo y carga. Reactive Forms para cantidades, mesa y dirección.
- Cantidades enteras positivas, importes en centavos, conteo de unidades y vaciado con confirmación y retorno del foco.
- Cuatro modalidades con campos condicionales y rechazos locales de condiciones inválidas. No se calcula un horario real ni se consulta disponibilidad del servidor.
- Confirmación explícitamente de muestra; apertura directa sin contexto comunica que no existe confirmación en ese recorrido.
- Contexto de presentación en memoria que lleva el snapshot a detalle, seguimiento y pago; pedido y pago Pendiente, conservando modalidad, mesa/dirección y cantidades. El contexto no concede permisos.
- Ajuste del conteo de US12 para sumar unidades y del enlace a pago para respetar Pendiente; las visitas directas anteriores conservan sus muestras.
- Ocho metadatos de interfaz actualizados sin cambiar responsables, rutas, identificadores o asociación original de Entregado.
- Recurso de marca descargado desde Figma a public/assets/carrito/brand-reference.png. Se conserva su slot de 43 × 43 px y la superposición blanca del diseño. Las fuentes locales existentes se reutilizan.

Se obtuvieron contextos de diseño y capturas de las ocho pantallas desktop/mobile mediante MCP oficial de Figma. Se compararon capturas de aplicación con las referencias. La presentación conserva estructura y estilo de aplicación y añade controles, ayudas y aclaraciones necesarias para la muestra; no se afirma equivalencia exacta de píxeles.

### Comprobaciones ejecutadas

- Chequeo estructural correcto: 120 escenarios conservados; 14 interfaces declaradas y 106 pendientes. No acredita aceptación funcional.
- Compilación de producción correcta y git diff --check sin errores.
- Chrome local: 40 combinaciones de ocho rutas por 1440, 390, 320, 768 y 1280 px; sin desbordamiento de página y recurso local cargado a 43 × 43 px.
- Ocho rutas con recarga; confirmación directa sin contexto no anuncia registro exitoso.
- Cantidades vacías, cero, negativas y fraccionarias rechazadas; cálculo 2 × 38 + 28 = S/ 104.00 y conteo de tres unidades comprobados. Escritura de varios dígitos conserva foco.
- Mesa requerida y mesa activa del mismo restaurante; fixtures de mesa inactiva/ajena y salón deshabilitado rechazados.
- Dirección vacía, espacios y 256 caracteres rechazados; 255 caracteres aceptados como entrada. Delivery deshabilitado rechazado.
- Restaurante cerrado/inactivo y plato agotado/ajeno rechazados localmente, conservando el borrador. La hora exacta de cierre queda pendiente de integración y contrato horario.
- SALON conserva mesa; LLEVAR/RECOGER mantienen valores distintos y no envían mesa ni dirección de delivery en el snapshot.
- Vaciado cancelado con Escape conserva cantidades; confirmado muestra vacío y devuelve foco al encabezado. Editar/vaciar el borrador no altera el snapshot ya confirmado.
- Delivery con S/ 104.00 llega a detalle y consulta de pago Pendiente sin heredar Yape ni pago registrado; retorno conserva datos y estado.
- Atrás/adelante conserva modalidad y dirección dentro del recorrido. Recargar reinicia la muestra local; no existe persistencia de operaciones.
- Carga, error y recuperación mediante «Reabrir muestra» comprobados; corregir campos retira mensajes anteriores.
- Teclado, salto al contenido, selector con flechas, diálogo, zoom 200 % y textos largos verificados.
- Regresión US12/US13: cinco estados en cinco anchos, tres variantes con recarga, retorno desde pago, errores y no encontrado; sin alterar datos, importes o progreso.
- Sin errores de ejecución, solicitudes fallidas ni solicitudes de creación/cobro/API en las comprobaciones.

Los guiones locales, resultados y capturas están en us11-implementation, en la carpeta local de trabajo fuera del repositorio. La regresión existente se ejecutó desde us13-implementation. No se añadieron dependencias ni herramientas de pruebas al producto.

S2-TSK-032 sigue pendiente: faltan autenticación, validación autoritativa, registro real, total confirmado por API y aceptación integrada. Esta entrega no acredita cumplimiento integrado de los nueve criterios. No se creó commit, PR ni despliegue.
