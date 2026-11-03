# SPEC — US15: tablero y cola priorizada de cocina

Revisión documental: 02/11/2026. Estado: frontend de muestra incorporado en develop; aceptación del equipo pendiente. Rama original: feature/operacion-cocina. Alineación documental: docs/alineacion-specs.

Las secciones de ejecución fechadas conservan evidencia histórica. El estado actual se contrasta con develop, base 3685d07; no repetir como pendientes las etapas ya integradas. Referencias comprobadas: [registro Figma](../../REFERENCIAS-FIGMA.md).

Leer el [SPEC común](../../../SPEC.md), [AGENTS.md](../../../AGENTS.md) y el [reparto de mantenimiento](../../ASIGNACION-EQUIPO.md). Este documento define US15. Los cambios de estado de [US19](../us19/SPEC.md) ya están integrados; conservar la consulta activa de cocina al verificar sus transiciones.

## 1. Objetivo y secuencia

Como dueño o administrador del restaurante, quiero consultar los pedidos pendientes y en preparación ordenados por prioridad para coordinar el trabajo de cocina según su complejidad y tiempo requerido.

Secuencia histórica de la primera entrega:
1. SPEC de US15 y commit documental.
2. Implementación de US15 y commit de código.
3. SPEC independiente de US19 y commit documental.
4. Implementación de US19 y commit de código.

Cada entrega debe ser revisable por sí sola. No incluir transiciones de US19 en el primer commit de implementación ni reunir ambas historias bajo un único SPEC. No se crean commits automáticamente.

## 2. Alcance y tareas originales

| Tarea | Alcance original |
| --- | --- |
| S2-TSK-035 | Construir el tablero de cocina con pedidos pendientes y en preparación. |
| S2-TSK-036 | Integrar la cola priorizada devuelta por la API y conservar ese orden al actualizar el tablero. |

Primera implementación: interfaz responsive de consulta con muestras identificadas, cola tabular, tablero por estado y detalle operativo de lectura necesario para «Consultar pedido». Representar cargas, errores y vacío; comprobar prioridades mediante fixtures. S2-TSK-036 queda pendiente de integración autorizada.

Incluye:
- Cola exclusiva del restaurante de muestra y estados Pendiente/En preparación.
- Información relevante de pedido, modalidad, contenido y prioridad.
- Regla de prioridad por complejidad máxima, tiempo máximo, antigüedad e identificador estable.
- Conteos derivados de la misma colección y selección coherente entre cola, tablero y detalle.
- Nueva consulta representada mediante actualización de entradas de prueba.
- Presentación sin resultados, carga, error y selección inexistente.
- Rutas hijas, componentes standalone, Angular Material, responsive y accesibilidad.

Excluye cambios de estado, envío a cocina, entrega, cancelación, edición, cobros, autenticación, permisos reales, notificaciones y conexión automática con el carrito del cliente. No implementar dashboard, carta, reservas, mesas, reportes ni otros módulos por utilizar su navegación.

No añadir polling, WebSocket, drag and drop, búsqueda, filtros, paginación o orden manual sin requisito o necesidad comprobada. Una columna de preparación no autoriza mover comandas entre estados.

## 3. Fuentes y estado comprobado

Fuente funcional: report_1ACC0236-20262.pdf, US15, páginas físicas 57–59. Los siete criterios originales se reproducen íntegros en la sección 14. Fichas PDF-UI-067 a PDF-UI-069, páginas 147–150.

Fuente visual: [Figma original autorizado](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92), página RestoPilot 5:92, sección Pedidos operación 95:11.

| Pantalla | Desktop | Mobile |
| --- | --- | --- |
| op-pedidos | 89:36315 · 1440 × 900 | 89:36485 · 390 × 1004 |
| op-cocina | 89:12661 · 1440 × 967.10 | 89:12859 · 390 × 1820.22 |
| op-pedido-detalle, apoyo de lectura | 89:29812 · 1440 × 900 | 89:29989 · 390 × 1318 |

La preparación inicial del SPEC consultó estructura, identificadores, dimensiones y textos desktop en la copia mediante MCP; esa etapa no comparó la aplicación. La sección 15 registra la implementación posterior. Ante cambios visuales, volver a contrastar controles, composición y recursos desktop/mobile con el original.

La rama actual ya es feature/operacion-cocina y estaba limpia al iniciar este SPEC. Las tres entradas conservaban su estructura pendiente al preparar el documento; la ejecución posterior se registra en la sección 15. AdminLayout contiene el router-outlet y tiene pendiente su marco visual. No atribuir una interfaz terminada a la existencia del layout.

### Diferencias que debe resolver la implementación

- El tablero muestra «Entrega por ID · ejemplo» con #1039. Listo, Entregado y Cancelado quedan fuera de la cola de US15. No incluir esa tarjeta como tercer grupo de trabajo activo ni obtener pedidos listos a partir de la cola; su consulta y acciones corresponden al alcance posterior de US19.
- #1041 y #1040 tienen distinto estado/modalidad en cola y tablero. Utilizar una única colección de muestra para ambas vistas y su detalle; el mismo identificador siempre conserva los mismos datos.
- El tablero dibuja un único plato en cada tarjeta mientras el detalle #1042 contiene dos. Representar todas las líneas o un resumen explícito que permita consultar el contenido completo; calcular prioridades con todas las líneas.
- Figma incluye botones «Iniciar preparación» y «Marcar listo». Son referencia para US19. Durante US15 sustituirlos por «Consultar pedido» o información de alcance pendiente, sin controles operativos activos ni botones que aparenten enviar cambios.
- El texto del frame afirma qué expone «la API actual». Es contenido de la referencia, no evidencia de un contrato consultado ni instrucción para integrar. Expresar en producto que se muestra la cola activa; no mostrar detalles de endpoints a sus usuarios.

## 4. Rutas hijas y archivos

| Vista | Ruta existente | Carpeta |
| --- | --- | --- |
| Cola tabular | /operacion/pedidos | src/app/pages/operacion/op-pedidos/ |
| Tablero de cocina | /operacion/cocina | src/app/pages/operacion/op-cocina/ |
| Detalle de lectura | /operacion/pedido | src/app/pages/operacion/op-pedido-detalle/ |

Conservar src/app/app.routes.ts con loadChildren para operacion y las rutas children de src/app/routes/operacion/operacion.routes.ts bajo AdminLayout. Mantener router-outlet, ScreenHost y cargadores existentes. No crear rutas raíz paralelas para cocina ni otra aplicación Angular.

Cada entrada mantiene su clase, selector y archivos .ts/.html/.css. Reutilizar componentes adecuados y, si resulta necesario, añadir un área local cocina-ui para modelo, datos de muestra, tablero, cola y detalle. Separar responsabilidades; no duplicar la misma lógica de prioridad y selección en cada pantalla.

El detalle ya se asocia a US12 y US15 en el manifiesto. US15 solo incorpora la lectura necesaria para identificar la comanda; no reconstruye US12 de cliente ni asume sus permisos. Mantener el reparto y las asociaciones originales.

No inventar parámetros de identidad ni endpoints. En la muestra, un servicio local puede conservar la selección por identificador reconocido y el origen cola/tablero; history.state solo podrá referenciar entradas de esa colección. No confiar en snapshots arbitrarios recibidos por navegación ni usarla como autorización. En integración confirmar identificación real con el contrato.

Las rutas directas deben mostrar una muestra identificada o ausencia de selección recuperable. Si se seleccionó #1040, no mostrar silenciosamente el detalle fijo #1042. Volver conserva el origen y el orden; recargar puede reiniciar la muestra, pero debe explicarse cuando corresponda.

## 5. Cola tabular

Título «El servicio en movimiento», apoyo «La cola de trabajo del restaurante.» y sección «Cola del restaurante».

Tabla Material con columnas Pedido, Cliente, Modalidad, Estado, Importe y acceso a consulta. Usar texto visible Pendiente y En preparación; el color no sustituye el estado. Distinguir la modalidad de la mesa: por ejemplo «En salón · Mesa 04», evitando que «Mesa 04» se convierta en un enum de modalidad.

Una fila por pedido, claves estables por identificador y orden global de prioridad. No convertir la tabla en historial completo ni incluir operaciones finalizadas. Mostrar información relevante realmente disponible y de muestra; no inventar clientes o datos personales como si fueran cuentas reales. Los nombres presentes en fixtures deben identificarse como ejemplos.

El importe representa el total registrado del pedido, no la suma con precios vigentes de la carta. No añadir botón de cobro ni recalcular una compra por reordenar la cola.

El enlace de cada fila tiene nombre accesible específico, como «Consultar pedido #1042», y conserva el pedido seleccionado. Puede usar «Consultar» como texto visible; no anunciar edición operativa si solo ofrece lectura.

## 6. Tablero de cocina

Título «El ritmo de la cocina» y apoyo «Menos ruido. Más coordinación.».

Dos grupos de trabajo: «Pendientes» y «En preparación», con cantidad calculada desde los pedidos mostrados. En desktop disponer las columnas según la referencia; en mobile apilar grupos preservando su encabezado y orden. No usar un componente de arrastre para simular cambios de estado.

Cada tarjeta presenta identificador, complejidad máxima Alta/Media/Baja, fecha/hora o antigüedad de muestra, modalidad y mesa/dirección solo si corresponde, líneas o resumen claramente indicado y acceso a lectura. Los minutos de preparación describen los platos o su máximo; no son una promesa de entrega ni un contador calculado desde una hora ficticia.

Conservar el orden relativo de la cola al agrupar por estado: filtrar cada columna sobre la colección ya priorizada. No reordenar alfabéticamente, por total, pago, modalidad o nombre del cliente.

Mostrar explicación breve de prioridad: «Primero mayor complejidad; después mayor tiempo de preparación y mayor antigüedad.». Mantener distinguible la prioridad del estado: Alta no implica En preparación.

Si un grupo queda vacío pero el otro tiene pedidos, mostrar un mensaje propio del grupo y conteo cero. El vacío global se reserva para cuando no exista ningún pedido activo.

## 7. Reglas de prioridad y modelo de presentación

Por pedido calcular sobre todas sus líneas:
1. Complejidad máxima: Alta antes que Media, y Media antes que Baja.
2. Si empata, mayor tiempo de preparación de cualquiera de sus platos primero. No sumar tiempos ni multiplicarlos por cantidades.
3. Si empata, pedido creado antes primero.
4. Si también coincide, orden estable por identificador. Para fixtures con IDs numéricos se propone ascendente numérico, como decisión local de desempate; la dirección definitiva se confirma con la API. Evitar ordenar números como cadenas.

No limitar el cálculo del tiempo máximo a los platos con complejidad máxima: ambos máximos se evalúan sobre todas las líneas según los criterios. Una cantidad mayor no aumenta automáticamente complejidad o tiempo.

Modelo local mínimo: identificador de pedido y restaurante, estado, fecha de creación comparable, modalidad y datos condicionales, cliente de muestra si existe, líneas con nombre/cantidad/precio registrado/complejidad/minutos de preparación y total registrado. Separar datos del negocio de estado de consulta y origen de navegación.

Utilizar timestamps comparables y representación horaria legible; no ordenar por textos «Hace 8 min» o fechas formateadas. Los enums se normalizan solo mediante un mapeo conocido; no adivinar estados o prioridad si un dato falta. Una respuesta incompleta debe comunicar su limitación y no presentar un orden recalculado como confirmado.

En la fase local puede existir una función pura de prioridad y una colección de fixtures para verificar los criterios. No mutar el array original ni perder empates al ordenar.

### Ejemplo de orden esperado para pruebas

Todos los registros siguientes pertenecen al mismo restaurante y tienen estado activo; son fixtures, no datos de operaciones reales.

| Pedido | Complejidad máxima | Tiempo máximo | Creación | Orden esperado |
| --- | --- | --- | --- | --- |
| #201 | Alta | 20 min | 13:10 | 1 |
| #202 | Alta | 20 min | 13:10 | 2 |
| #203 | Alta | 20 min | 13:15 | 3 |
| #204 | Alta | 15 min | 13:00 | 4 |
| #205 | Media | 30 min | 12:50 | 5 |
| #206 | Baja | 40 min | 12:40 | 6 |

Añadir un pedido con dos líneas cuyas complejidad máxima y tiempo máximo correspondan a platos distintos para detectar un cálculo incorrecto. Añadir registros de otro restaurante y estados Listo/Entregado/Cancelado que deben quedar fuera del conjunto activo local.

## 8. Consulta posterior e integración futura

En muestras, actualizar entradas puede representar un pedido nuevo, uno que sale de la cola o un cambio en los datos de prueba. Mostrar estos resultados como actualización local, sin afirmar que llegan de cocina o del servidor. No añadir botones de producto para fabricar pedidos, modificar estados o cambiar prioridades.

En integración, el restaurante y permisos proceden del contexto autorizado. La API valida pertenencia y devuelve la cola priorizada; conservar su orden al consultar de nuevo. No aplicar un sort local sobre la respuesta del servidor que altere la prioridad recibida.

Antes de conectar, confirmar contrato, mecanismo de identidad, enums, campos, fecha/zona horaria, criterios de desempate, estados de error y estrategia de actualización. No asumir que existe un endpoint para historial o para pedidos listos.

Si se incorpora un nuevo pedido, aparece donde lo ubique la respuesta; si uno pasó a Listo, Entregado o Cancelado, deja la cola activa. Esta lectura no ejecuta la transición. Filtrar localmente una muestra no demuestra aislamiento real entre restaurantes.

Una respuesta con datos inesperados o ajenos requiere tratamiento de error y revisión de contrato; nunca mostrarlos para completar una tabla. La autorización y la verificación definitiva corresponden al servidor.

## 9. Estados y recuperación

- Carga inicial: mensaje accesible, sin pedidos ni prioridades fingidos.
- Resultado: colección y conteos coherentes en cola/tablero.
- Vacío global: «No hay pedidos para preparar» y acceso de navegación existente, sin comandas inventadas.
- Grupo vacío: mensaje específico dentro de su columna.
- Error inicial: no exponer otra colección como resultado; permitir reabrir la muestra o reintentar consulta cuando haya integración.
- Error al actualizar: si se conserva la última lectura, identificarla como anterior y comunicar que no pudo actualizarse; no anunciar vigencia nueva.
- Selección inexistente o ajena: mensaje sin detalle de otra comanda; retorno a cola/tablero.
- Contexto perdido por recarga: muestra explícita o falta de selección, sin indicar pedido registrado o permiso válido.

Los errores no deben destruir una selección válida ni reordenar datos silenciosamente. Al cambiar de fila se cambia el pedido completo, sin conservar mesa, cliente o pago de la fila anterior.

## 10. Detalle de lectura y frontera con US19

El detalle operativo muestra el pedido seleccionado, estado, platos, cantidades, precios históricos, subtotales, total, modalidad, hora, datos de cliente disponibles y estado de pago registrado. Mesa en SALON o dirección en DELIVERY solo si corresponde. El pago no autoriza inferir entrega y la prioridad no altera importes.

Mantener el identificador y el origen al volver a la cola o tablero. Datos de muestra coherentes con la tarjeta/fila; no compartir automáticamente el snapshot del carrito de cliente como si ya estuviera registrado en servidor.

En esta historia no habilitar «Iniciar preparación», «Marcar listo», «Registrar entrega», «Registrar pago», «Editar contenido» o «Cancelar pedido». Las tres primeras corresponden a US19; las restantes a otras historias. Evitar botones sin respuesta: usar consulta y retornos reales dentro del alcance.

Durante la primera entrega, US15 debía compilar sin dependencias de US19 todavía ausentes. Actualmente ambas están integradas: US19 aporta transiciones válidas Pendiente → En preparación → Listo → Entregado, confirmaciones y rechazos sin redefinir las reglas de la cola. La columna de Listo y los pedidos finalizados no pasan a pertenecer a la consulta activa de US15 por esa ampliación.

## 11. Estilo, componentes y accesibilidad

Mantener Angular 22, componentes standalone y .ts/.html/.css separados. Reutilizar layouts y componentes adecuados. Angular Material para tabla, tarjetas, botones, carga y controles que sean necesarios; Reactive Forms si se introduce un formulario autorizado. @if/@for con track y routerLink para enlaces internos. No añadir dependencias.

La composición del marco operativo procede de Figma y difiere del encabezado del cliente. Reutilizar AdminLayout si se incorpora únicamente el marco necesario al alcance; no implementar todo el panel administrativo. No atribuir a una persona ficticia una sesión de administrador: usar «Vista de muestra / Sin sesión conectada» e identificar el restaurante de ejemplo.

Usar tokens --rp-* y el sistema de aplicación del SPEC común. Primary #1B7954, azul #15324E, tipografía y superficies compartidas; estilos específicos locales. Revisar assets y fuentes existentes antes de incorporar recursos. Evitar selectores internos de Material, ::ng-deep y ocultar overflow global.

Un h1 por vista; encabezados claros para grupos, tabla semántica y nombres accesibles de consulta por pedido. Estado y complejidad mediante texto además de color. Tarjetas sin acción no se presentan como botones. Foco visible y retorno al contexto de consulta; mensajes de carga/error y resultados con anuncios moderados, sin releer todo el tablero.

Desktop/mobile de referencia 1440/390; comprobar también 320/768/1280 px, zoom 200 %, nombres largos, múltiples líneas y cantidades de varios dígitos. Tabla con scroll interno accesible cuando sea necesario, nunca toda la página. Navegación lateral adaptada a mobile con control de teclado y foco si el marco usa un panel desplegable. Respetar movimiento reducido.

Heurísticas de [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), ya consultadas para el proyecto: estado de consulta visible, términos familiares, consistencia cola/tablero, reconocimiento de prioridad, prevención de cambios involuntarios, recuperación de error, retorno controlado y ayudas breves. No afirmar evaluación con usuarios por aplicar esta guía.

## 12. Trazabilidad y verificación

| Criterio | Evidencia visual/local prevista | Pendiente de integración |
| --- | --- | --- |
| US15-CA01 | Solo fixtures del restaurante y estados activos; mismas identidades en tabla/tablero/detalle | Aislamiento y consulta autorizada |
| US15-CA02 | Alta > Media > Baja usando todas las líneas | Prioridad del servidor |
| US15-CA03 | Empate resuelto por mayor tiempo máximo | Campos y orden confirmados por API |
| US15-CA04 | Fecha ascendente y desempate estable por identificador | Desempate autoritativo del servidor |
| US15-CA05 | Nueva entrada local aparece en el lugar esperado | Nueva consulta incorpora pedido real |
| US15-CA06 | Entrada finalizada sale del conjunto activo local | Respuesta actualizada tras transición real |
| US15-CA07 | Vacío global y por grupo sin pedidos ficticios | Respuesta vacía real |

Antes de cerrar implementación:
1. npm.cmd run check y npm.cmd run build; conservar los 120 escenarios y el reparto.
2. Probar prioridad con varias líneas, empates de complejidad, tiempo, fecha e ID numérico; mantener entrada original y resultado estable.
3. Probar un pedido nuevo, salida por cada estado terminal/por Listo, exclusión de otro restaurante y vacío global/parcial.
4. Verificar que agrupar no cambia el orden relativo, conteos o identidades; preservar totales históricos y nombres de compra.
5. Abrir las tres rutas, recargar y navegar entre ellas; consultar al menos dos pedidos distintos y regresar a su origen sin sustituirlos por #1042.
6. Probar carga, error inicial, error de actualización, recuperación y selección inexistente sin fuga de datos.
7. Revisar los cinco anchos, zoom, teclado, foco, panel mobile si existe, textos largos y todos los assets locales contra Figma.
8. Confirmar que ningún control realiza transiciones, cobros o cancelación; no hay API ni autenticación simulada en la fase visual.
9. Registrar capturas y resultados efectivamente ejecutados; compilar no acredita integración ni aceptación.

Para este commit documental: verificar siete criterios íntegros, enlaces locales, rutas existentes, alcance separado de US19 y chequeo estructural. No hace falta compilar mientras no cambie código/configuración. No marcar pantallas implementadas ni tareas Done por preparar el SPEC.

## 13. Commits previstos

Documento actual:
- Título: docs(us15): define el tablero y la cola de cocina
- Descripción: Especifica la consulta priorizada de cocina y sus siete criterios de aceptación. Define cola, tablero, detalle de lectura, prioridades, estados de consulta, rutas hijas, Angular Material y verificación responsive y de accesibilidad. Separa las transiciones de US19 y mantiene la integración API pendiente.

Implementación posterior:
- Título: feat(us15): implementa el tablero y la cola de cocina
- Alcance: consulta visual y navegación con muestras coherentes; sin ejecutar transiciones ni integrar servicios.

No crear commit, push, PR o despliegue al preparar este documento. Seleccionar únicamente los archivos documentales de US15 para su commit.

## 14. Criterios originales completos

### US15 — Consulta priorizada de pedidos de cocina

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 57, 58, 59.

Como dueño o administrador del restaurante, quiero consultar los pedidos pendientes y en preparación ordenados por prioridad para coordinar el trabajo de cocina según su complejidad y tiempo requerido.

#### US15-CA01 — Cola de trabajo

Escenario 1: Cola de trabajo Dado que el restaurante tiene pedidos Pendientes o En preparación. Cuando el usuario consulta la cola de cocina. Entonces el sistema muestra únicamente esos pedidos del restaurante que gestiona, junto con sus datos relevantes.

#### US15-CA02 — Prioridad por complejidad

Escenario 2: Prioridad por complejidad Dado que existen pedidos con platos de distintas complejidades. Cuando el usuario consulta la cola. Entonces el sistema prioriza Alta sobre Media y Media sobre Baja, considerando la mayor complejidad presente en cada pedido.

#### US15-CA03 — Desempate por preparación

Escenario 3: Desempate por preparación Dado que dos pedidos tienen la misma complejidad máxima. Cuando el usuario consulta su orden de atención. Entonces el sistema prioriza el pedido cuyo plato requiere el mayor tiempo de preparación.

#### US15-CA04 — Desempate por antigüedad

Escenario 4: Desempate por antigüedad Dado que dos pedidos tienen igual complejidad máxima y tiempo máximo de preparación. Cuando el usuario consulta la cola. Entonces el sistema muestra primero el pedido creado antes; si también coinciden, conserva un orden estable por su identificador.

#### US15-CA05 — Nueva consulta de prioridades

Escenario 5: Nueva consulta de prioridades Dado que se registró un nuevo pedido válido. Cuando el usuario vuelve a consultar la cola. Entonces el sistema lo incluye en el lugar que corresponde a las reglas de prioridad.

#### US15-CA06 — Pedido que sale de cocina

Escenario 6: Pedido que sale de cocina Dado que un pedido pasó a Listo, Entregado o Cancelado. Cuando el usuario vuelve a consultar la cola. Entonces el sistema deja de incluirlo entre los pedidos pendientes y en preparación.

#### US15-CA07 — Cola sin pedidos

Escenario 7: Cola sin pedidos Dado que el restaurante no tiene pedidos Pendientes ni En preparación. Cuando el usuario consulta la cola. Entonces el sistema informa que no hay pedidos para preparar.


## 15. Ejecución de US15 — 01/11/2026

Implementación en feature/operacion-cocina. Se mantuvieron las rutas hijas existentes bajo AdminLayout, su router-outlet, ScreenHost y cargadores. No se alteró el marco de otras páginas operativas ni las pantallas del cliente.

Cambios:
- Entradas op-pedidos, op-cocina y op-pedido-detalle con componentes standalone y .ts/.html/.css separados.
- Área local cocina-ui con CocinaShell, CocinaView, CocinaCard, modelo de prioridad y CocinaStore de presentación.
- Angular Material para tablas, tarjetas, botones y carga. La consulta no requiere formularios.
- Colección única de tres pedidos de muestra; mismos estados, platos, precios, clientes y modalidades en cola, tablero y detalle.
- Prioridad local por complejidad máxima, tiempo máximo sobre todas las líneas, antigüedad e ID numérico estable. No se muta la colección original al ordenar.
- Tablero con solo Pendientes y En preparación, conteos derivados y todas las líneas de cada pedido. Listo, Entregado y Cancelado quedan fuera.
- Selección mediante identificador local reconocido y origen de navegación; detalle de otro pedido no se sustituye por #1042. Retorno conserva origen y foco del enlace de consulta.
- Carga, error inicial, datos incompletos, lectura anterior identificada, vacío por grupo/global y selección inexistente/ajena.
- Marco operativo local con menú móvil desplegable en flujo normal, teclado, Escape y retorno del foco; corrige solapamientos del frame mobile.
- Reutilización del recurso exacto 5815d ya disponible en public/assets/carrito/brand-reference.png y fuentes locales de pedido. Slot de marca 48 × 48 px y superposición blanca conforme al diseño.
- Metadatos de consulta de tres escenarios actualizados; responsables, rutas, asociaciones originales y los 120 identificadores conservados.

No se habilitaron botones de preparación, listo, entrega, pago, edición o cancelación. Tampoco se añadieron operaciones de autenticación, API, WebSocket o avisos. La muestra operativa se mantiene independiente del borrador del cliente.

Se obtuvieron contextos y capturas desktop/mobile de las tres pantallas mediante MCP oficial de Figma. Se revisaron capturas locales de cola, tablero y detalle seleccionado. Las correcciones funcionales previstas por este SPEC y las ayudas de muestra explican las diferencias con los frames; no se afirma igualdad exacta de píxeles.

### Pruebas ejecutadas

- node --test scripts/cocina-priority.test.mjs: ocho pruebas correctas. Cubren las cuatro claves de prioridad, máximos de platos distintos, tiempos sin multiplicar por cantidades, IDs numéricos, instantes con offsets, nueva entrada, exclusión de estados/restaurante, agrupación estable, datos incompletos, vacío y conservación de la entrada.
- node scripts/check-structure.mjs: correcto; 120 escenarios, 17 interfaces declaradas y 103 pendientes. El chequeo no acredita integración ni aceptación.
- node node_modules/@angular/cli/bin/ng.js build: compilación de producción correcta.
- git diff --check: sin errores.
- Chrome local: 15 combinaciones de tres rutas por 1440, 390, 320, 768 y 1280 px, sin desbordamiento horizontal de página; recurso local cargado a 48 × 48 px en todas ellas.
- Tres pedidos distintos consultados desde tablero, con identidad, contenido, modalidad, pago y total coherentes. Recarga del detalle y retorno al enlace del mismo pedido comprobados.
- Cola → detalle → cola conserva orden. Acceso directo sin selección ofrece recuperación, sin mostrar otro pedido.
- Nueva entrada de prueba se inserta en su prioridad; entrada de otro restaurante no se muestra. Cambiar fixtures a Listo, Entregado o Cancelado los retira del conjunto activo.
- Vacío global y de un solo grupo, carga, error inicial, recuperación y datos incompletos comprobados sin tabla engañosa.
- Error de actualización conserva explícitamente la lectura anterior; reabrir muestra refleja las entradas actuales locales, sin fingir una respuesta de servidor.
- Selección inexistente/ajena sin tabla ni datos de servicio de otra comanda.
- Menú móvil con apertura, Escape, devolución de foco y navegación a cocina. Salto al contenido, textos largos y zoom 200 % comprobados.
- Sin errores de ejecución, solicitudes fallidas, peticiones API ni solicitudes de operaciones en la verificación.
- Las tres rutas admiten recarga; las variantes de US19 no fueron implementadas ni declaradas terminadas.

Las pruebas de prioridad están versionadas en scripts/cocina-priority.test.mjs. El guion de navegador, verification.json y capturas están en la carpeta local us15-implementation, fuera del repositorio. No se añadieron dependencias ni se cambió package.json.

| Criterio | Evidencia local | Límite |
| --- | --- | --- |
| US15-CA01 | Solo pedidos activos propios en fixtures y navegación consistente | No acredita autorización real |
| US15-CA02 | Complejidad máxima sobre todas las líneas | Prioridad del backend pendiente |
| US15-CA03 | Mayor tiempo máximo, sin suma ni multiplicación | Contrato de tiempos pendiente |
| US15-CA04 | Instante comparable e ID numérico estable | Dirección de desempate integrada pendiente |
| US15-CA05 | Entrada nueva de prueba ocupa su prioridad | No se registra ni consulta un pedido real |
| US15-CA06 | Fixtures finalizados salen de la consulta activa | No se ejecuta una transición |
| US15-CA07 | Vacío global y parcial correctos | Sin respuesta real del servidor |

S2-TSK-036 y la aceptación integrada siguen pendientes. En una integración futura debe conservarse el orden recibido de la API, sin aplicar el ordenamiento de fixtures sobre esa respuesta. No se creó commit, push, PR ni despliegue.

## Alineación vigente — 02/11/2026

Se verificaron en el archivo Figma original los IDs, nombres y dimensiones de las referencias de este documento. El [registro compartido](../../REFERENCIAS-FIGMA.md) identifica la única referencia histórica no verificable y delimita esta comprobación de metadatos. Las lecturas y capturas históricas obtenidas en la copia no se atribuyen retroactivamente al original.

La revisión documental no vuelve a ejecutar el prototipo ni certifica equivalencia visual. Los recorridos locales se verifican por separado en test/flujos-integrados. No se implementan nuevas pantallas ni se cambian reglas de negocio por corregir estas referencias.
