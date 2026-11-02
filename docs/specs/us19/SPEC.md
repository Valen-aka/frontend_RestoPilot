# SPEC — US19: preparación, pedido listo y entrega

Fecha: 01/11/2026. Entrega actual: documentación. Rama de trabajo: feature/operacion-cocina. PR hacia develop.

Leer el [SPEC común](../../../SPEC.md), [AGENTS.md](../../../AGENTS.md), [SPEC de US15](../us15/SPEC.md) y el [reparto de mantenimiento](../../ASIGNACION-EQUIPO.md). Este documento complementa la consulta de US15 con las acciones de avance del pedido; no sustituye sus reglas de prioridad.

## 1. Objetivo y secuencia

Como dueño o administrador del restaurante, quiero registrar el avance de los pedidos de mi local para comunicar su preparación y entrega de manera ordenada.

Secuencia de la rama:
1. SPEC de US15 y commit documental.
2. Implementación de US15 y commit de código.
3. Este SPEC de US19 y commit documental.
4. Implementación de US19 y commit de código independiente.

La rama estaba limpia al preparar este documento y ya contiene la base visual de US15. Preparar el SPEC no autoriza crear commits, integrar servicios ni implementar automáticamente. El commit documental selecciona únicamente este archivo.

## 2. Tareas y alcance

| Tarea | Alcance original |
| --- | --- |
| S2-TSK-037 | Construir las acciones de preparación, pedido listo y entrega con confirmaciones visuales. |
| S2-TSK-038 | Integrar los cambios de estado y refrescar la vista; mostrar las transiciones rechazadas por la API. |

Primera implementación: recorrido interactivo de muestra con transiciones locales validadas, confirmaciones Material, variantes existentes y estados de carga/error/rechazo. Los cambios locales no actualizan pedidos reales, no conceden permisos ni envían notificaciones. S2-TSK-038 queda pendiente hasta una integración autorizada y verificable.

Incluye inicio de preparación, finalización de preparación, registro de entrega, rechazo de saltos/retrocesos/repeticiones, estados finales, pedido inexistente/ajeno, conservación de datos y actualización del conjunto activo de US15.

Excluye crear/editar/cancelar pedidos, cobrar, reembolsar, implementar autenticación, notificaciones reales, historial global, reparto geolocalizado, WebSocket, IA y otros módulos administrativos. Tampoco conecta automáticamente la operación de muestra con el carrito o seguimiento del cliente.

## 3. Fuentes y referencias visuales

Fuente funcional: report_1ACC0236-20262.pdf, US19, páginas físicas 65–66. Sus seis criterios originales se reproducen íntegros en la sección 14. Fichas de interfaz PDF-UI-069 a PDF-UI-072, páginas 149–152; el inicio de preparación también aparece en el tablero PDF-UI-068.

Fuente visual: [Figma vigente](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=5-92), página RestoPilot 5:92, sección Pedidos operación 95:11.

| Escenario | Desktop | Mobile | Estado previo de la acción |
| --- | --- | --- | --- |
| op-pedido-detalle, base US15 | 89:29812 · 1440 × 900 | 89:29989 · 390 × 1318 | Pendiente para iniciar |
| op-pedido-listo | 89:36014 · 1440 × 900 | 89:36185 · 390 × 1297.08 | En preparación para marcar listo |
| op-pedido-entregar | 89:35713 · 1440 × 900 | 89:35884 · 390 × 1264.61 | Listo para entregar |
| op-pedido-entregado | 89:35412 · 1440 × 900 | 89:35583 · 390 × 1264.61 | Entregado, consulta final |
| op-cocina, entrada de acciones | 89:12661 · 1440 × 967.10 | 89:12859 · 390 × 1820.22 | Según cada comanda |

En esta entrega documental se consultaron estructura, dimensiones y textos desktop de las tres variantes de US19 mediante MCP oficial de Figma. Los contextos y capturas de tablero/detalle obtenidos al implementar US15 son antecedentes. Antes de implementar US19, obtener y comparar sus propios contextos y capturas desktop/mobile; estas lecturas no son pruebas de ejecución.

Precisiones de interpretación:
- op-pedido-listo representa un pedido En preparación antes de «Marcar como listo»; el nombre de carpeta no implica un estado Listo ya registrado.
- El frame entregado usa «Entrega registrada». En muestra, aclarar «Entrega de muestra» o equivalente y no afirmar una entrega real.
- El apoyo «Cada cambio se comunica al cliente» expresa el objetivo integrado; en la entrega local debe aclararse que no se envían avisos.
- «Registrar pago», «Editar contenido» y «Cancelar pedido» presentes en referencias pertenecen a otras historias. No activarlos por implementar US19.
- Conservar la muestra coherente de US15, sin reemplazar todas las operaciones por #1042 ni recuperar las inconsistencias entre frames corregidas allí.

## 4. Rutas hijas y archivos

| Vista | Ruta existente |
| --- | --- |
| Cola de US15 | /operacion/pedidos |
| Tablero de US15 | /operacion/cocina |
| Detalle e inicio de preparación | /operacion/pedido |
| Preparación y acción Marcar listo | /operacion/pedido/listo |
| Pedido listo y acción Entregar | /operacion/pedido/entregar |
| Consulta final entregado | /operacion/pedido?vista=op-pedido-entregado |

Conservar loadChildren de operacion y children bajo AdminLayout en src/app/routes/operacion/operacion.routes.ts, su router-outlet, ScreenHost, cargadores e identificadores. No crear rutas raíz paralelas ni rutas nuevas de seguimiento operativo.

Entradas de US19: src/app/pages/operacion/op-pedido-listo/, op-pedido-entregar/ y op-pedido-entregado/, con sus clases y .ts/.html/.css existentes. Incorporar las acciones necesarias a op-pedido-detalle y op-cocina mediante los componentes compartidos de cocina-ui, sin duplicar el desglose o las validaciones en cada entrada.

?vista= y el path seleccionan presentación. Nunca ejecutan una transición, identifican una cuenta ni prueban un permiso. Una URL de Entregado abierta sobre un pedido Pendiente no debe marcarlo entregado ni anunciar una entrega previa inexistente.

En acceso directo sin selección, mostrar recuperación hacia cola/tablero. Si la ruta corresponde a otra etapa, informar el estado actual y ofrecer consulta de la etapa adecuada; no sobreescribir el pedido para hacer coincidir el frame.

## 5. Dependencia con US15 y modelo de selección

Reutilizar CocinaShell, CocinaView, CocinaCard, el modelo y la colección de CocinaStore cuando sean adecuados. Mantener una única fuente local de pedidos; no duplicar una muestra por pantalla ni mutar SAMPLE_ORDERS congelado.

La base actual de US15 resuelve selected desde store.displayed(), que contiene únicamente la cola activa. Esto debe adaptarse para US19: consultar el pedido seleccionado por ID dentro de la colección propia validada, independientemente de si aún está en la cola. Mantener queue/displayed con la restricción Pendiente/En preparación.

Después de pasar a Listo o Entregado, conservar el pedido en la colección y en su consulta por selección; retirarlo solo del conjunto activo. Cancelado también conserva sus datos para verificar la protección de estados finales, pero esta historia no lo genera.

La selección transporta únicamente un ID local reconocido y origen cola/tablero; validar forma, pertenencia y existencia en cada consulta y acción. history.state es navegación de muestra, no autorización. No aceptar un snapshot arbitrario de navegación como registro confiable.

Actualizar únicamente el estado del pedido elegido y los metadatos de presentación necesarios. Conservar identificador, restaurante, cliente, líneas, cantidades, nombres/precios históricos, total, modalidad, mesa/dirección, fecha original y pago. No actualizar la creación para simular un pedido nuevo.

## 6. Máquina de estados

| Estado actual | Acción válida | Estado siguiente | Acción siguiente disponible |
| --- | --- | --- | --- |
| Pendiente | Iniciar preparación | En preparación | Marcar listo |
| En preparación | Marcar listo | Listo | Registrar entrega |
| Listo | Registrar entrega | Entregado | Ninguna transición |
| Entregado | Ninguna | Se conserva Entregado | Solo consulta y retorno |
| Cancelado | Ninguna | Se conserva Cancelado | Solo consulta y retorno |

No permitir Pendiente → Listo/Entregado, En preparación → Entregado, retrocesos, repetir el mismo estado o salir de un estado final. Tampoco habilitar cancelación dentro de esta máquina.

Validar la transición al solicitar la acción y al confirmarla. El estado puede haber cambiado mientras se revisaba el diálogo. Si el estado actual ya no coincide con el esperado, rechazar y conservarlo; no adaptar automáticamente la acción a la etapa siguiente.

El estado de pago es independiente: Pagado no implica Entregado y pago Pendiente no bloquea por sí solo la entrega según los criterios originales. No añadir una condición de pago obligatorio, preparación por modalidad u otra regla comercial ausente del reporte.

Una función pura puede definir las transiciones válidas para pruebas. La actualización local debe devolver un resultado explícito de éxito de muestra o rechazo, sin alterar pedidos diferentes ni la colección original de fixtures.

## 7. Acciones y confirmaciones

### Iniciar preparación

Disponible únicamente para un pedido propio válido Pendiente. Entrada desde detalle o tarjeta de Pendientes. Mostrar ID y estado actual antes de confirmar; tras la simulación aceptada, conservar la selección y abrir la preparación de ese pedido. En US15 se mueve de Pendientes a En preparación manteniendo su prioridad relativa.

### Marcar listo

Disponible únicamente para En preparación. Desde detalle de preparación o tarjeta correspondiente. Confirmar que se da por terminada la preparación; después mostrar el mismo pedido como Listo y continuar a su vista de entrega. Sale de ambos grupos activos de US15.

### Registrar entrega

Disponible únicamente para Listo. Revisar ID, modalidad y estado antes de confirmar. Después mostrar la consulta Entregado del mismo pedido, sin otra acción de avance. Conservar importes y pago, incluso si sigue Pendiente.

### Contrato del diálogo

Usar MatDialog con título específico, ID, estado actual y siguiente, acción de confirmar y «Volver sin cambios». En fase local, título y botón deben expresar simulación: «Simular inicio de preparación», «Simular pedido listo» o «Simular entrega». Mostrar el aviso cercano «Esta acción solo cambia la muestra local. No actualiza al restaurante ni envía notificaciones.».

Abrir el diálogo no modifica el pedido. Cancelar o Escape conserva todos los datos y devuelve foco al control de origen. No cerrar por fuera del diálogo para ejecutar una acción. Confirmar una vez bloquea activaciones repetidas mientras se resuelve la actualización; cerrar no debe disparar una segunda transición.

No anunciar «Notificación enviada» ni «Entrega registrada» como operación real en la fase local. En integración posterior se usarán las etiquetas de operación «Iniciar preparación», «Marcar como listo» y «Registrar entrega», con éxito respaldado por respuesta válida.

## 8. Navegación y salida de la cola

Flujo previsto: cola/tablero → pedido Pendiente → preparación → Listo/entrega → Entregado → retorno al origen.

El ID y el origen se conservan en todos los enlaces. La ruta apropiada cambia con la etapa confirmada, pero navegar hacia ella no cambia el estado. No perder el pedido cuando deje la cola ni inferir que se eliminó porque ya no figura en queue.

La lista activa conserva solo Pendiente/En preparación y la prioridad de US15. No agregar una tercera columna de Listos/Entregados ni convertir la cola en historial. La consulta seleccionada puede mantenerse en memoria para continuar la entrega sin inventar una consulta global de listos.

Si se vuelve al origen y el pedido ya salió de la cola, llevar el foco a su encabezado o a un mensaje de actualización en vez de buscar una tarjeta inexistente. Si permanece activo, devolver foco a su enlace/acción reconocible.

Atrás/adelante no revierte ni repite las transiciones locales. Un diálogo abierto sobre un estado anterior debe revalidarse. Recargar reinicia la muestra en memoria: explicarlo y no restaurar un estado final desde la URL ni guardar direcciones o datos operativos en localStorage.

## 9. Carga, rechazo, error y concurrencia

- Consulta inicial: carga accesible y controles operativos bloqueados hasta resolver una selección válida.
- Lectura anterior o error de consulta: conservar el aviso de US15 y bloquear avances sobre datos cuya actualidad no está confirmada.
- Actualización pendiente: estado perceptible, bloqueo de repetición y selección estable. En muestra no simular una respuesta del restaurante mediante temporizadores ornamentales.
- Rechazo de transición: explicar el estado actual y que el cambio solicitado no está permitido. No alterar datos ni hacer avanzar automáticamente otra etapa.
- Pedido ajeno/inexistente: no mostrar su contenido ni permitir cambios. No sustituir por la primera comanda del restaurante.
- Error de actualización: conservar el último estado confirmado y los datos; retirar el bloqueo cuando corresponda y permitir revisar/reconsultar. No anunciar éxito.
- Estado final: Entregado y Cancelado mantienen información y no ofrecen avances.

La primera entrega debe permitir comprobar carga, error y rechazo mediante entradas de prueba, sin añadir controles de producto para fabricar estados artificiales.

En integración posterior, enviar la acción según el contrato autorizado y actualizar la interfaz solo con el resultado confirmado. Si hay conflicto o el estado cambió en paralelo, reconsultar y comunicarlo. No repetir ciegamente una escritura cuando su resultado sea incierto.

Confirmar identificación, restaurante autorizado, enums, control de concurrencia disponible, errores y formato de respuesta antes de conectar. No inventar endpoints, códigos de error específicos, JWT, usuarios o permisos ficticios.

## 10. Notificaciones y límites de integración

US19-CA01, CA02 y CA03 exigen generar una notificación al cliente en cada cambio válido. Ese requisito queda completo en este SPEC, pero su generación real no se cumple mediante un mensaje local, un contador ficticio o la navegación a otra pantalla.

La fase visual comunica «Cambio de muestra aplicado; no se enviaron notificaciones» cuando corresponda. No implementar el módulo de avisos por arrastre. En integración, verificar con el backend cómo se genera el aviso correspondiente y distinguir el resultado del cambio de estado del resultado de su notificación, según contrato; no deshacer ni duplicar acciones por suponer una entrega de avisos no confirmada.

La operación de muestra tampoco actualiza automáticamente la vista cliente de US13. Las pruebas de flujo integrado pertenecen a una entrega posterior; compartir el número #1042 entre muestras no demuestra conexión real ni aislamiento de cuentas.

## 11. Estilo, componentes y accesibilidad

Conservar el marco operativo de US15 y sus fuentes/assets locales. Usar variables --rp-* del SPEC común, estilos locales y APIs públicas de Angular Material. No introducir otra paleta, tipografía, dependencias o layout global para estas tres variantes.

Componentes standalone .ts/.html/.css separados; @if/@for con track, routerLink y rutas hijas existentes. Reutilizar tarjetas, tablas, botones, carga y diálogo Material. Reactive Forms si aparece un formulario necesario; esta historia no exige campos de cobro, dirección nueva o motivo de cancelación.

Un h1 por vista; ID y estado visibles con texto además de color. Nombre de acción específico por pedido cuando se repite en tarjetas. Foco visible, diálogo con título accesible, foco inicial en la opción segura, confinamiento de foco, Escape y retorno correcto. Tras éxito, anunciar el nuevo estado mediante un mensaje moderado y situar foco en un destino coherente.

Anchos de referencia 1440/390, adicionales 320/768/1280; zoom 200 %, teclado, textos largos, múltiples líneas y estados finales. Conservar scroll interno de tablas y menú móvil accesible, sin desbordamiento de toda la página ni códigos RP / 060–062 en producto.

Heurísticas de [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), ya consultadas: estado visible antes/después, términos familiares, confirmaciones para prevenir errores, cancelar sin cambios, consistencia entre tarjeta y detalle, acciones válidas reconocibles y recuperación de rechazo. No presentar esta revisión como certificación de usabilidad.

## 12. Trazabilidad y pruebas previstas

| Criterio | Verificación visual/local | Pendiente de integración |
| --- | --- | --- |
| US19-CA01 | Pendiente → En preparación, mismo pedido, datos intactos y cola coherente | Cambio autorizado y aviso real |
| US19-CA02 | En preparación → Listo, salida de cola y acceso a entrega | Cambio confirmado por API y notificación |
| US19-CA03 | Listo → Entregado con consulta final | Registro real y aviso al cliente |
| US19-CA04 | Saltos, retrocesos y repetición rechazados sin mutación | Rechazo autoritativo del servidor |
| US19-CA05 | Entregado/Cancelado sin avances, incluso por acceso directo | Estados finales protegidos por API |
| US19-CA06 | Selección inexistente/ajena sin datos ni cambios | Permisos y pertenencia reales |

Antes de cerrar implementación:
1. Ejecutar npm.cmd run check y npm.cmd run build; conservar los 120 escenarios. Repetir node --test scripts/cocina-priority.test.mjs.
2. Añadir pruebas significativas de la máquina de estados: tres avances válidos; saltos, retrocesos, repetición, finales y pedido inexistente/ajeno rechazados. Comprobar ausencia de mutación en errores.
3. Recorrer al menos dos pedidos con modalidades y pagos diferentes; verificar que la transición no altera selección, total, precios, fecha, cliente o pago ni modifica otras comandas.
4. Abrir/cancelar cada diálogo; probar Escape, foco inicial/retorno y confirmación repetida. Cambiar el estado entre apertura y confirmación mediante fixture y comprobar rechazo, sin avanzar otra etapa.
5. Verificar salidas de cola y continuación de entrega por ID; conservar prioridad de los pedidos restantes, conteos, vacío y navegación de US15.
6. Probar las seis rutas del alcance, acceso directo sin selección, etapa incompatible, recarga y atrás/adelante sin transiciones implícitas.
7. Probar carga, error de consulta, lectura anterior, rechazo, error de actualización y recuperación sin éxito falso ni pérdida de datos.
8. Revisar desktop/mobile y tres anchos adicionales, zoom, teclado, anuncios y capturas contra Figma. No habilitar controles ajenos al alcance.
9. Confirmar que las pruebas locales no envían peticiones de cambio, cobro o avisos ni se describen como aceptación del backend.

Para el commit documental: comprobar seis criterios íntegros, enlaces y rutas existentes, dependencia con US15 y chequeo estructural. No hace falta compilar mientras no cambie código/configuración. Registrar solo pruebas realmente ejecutadas y no marcar las tres variantes como implementadas por crear este archivo.

## 13. Commits previstos

Documento actual:
- Título: docs(us19): define la preparación y entrega del pedido
- Descripción: Especifica las transiciones de US19 y sus seis criterios de aceptación. Define confirmaciones, rechazos, estados finales, conservación del pedido, continuidad tras salir de la cola y reutilización de US15. Incluye rutas hijas, Angular Material, referencias Figma y pruebas previstas; mantiene pendientes API y notificaciones reales.

Implementación posterior:
- Título: feat(us19): implementa la preparación y entrega del pedido
- Alcance: acciones y confirmaciones de muestra, validación de transiciones y continuidad con US15, sin operaciones reales ni avisos enviados.

No crear commit, push, PR ni despliegue al preparar este documento.

## 14. Criterios originales completos

### US19 — Actualización del estado del pedido

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 65, 66.

Como dueño o administrador del restaurante, quiero registrar el avance de los pedidos de mi local para comunicar su preparación y entrega de manera ordenada.

#### US19-CA01 — Inicio de preparación

Escenario 1: Inicio de preparación Dado que el pedido está Pendiente y pertenece al restaurante del usuario. Cuando el usuario inicia su preparación. Entonces el sistema lo cambia a En preparación y genera una notificación para el cliente.

#### US19-CA02 — Pedido listo

Escenario 2: Pedido listo Dado que el pedido está En preparación. Cuando el usuario informa que terminó su preparación. Entonces el sistema lo cambia a Listo y genera una notificación para el cliente.

#### US19-CA03 — Entrega del pedido

Escenario 3: Entrega del pedido Dado que el pedido está Listo. Cuando el usuario registra su entrega. Entonces el sistema lo cambia a Entregado y genera una notificación para el cliente.

#### US19-CA04 — Etapa omitida o retroceso

Escenario 4: Etapa omitida o retroceso Dado que el pedido tiene un estado determinado. Cuando el usuario intenta omitir una etapa, retroceder o repetir el mismo estado. Entonces el sistema rechaza el cambio y conserva el estado anterior.

#### US19-CA05 — Pedido finalizado

Escenario 5: Pedido finalizado Dado que el pedido está Entregado o Cancelado. Cuando el usuario intenta asignarle otra etapa de preparación. Entonces el sistema impide el cambio y conserva su estado final.

#### US19-CA06 — Pedido inexistente o ajeno

Escenario 6: Pedido inexistente o ajeno Dado que el pedido no existe o pertenece a otro restaurante. Cuando el usuario intenta actualizarlo. Entonces el sistema impide la operación y no modifica pedidos ajenos.

