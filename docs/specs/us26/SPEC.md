# SPEC — US26: consulta de reservas expiradas

Fecha: 01/11/2026. Entrega actual: implementación frontend de muestra. Rama: feature/reserva-expirada. PR hacia develop.

Leer [SPEC común](../../../SPEC.md), [AGENTS.md](../../../AGENTS.md) y [reparto de mantenimiento](../../ASIGNACION-EQUIPO.md). Consultar también [US25](../us25/SPEC.md), integrado en develop junto con US26. La corrección conjunta se documenta en la sección 16. Este documento conserva los requisitos completos de US26 y separa su presentación frontend del vencimiento automático del servidor.

## 1. Objetivo y secuencia

Como dueño o administrador del restaurante, quiero que las reservas vencidas liberen su horario automáticamente para evitar mantener mesas bloqueadas por solicitudes o visitas que no se concretaron.

Entrega frontend: mostrar el estado Expirada, fecha de vencimiento y datos conservados en detalle e historial, evitando acciones incompatibles y sin ejecutar la expiración desde Angular.

Secuencia: SPEC → commit documental → implementación frontend → commit de código → integración API autorizada y aceptación. No crear commits automáticamente ni reunir implementación con documentación.

La implementación se realiza en feature/reserva-expirada, creada por el usuario. La base anterior a esta implementación conserva 20 interfaces declaradas y todavía no incluye el SPEC ni la implementación de US25. Consultar sus reglas en el SPEC común y comprobar su integración antes de reutilizar sus componentes; no importar archivos ausentes. No se crean commits automáticamente; el mensaje se entrega para revisión.

## 2. Tareas y alcance

| Tarea | Alcance original |
| --- | --- |
| S2-TSK-055 | Incorporar el estado EXPIRADA y la fecha de vencimiento en el detalle e historial de reservas. |
| S2-TSK-056 | Actualizar las vistas desde la API para reflejar el vencimiento y la nueva disponibilidad sin ejecutar la expiración desde el navegador. |

Primera implementación: presentación responsive con datos de muestra de reservas ya expiradas, fechas y motivos conocidos, navegación detalle/listado y errores de consulta. S2-TSK-056 y el vencimiento real quedan pendientes de backend.

Incluye detalle de cliente y operación, incorporación acotada de filas expiradas en historial/listado existente, conservación de los datos y bloqueo de acciones incompatibles. No reconstruir los módulos completos de consulta US07 o gestión US29 por añadir este estado.

Excluye crear/confirmar/reprogramar/cancelar/completar reservas, agenda completa, configuración del módulo, reservas nuevas, plano, autenticación, avisos reales, disponibilidad real y procesos programados de servidor. Tampoco añade temporizadores que actualicen una reserva a Expirada en el navegador.

## 3. Fuentes y referencias

Fuente funcional: report_1ACC0236-20262.pdf, US26, páginas físicas 76–78. Cinco criterios originales completos en la sección 14.

Fuente visual autorizada por AGENTS.md y memory.md: [Figma original](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92), página RestoPilot 5:92. Fichas PDF-UI-049, detalle de cliente, páginas 134–135; PDF-UI-090, detalle operativo, páginas 163–164. Listados de referencia PDF-UI-044 y PDF-UI-082.

| Pantalla | Desktop | Mobile |
| --- | --- | --- |
| cliente-reserva-expirada | 84:46814 · 1440 × 864.70 | 84:46918 · 390 × 1395.90 |
| op-reserva-expirada | 89:45236 · 1440 × 900 | 89:45368 · 390 × 1004 |
| cliente-reservas, apoyo acotado | 84:48114 · 1440 × 900 | 84:48251 · 390 × 822.50 |
| op-reservas, apoyo acotado | 91:51761 · 1440 × 900 | 91:51957 · 390 × 1097 |

Se verificaron los IDs, dimensiones y textos relevantes de estas cuatro vistas mediante MCP oficial en el Figma original autorizado. Para implementar se obtuvieron los ocho contextos desktop/mobile y se compararon capturas de aplicación. Se reutilizan la marca local existente y las fuentes locales verificadas; el mapa decorativo conserva el gradiente CSS del frame original, sin imágenes temporales ni capturas incrustadas.

Las dos variantes expiradas declaran detalle visual de muestra, con API pendiente. Los dos listados mantienen contenidoImplementado=false y estado parcial US26; el módulo general US07/US29 sigue pendiente. Se conservan asociaciones de tareas, responsables, clases, archivos y rutas del inventario.

### Diferencias que resolver

- Los listados muestran #190 como Expirada y los detalles usan #208. Una selección de #190 debe abrir #190 con sus propios datos. No sustituirla por el ejemplo fijo del detalle.
- La fecha de expiración requerida por S2-TSK-055 no figura como campo independiente en estos frames; añadirla de forma legible en ficha y fila/detalle del listado.
- Los mensajes mezclan dos causas posibles. Mostrar el motivo concreto solo cuando esté disponible; no atribuir inasistencia a una solicitud pendiente sin confirmar.
- «La mesa quedó liberada» y «se notificó» describen resultados integrados. En muestra, aclarar que no se alteró disponibilidad ni se enviaron avisos.
- «Hacer otra reserva» navega a la creación existente; no reactiva, edita ni reutiliza la reserva expirada.

## 4. Rutas y archivos

| Vista | Ruta existente |
| --- | --- |
| Detalle expirado del cliente | /cliente/reserva?vista=cliente-reserva-expirada |
| Historial del cliente | /cliente/reservas |
| Detalle expirado operativo | /operacion/reserva?vista=op-reserva-expirada |
| Agenda/historial operativo | /operacion/reservas |
| Nueva reserva de referencia | /cliente/reservar |

Mantener rutas hijas bajo ClienteLayout/AdminLayout, loadChildren, router-outlet, ScreenHost, cargadores, carpetas y clases. Entradas: src/app/pages/cliente/cliente-reserva-expirada/, src/app/pages/operacion/op-reserva-expirada/ y cambios estrictamente necesarios en cliente-reservas/ y op-reservas/. Archivos .ts/.html/.css separados.

No inventar rutas /historial-expiradas ni parámetros de identidad. ?vista= selecciona composición; no ejecuta el vencimiento ni acredita que la reserva pertenezca al usuario.

En muestra puede existir selección por ID reconocido dentro de una colección identificada. No aceptar snapshots arbitrarios de navegación ni hacerlos pasar por respuestas confiables. En integración confirmar identificación y permisos reales.

## 5. Reglas completas de vencimiento

| Situación | Momento de vencimiento | Resultado funcional integrado |
| --- | --- | --- |
| Pendiente sin confirmar | Al alcanzar el inicio, inclusive | Expirada, historial conservado, horario liberado y aviso |
| Confirmada sin llegada | Inicio + 15 minutos, inclusive | Expirada, historial conservado, horario liberado y aviso |
| Confirmada sin llegada, antes del límite | Todavía no vence | Se conserva y se permite llegada conforme a US25 |
| Llegada registrada oportunamente | No vence por falta de llegada | Se conserva para atención/finalización |
| Reserva ya expirada | Petición tardía | Conserva Expirada; no se restablece el bloqueo de mesa |

Para una reserva iniciada a las 19:00: Pendiente vence a las 19:00; Confirmada sin llegada vence a las 19:15. A las 19:14:59.999 sigue vigente la tolerancia; a las 19:15 exactas ya venció. Comparar instantes completos, no horas sin fecha.

Una llegada registrada a tiempo evita expiración por inasistencia aunque después pase la tolerancia. No sustituir arrivedAt para simular una asistencia tardía. No expirar de nuevo una reserva Completada/Cancelada/Rechazada ni inventar otras causas de vencimiento.

Estas reglas describen el negocio y sirven para fixtures/pruebas. Su ejecución definitiva, reloj, actualización atómica, disponibilidad y notificación son responsabilidad del servidor. Angular no transforma un registro vigente en Expirada al abrir una página o al pasar un contador.

## 6. Datos conservados y fecha de vencimiento

Modelo de consulta mínimo: ID de reserva/restaurante, contexto de propietario cuando corresponda, estado, inicio/fin previstos, mesa, comensales, notas disponibles, arrivedAt si existe, expiredAt y motivo de expiración si existe.

Mantener nombres y datos asociados a la reserva histórica. El vencimiento no borra la fila ni cambia su identidad, horario previsto, mesa o comensales. Una nueva reserva es otra operación.

expiredAt es la fecha efectiva de vencimiento confirmada por la fuente de datos, no la hora de abrir el detalle, actualizar la lista o ejecutar una tarea del navegador. Confirmar con backend su campo y semántica; si distingue vencimiento efectivo de procesamiento, no confundirlos.

Mostrar fecha y hora con zona de presentación definida, preferentemente America/Lima como el resto de muestras. Comparaciones con timestamps completos y offset; evitar textos ambiguos como «hoy» para reservas históricas.

En fixtures pueden existir dos ejemplos independientes: una solicitud Pendiente vencida en su inicio y una Confirmada sin llegada vencida a inicio +15. Ambos se proporcionan ya con estado Expirada y expiredAt explícito. Un cálculo auxiliar de elegibilidad, si se usa en pruebas, no guarda ni publica el nuevo estado.

Si la fecha de vencimiento o motivo no está disponible, indicarlo; no inventarlos desde el estado actual, la fecha del sistema o una causa supuesta. Datos incoherentes deben impedir una explicación falsa y comunicar la limitación.

## 7. Detalles de cliente y operación

Cliente: título «Tu reserva expirada» cuando el registro consultado esté Expirada. Mostrar ID, estado, restaurante, horario previsto, mesa/comensales, notas, expiredAt y motivo conocido. Acciones «Volver a mis reservas» y «Hacer otra reserva» hacia rutas existentes.

Operación: título «El tiempo de espera terminó» cuando corresponda. Mostrar la ficha histórica, cliente disponible, fechas, estado y explicación de que una reserva expirada no puede reprogramarse o completarse. Retorno «Volver a reservas».

No mostrar botones Confirmar, Reprogramar, Cancelar, Registrar llegada o Completar sobre una Expirada. No habilitar una supuesta recuperación de reserva ni cobrar por el vencimiento.

La visita directa a una variante expirada sobre un registro vigente muestra su estado actual y recuperación de navegación; no lo convierte en Expirada ni usa el título de vencimiento como hecho confirmado. Una muestra inicial de consulta puede estar ya expirada y claramente identificada.

Una reserva ajena/inexistente no revela cliente, notas, mesa ni fechas. En integración, la consulta de cliente se limita a sus propias reservas y la operativa al restaurante autorizado; el filtro de fixtures no demuestra protección real.

## 8. Reflejo en historial y límites del listado

Cuando exista el listado completo, añadir estado Expirada, fecha de vencimiento y enlace al mismo registro en detalle. Conservar las filas expiradas y su identidad; no ocultarlas porque dejaron de bloquear una mesa.

En esta rama los listados cliente-reservas y op-reservas todavía están pendientes. La implementación US26 puede construir el soporte mínimo de consulta de filas expiradas, identificado como «Reservas expiradas de muestra», con los datos y navegación necesarios. No declarar que eso completa la agenda US29, el historial general US07, sus filtros, búsqueda, creación o gestión de otros estados.

Si se modifica una entrada canónica de listado, registrar el alcance parcial en su estado documental. No marcar todo el módulo o su boolean de contenido completo como terminado por añadir únicamente la sección de expiradas; distinguir los dos detalles implementados del soporte parcial de los listados. Mantener las comprobaciones de inventario.

Todas las muestras de detalle/listado comparten una colección coherente en cada contexto. Seleccionar una fila conserva ID, restaurante, horario y fecha de expiración. Volver conserva el contexto de consulta; recargar puede reiniciar la muestra de forma explícita.

No inventar un historial global desde una API que solo devuelva reservas activas. Confirmar el contrato del listado antes de integrar; si no expone expiradas, documentar esa dependencia y no afirmar consulta completa.

## 9. Continuidad con US25 y disponibilidad

La implementación de US25 revisada en su rama incluye Expirada en su enum y rechaza acciones sobre ese estado. Todavía no está integrada en esta base. Reutilizar tipos, reloj de pruebas o componentes adecuados cuando estén disponibles, sin duplicar enums incompatibles ni crear importaciones a archivos inexistentes. No cambiar su muestra Confirmada a Expirada por entrar en este feature ni alterar su llegada/finalización.

Confirmada con llegada oportuna sigue consultable para US25 después de inicio +15 y puede completarse conforme a sus reglas. Mantener las fechas originales y comprobar esta regresión.

En integración, al refrescar detalle/historial reflejar Expirada y la disponibilidad que realmente devuelva el servidor. No asumir que consultar una reserva libera una mesa ni cambiar a disponible todas las reservas/turnos de esa mesa: el requisito se refiere a su horario.

No implementar el plano ni mostrar una mesa como reservable desde un boolean local. Si no existe dato de disponibilidad confirmado, mostrar solo la información de la reserva y la limitación de la muestra.

## 10. Actualización, errores y peticiones tardías

- Carga: estado accesible sin afirmar expiración ni disponibilidad nueva.
- Resultado Expirada: ficha/filas conservadas con fecha disponible.
- Sin expiradas: mensaje de vacío, sin fabricar reservas vencidas.
- Error inicial: explicación y recuperación, sin datos de otra reserva.
- Error al refrescar: si se conserva lectura anterior, identificarla; no anunciar que se actualizó la disponibilidad.
- Reserva inexistente/ajena: sin información del registro ni acciones.
- Estado vigente o llegada registrada a tiempo: no mostrarlo como Expirada por el reloj local.
- Datos incompletos: aviso de fecha/motivo no disponible o error según lo que impida representar; no crear timestamps ficticios.

CA05 requiere rechazar peticiones tardías de confirmación, reprogramación, cancelación y finalización. La interfaz de US26 elimina esas acciones; sus módulos y el servidor deberán revalidar el estado al operar. No implementar las cuatro operaciones ajenas solo para demostrar el bloqueo ni considerar que ocultar un botón equivale a protección del backend.

No enviar automáticamente escrituras al detectar que el reloj local superó un umbral. Tampoco añadir polling, cron o notificaciones falsas. Antes de conectar, confirmar endpoints, enums, expiredAt, motivos, reloj, autorización, errores, paginación del historial si existe y mecanismo de refresco.

## 11. Estilo, arquitectura y accesibilidad

Angular standalone con .ts/.html/.css separados, @if/@for con track, routerLink y rutas hijas. Angular Material para tarjetas, tablas, botones y carga; Reactive Forms solo si aparece un formulario necesario dentro del alcance. No añadir dependencias ni controles decorativos que aparenten operaciones.

Usar el marco operativo disponible y, cuando esté integrada, su configuración de Reservas de US25, además de componentes adecuados del cliente; no copiar el menú administrativo al cliente ni mostrar un perfil ficticio como sesión conectada. Reutilizar recursos locales y tokens --rp-* del SPEC común.

Un h1 por vista; estado y motivo con texto además de color. Fechas legibles, tabla semántica, enlace de consulta con ID accesible, foco visible, navegación y recuperación por teclado. Mensajes moderados sin releer toda la ficha al refrescar.

Comparar 1440/390 con Figma y revisar 320/768/1280, zoom 200 %, nombres/notas largos y ausencia de recortes/desbordamiento global. Scroll interno de tablas cuando haga falta. Omitir códigos RP y detalles de endpoints del producto.

Heurísticas de [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), ya consultadas: estado/fecha visibles, causa comprensible, conservación del historial, prevención de acciones tardías, consistencia fila/detalle y recuperación de errores. No equivale a certificación de usabilidad.

## 12. Trazabilidad y verificación prevista

| Criterio | Evidencia frontend/local prevista | Pendiente del servidor |
| --- | --- | --- |
| US26-CA01 | Fixture Pendiente ya expirado al inicio, historial y fecha coherentes | Vencimiento, liberación y aviso reales |
| US26-CA02 | Fixture Confirmada sin llegada expirado a inicio +15 | Actualización autoritativa y disponibilidad |
| US26-CA03 | Antes del límite no presentar como Expirada | Vigencia y llegada aceptadas por API |
| US26-CA04 | Llegada oportuna conserva estado/atención | Ausencia de expiración indebida en servidor |
| US26-CA05 | Expirada sin acciones incompatibles ni reactivación por URL | Rechazo de escrituras tardías y bloqueo no restablecido |

Antes de cerrar implementación:
1. npm.cmd run check y npm.cmd run build; conservar los 120 escenarios y reparto.
2. Probar los dos motivos de expiración y fechas explícitas, datos ausentes/incoherentes y estado vigente recibido de una fuente local; no generar una escritura por paso del tiempo.
3. Probar límites: Pendiente en inicio exacto; Confirmada sin llegada antes y en inicio +15; llegada oportuna que cruza el límite; comparar instantes con offsets.
4. Verificar dos IDs diferentes entre fila/detalle, retornos, historial conservado y fecha de vencimiento coherente en ambos contextos.
5. Cuatro rutas, acceso directo, estado incompatible, recarga, selección inexistente/ajena y atrás/adelante sin mutaciones.
6. Carga, vacío, error inicial, lectura anterior y recuperación sin disponibilidad inventada.
7. Confirmar ausencia de botones/escrituras de expiración, reactivación, confirmación, reprogramación, cancelación o finalización sobre Expirada.
8. Revisar cinco anchos, zoom, teclado, foco, textos largos y capturas. Si cambia un componente compartido, verificar sus consumidores.
9. Repetir las pruebas relevantes de US25: llegada válida, límite de tolerancia y finalización posterior con llegada oportuna. Registrar límites y resultados ejecutados.

Para el documento: comprobar cinco criterios íntegros, referencias, rutas y estructura; no hace falta build sin cambios de código/configuración. No declarar S2-TSK-056, US07 o US29 terminadas con esta entrega.

## 13. Commits previstos

Documento actual:
- Título: docs(us26): define la consulta de reservas expiradas
- Descripción: Especifica US26 y sus cinco criterios de aceptación. Define estado y fecha de vencimiento en detalle e historial, motivos, límites temporales, bloqueos y continuidad con US25. Incluye referencias Figma, rutas hijas, Angular Material y verificaciones; reserva la expiración, disponibilidad y avisos reales al servidor.

Implementación posterior:
- Título: feat(us26): muestra las reservas expiradas en detalle e historial
- Alcance: consulta visual con muestras coherentes, sin ejecutar vencimiento desde Angular ni completar módulos ajenos.

No crear commit, push, PR o despliegue al preparar este archivo.

## 14. Criterios originales completos

### US26 — Vencimiento de reservas sin atención

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 76, 77, 78.

Como dueño o administrador del restaurante, quiero que las reservas vencidas liberen su horario automáticamente para evitar mantener mesas bloqueadas por solicitudes o visitas que no se concretaron.

#### US26-CA01 — Solicitud pendiente que alcanza su inicio

Escenario 1: Solicitud pendiente que alcanza su inicio Dado que una reserva sigue Pendiente y no fue confirmada. Cuando se alcanza su fecha y hora de inicio. Entonces el sistema la cambia a Expirada, conserva el historial, libera la mesa para ese horario y genera una notificación para el cliente.

#### US26-CA02 — Reserva confirmada sin llegada

Escenario 2: Reserva confirmada sin llegada Dado que una reserva está Confirmada y no tiene llegada registrada. Cuando se cumplen quince minutos desde su hora de inicio. Entonces el sistema la cambia a Expirada, conserva el historial, libera la mesa para ese horario y notifica al cliente.

#### US26-CA03 — Tolerancia todavía vigente

Escenario 3: Tolerancia todavía vigente Dado que una reserva está Confirmada y no tiene llegada registrada. Cuando todavía no se cumplen quince minutos desde su inicio. Entonces el sistema no la vence por inasistencia y permite registrar la llegada mientras continúe dentro del plazo.

#### US26-CA04 — Llegada registrada a tiempo

Escenario 4: Llegada registrada a tiempo Dado que la reserva tiene registrada la llegada antes de vencer la tolerancia. Cuando transcurren quince minutos desde su hora de inicio. Entonces el sistema no la cambia a Expirada por falta de llegada.

#### US26-CA05 — Solicitud tardía sobre una reserva expirada

Escenario 5: Solicitud tardía sobre una reserva expirada Dado que la reserva ya cumplió las condiciones de vencimiento. Cuando se intenta confirmarla, reprogramarla, cancelarla o completar su atención. Entonces el sistema conserva la condición Expirada y no restablece el bloqueo de la mesa por esa solicitud.


## 15. Implementación y verificaciones ejecutadas

Entrega frontend de muestra, 01/11/2026:

- Componentes standalone compartidos en src/app/pages/reserva-expirada-ui/, con archivos TS/HTML/CSS separados. Se conservan las rutas hijas y los cuatro componentes de entrada existentes. Material Card, Table, Button y Spinner; sin formularios nuevos ni dependencias adicionales.
- Fuente local de lectura para los contextos de cliente y operación. Historial de Expiradas y detalles #190/#208 con fechas explícitas, causas distintas, datos conservados y selección por ID. La navegación solo acepta IDs y consulta la colección; no acepta snapshots como registros.
- Fecha/cause ausente o incoherente informa el problema sin calcular otra fecha. Estado vigente recibido se muestra como tal. Las vistas no exponen acciones de confirmación, reprogramación, cancelación, llegada, finalización ni reactivación de una Expirada.
- Carga, error inicial, vacío, selección inexistente/ajena y lectura anterior identificada. Los filtros de fixtures no equivalen a autenticación ni autorización del servidor.
- Cambio mínimo del shell de cocina para destacar Reservas y su encabezado, conservando Pedidos/Cocina. Los listados se limitan a Expiradas y no sustituyen los módulos generales.

Resultados ejecutados:

| Verificación | Resultado |
| --- | --- |
| Chequeo estructural | 120 escenarios; 22 interfaces declaradas; 98 pendientes. No acredita aceptación funcional. |
| Compilación de producción | Correcta. |
| node --test scripts/reserva-expirada.test.mjs | 16 pruebas correctas: límites inclusivos, tolerancia, llegada oportuna, estados finales, offsets, conservación y contexto, fechas y causas incompletas. |
| Cuatro rutas en cinco anchos | 20 combinaciones correctas: 320, 390, 768, 1024 y 1440 px; sin desbordamiento de página. Tabla con desplazamiento propio. |
| Navegación | #190/#208 en ambos contextos, detalle, retorno con foco, recarga, atrás/adelante y acceso directo. IDs inválidos o ajenos no reemplazados por otra reserva. |
| Estados locales | Carga, error y reapertura, vacío, lectura anterior, fechas ausentes/inválidas, motivo desconocido, estado Confirmada y textos largos. Orden de la fuente conservado. |
| Reloj | Adelanto hasta 2030 y un día adicional: una Confirmada se conserva, sin aparecer en historial de Expiradas. |
| Accesibilidad comprobada | Salto al contenido, foco de navegación/retorno, menú operativo y Escape, zoom 200 %. No constituye auditoría completa. |
| Recursos y errores | Marca local cargada en ambos shells; sin errores JavaScript ni solicitudes de escritura durante el recorrido US26. |
| Compatibilidad compartida | Encabezados de Pedidos/Cocina conservados y Reservas destacado. Detalle y acción local de cocina revisados. |

Pendientes: S2-TSK-056, autenticación/permisos reales, consulta autoritativa, expiración atómica del servidor, liberación de horario, notificaciones y rechazo real de escrituras tardías. S2-TSK-055 tiene presentación de muestra verificada, no aceptación integrada. US07/US29 conservan alcance parcial.

Durante la entrega inicial de US26, su rama todavía no contenía US25: no se ejecutaron entonces sus flujos de llegada y finalización ni se afirmó compatibilidad integrada entre ambas historias. Repetir esos recorridos al incorporar ambas implementaciones en develop, incluyendo llegada antes de +15, cruce del límite sin expiración indebida y finalización posterior. La regla temporal pura probada aquí no escribe estado ni sustituye esa prueba conjunta.

## 16. Corrección conjunta de muestras US25–US26 — 01/11/2026

Rama: fix/reservas-consistencia, posterior a la integración de ambas historias en develop.

Problema reproducido: completar #208 en US25 y volver a /operacion/reservas mostraba la misma reserva como Expirada sin llegada en US26. Ambas vistas mantenían colecciones independientes con la misma identidad y estados incompatibles.

Corrección:
- ReservaMuestraStore mantiene una sola colección en memoria para los dos stores. Se conserva el contexto de lectura y los estados de consulta de cada vista.
- #208 corresponde a la visita Confirmada de Mesa 04 y conserva llegada/finalización durante la navegación. #190 sigue representando vencimiento por falta de confirmación y #207, Mesa 02, representa falta de llegada.
- La vista operativa añade un resumen acotado de atención con el estado, fechas y acceso a la ficha de US25. Una #208 Completada permanece visible como tal al volver; no entra al historial de Expiradas.
- Los detalles consultan la misma colección y conservan identidad, cliente, restaurante, notas y fechas. El registro de muestra actualizado no sustituye metadatos por los de otra reserva.
- Se conserva el alcance parcial de agenda/historial. No se implementa el módulo completo US07/US29 ni se cambia el inventario, los responsables o las rutas hijas.
- Recargar reinicia explícitamente la muestra. No se añade persistencia ni expiración por reloj del navegador.

Verificaciones:
- 48 pruebas de reservas correctas: 28 de atención, 16 de expiración y 4 nuevas de consistencia en scripts/reserva-consistencia.test.mjs.
- Chequeo estructural correcto: 120 escenarios, 25 interfaces declaradas y 95 pendientes; no acredita aceptación funcional.
- Compilación de producción correcta.
- Cinco recorridos en navegador, a 320/390/768/1024/1440 px: agenda → llegada → retorno → atención → finalización a las 19:30 con llegada 19:05 → historial → consulta de #207 → retorno y reapertura de #208 Completada.
- Cancelar confirmación conserva la muestra; atrás/adelante conserva Completada; llegada al límite 19:15 sigue bloqueada. Fecha de llegada original y fecha de finalización permanecen intactas.
- Consulta de #208 desde el contexto de cliente conserva Completada y sus fechas; los historiales de Expiradas conservan únicamente #190/#207.
- Sin desbordamiento de página en los cinco anchos; capturas desktop/mobile inspeccionadas. Sin errores JavaScript ni solicitudes de escritura en los recorridos comprobados.

Esta corrección corresponde exclusivamente al frontend de muestra. Los resultados de las secciones anteriores permanecen como evidencia histórica de entregas anteriores.
