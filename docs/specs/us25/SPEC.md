# SPEC — US25: llegada y finalización de reservas

Fecha: 01/11/2026. Entrega actual: documentación. Rama de trabajo: feature/operacion-reserva-atencion. PR hacia develop.

Leer el [SPEC común](../../../SPEC.md), [AGENTS.md](../../../AGENTS.md) y el [reparto de mantenimiento](../../ASIGNACION-EQUIPO.md). Esta entrega define US25; no reúne su implementación con el commit documental ni implementa la expiración automática de US26.

## 1. Objetivo y secuencia

Como dueño o administrador del restaurante, quiero registrar la llegada de los comensales y completar sus reservas para llevar el control de las visitas efectivamente atendidas.

Secuencia: preparar este SPEC → commit documental → implementación de US25 → commit de código → revisión e integración posterior. La rama ya es feature/operacion-reserva-atencion y estaba limpia al iniciar esta entrega. No se crean commits automáticamente.

## 2. Tareas y alcance

| Tarea | Alcance original |
| --- | --- |
| S2-TSK-053 | Construir las acciones de registro de llegada y finalización en la vista administrativa de reservas. |
| S2-TSK-054 | Integrar ambas operaciones y mostrar sus fechas y estados, con controles coherentes con las reglas del servidor. |

Primera implementación: tres vistas responsive y recorrido local de muestra con confirmaciones, validaciones temporales, fechas de llegada/finalización y recuperación de errores. S2-TSK-054 permanece pendiente de integración autorizada con backend.

Incluye reserva Confirmada sin llegada, Confirmada con llegada registrada, Completada, rechazo de registro repetido, falta de llegada, finalización anticipada, tolerancia vencida, estados no válidos, selección inexistente/ajena y navegación coherente.

Excluye crear, confirmar, rechazar, editar o cancelar reservas; agenda completa; reservas del cliente; cobros; cambios en pedidos; plano de mesas; autenticación; notificaciones reales; expiración automática y liberación real de disponibilidad. Usar las rutas de otros módulos no autoriza implementar su contenido.

## 3. Fuentes y referencias

Fuente funcional: report_1ACC0236-20262.pdf, US25, páginas físicas 75–76. Siete criterios originales completos en la sección 14. Fichas PDF-UI-087 a PDF-UI-089, páginas 161–163.

Fuente visual: [Figma vigente](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=5-92), página RestoPilot 5:92, sección Reservas operación 95:13.

| Vista | Desktop | Mobile |
| --- | --- | --- |
| op-reserva-llegada | 89:45459 · 1440 × 900 | 89:45606 · 390 × 1263.36 |
| op-reserva-atendiendo | 89:44067 · 1440 × 900 | 89:44206 · 390 × 1218.86 |
| op-reserva-completada | 89:44503 · 1440 × 900 | 89:44635 · 390 × 1004 |

En esta entrega documental se consultaron estructura, dimensiones y textos desktop mediante MCP oficial de Figma. Antes de implementar obtener los contextos y capturas desktop/mobile; esta lectura no equivale a comparación de interfaz ni a pruebas de ejecución.

Las tres entradas del manifiesto están pendientes. El marco operativo de cocina ya implementado puede aportar componentes y recursos adecuados; revisar su acoplamiento a Pedidos antes de reutilizarlo para Reservas. No copiar su máquina de estados ni su selección como lógica de reservas.

### Diferencias y aclaraciones del diseño

- «Llegada registrada» describe un dato; la reserva continúa Confirmada. No añadir estados Atendiendo, Llegada o En atención al enum.
- El frame muestra el encabezado 20 de octubre y una reserva del 24 de octubre de 2026. No mezclar ese encabezado con el reloj de validación ni evaluar una muestra con la fecha real del ordenador.
- Llegada de referencia 18:58, inicio 19:00: llegar antes del inicio está permitido por US25, pero todavía no se puede completar la atención.
- El frame final indica notificación y liberación de mesa. En muestra aclarar que no hay avisos ni disponibilidad real actualizada.
- «Cancelar reserva» pertenece a otra historia. No habilitarlo por implementar US25.
- «Volver a la agenda» solo navega: no completa la reserva, notifica ni libera una mesa.

## 4. Rutas hijas y archivos

| Vista | Ruta existente |
| --- | --- |
| Registrar llegada | /operacion/reserva/llegada |
| Atención con llegada registrada | /operacion/reserva/atendiendo |
| Consulta completada | /operacion/reserva?vista=op-reserva-completada |
| Agenda de referencia | /operacion/reservas |
| Detalle de referencia, otro alcance | /operacion/reserva |

Mantener loadChildren de operacion y children bajo AdminLayout en src/app/routes/operacion/operacion.routes.ts, router-outlet, ScreenHost, cargadores y las carpetas src/app/pages/operacion/op-reserva-llegada/, op-reserva-atendiendo/ y op-reserva-completada/. Conservar clases, selectores y archivos .ts/.html/.css.

Puede añadirse un área local reserva-atencion-ui con modelo, validación, estado de muestra y presentación compartida. Evitar tres colecciones divergentes. Conservar los 120 identificadores, reparto y asociaciones originales del manifiesto.

La ruta y ?vista= eligen una composición: no acreditan llegada, finalización, identidad o autorización. Abrir Atendiendo sin llegada o Completada sobre una reserva Confirmada debe mostrar la situación actual y recuperación, sin inventar datos ni actualizar la reserva por navegación.

Si no existe todavía selección desde la agenda, /operacion/reserva/llegada puede iniciar una referencia explícita de la reserva de muestra #208. Las demás vistas reutilizan esa misma selección y estado en memoria; no fabrican llegada/finalización para encajar con el frame. Un ID explícito inexistente/ajeno debe mostrar ausencia de información, nunca sustituirse silenciosamente por #208.

## 5. Datos y reloj de muestra

Referencia: restaurante La Mesa Verde, reserva #208, cliente Ana Pérez (ejemplo), 24 oct 2026 · 19:00–20:30, Mesa 04 · 4 comensales, nota «Preferimos una mesa junto a la ventana.».

Modelo mínimo: ID de reserva/restaurante, estado conocido, cliente disponible, inicio y fin previstos, mesa, comensales, notas opcionales, arrivedAt y completedAt opcionales. Mantener instantes comparables con offset/zona confirmada y representación local legible. No comparar textos «19:00» sin fecha.

El recorrido local puede empezar Confirmada sin llegada, con reloj de muestra 24 oct 2026 · 19:05 en America/Lima. Identificar este reloj como muestra. Registrar llegada y completar en ese instante está permitido: el reporte no exige esperar al fin previsto ni una duración mínima de consumo. No simular espera mediante temporizadores ornamentales.

Para pruebas, permitir inyectar el instante actual desde fixtures: antes del inicio, exactamente en el inicio, antes de la tolerancia y en su límite. No añadir controles de producto para manipular tiempo, datos o estados artificialmente.

Conservar siempre ID, cliente, horario previsto, mesa, comensales y notas. Una acción no reprograma la reserva ni cambia su fecha original para que resulte válida.

## 6. Reglas de llegada y tolerancia

La referencia compartida de US26 establece tolerancia de 15 minutos desde el inicio para reservas Confirmadas sin llegada. US25 debe respetarla al permitir el registro, sin implementar el proceso automático de expiración.

Sea inicio el instante previsto y límite = inicio + 15 minutos:
- Llegada registrable si la reserva está Confirmada, no tiene llegada y el instante de acción es estrictamente anterior al límite.
- Puede registrarse antes de inicio: los criterios no establecen una ventana mínima anterior. No inventarla.
- En el instante exacto del límite ya venció la tolerancia. Rechazar sin registrar una llegada tardía ni reactivar la reserva.
- Si ya existe llegada, conservar el valor original y comunicar que ya fue registrada; no sustituirla por el instante de reintento.
- Pendiente, Rechazada, Cancelada, Expirada o Completada no permiten un nuevo registro de llegada.

Una llegada válida conserva el estado Confirmada y guarda arrivedAt con fecha y hora. No confundir una etiqueta de atención en curso con una transición de enum.

Si la tolerancia venció sin llegada y el fixture aún dice Confirmada, rechazar y explicar el vencimiento; no ejecutar automáticamente la transición a Expirada dentro de US25. En integración, el servidor devuelve el estado que corresponde. Una reserva que ya tiene llegada oportuna no vence por ausencia de llegada al cruzar el límite.

Datos temporales ausentes o incoherentes no se interpretan como permiso para avanzar. No mostrar una llegada futura o tardía inventada para habilitar finalización.

## 7. Reglas de finalización

Completar requiere reserva propia Confirmada, llegada previamente registrada y actual >= inicio. Exactamente en el inicio ya se permite completar; antes, se rechaza sin cambiar reserva ni timestamps.

Resultado válido: estado Completada y completedAt con fecha y hora de la acción. Conservar arrivedAt original y datos de la reserva. No exigir alcanzar fin previsto, pago, pedido asociado u otra condición comercial no documentada.

Sin llegada: solicitar registrarla primero. Estado no Confirmada: rechazar. Completada no puede completarse otra vez ni volver a Confirmada; conservar su fecha de finalización. Otros estados finales tampoco admiten acciones de atención desde esta historia.

La tolerancia se comprueba para registrar llegada sin asistencia; no debe impedir completar después del límite una reserva cuya llegada fue válida y oportuna.

## 8. Confirmaciones e interacción

Dos acciones con MatDialog: «Simular llegada» y «Simular finalización». Cada diálogo muestra ID, estado actual, operación prevista y reloj de muestra. Aviso cercano: «Solo se modifica la muestra local. No se registran operaciones en el restaurante ni se envían avisos.».

Abrir no cambia datos. «Volver sin cambios» y Escape conservan todos los campos y devuelven foco al origen. Foco inicial en la opción segura, confinamiento de foco y protección frente a doble confirmación; bloquear otras operaciones mientras se resuelve la acción.

Revalidar selección, pertenencia, estado, timestamps e instante actual al abrir y al confirmar. Si se cruza el límite o cambia la reserva mientras está abierto el diálogo, rechazar la intención anterior sin fabricar otra operación. No avanzar automáticamente de llegada a finalización por un doble clic.

En integración posterior, etiquetas «Registrar llegada» y «Completar reserva», con resultado respaldado por servidor. En muestra, mensajes explícitos como «Llegada de muestra registrada» y «Reserva completada en la muestra», sin afirmar notificación o liberación real.

## 9. Presentación de las tres vistas

### Llegada

Título «Tu mesa ya está confirmada» cuando corresponda; detalle de reserva, estado Confirmada, inicio previsto y advertencia de tolerancia. Acción de llegada solo para condiciones válidas; si está bloqueada, explicar la condición y permitir consulta/retorno.

### Atención

Título «Disfrutando del servicio» cuando haya llegada válida. Mostrar estado Confirmada y etiqueta informativa «Llegada registrada», fecha/hora de llegada e inicio previsto. Ayuda: no completar antes del inicio. Acción de finalización según reglas; no volver a ofrecer llegada como si faltara.

### Completada

Título «Una experiencia completada», estado Completada, arrivedAt y completedAt con fecha/hora, mismos datos de la reserva y retorno «Volver a la agenda». Sin acciones de nueva llegada/finalización ni liberación por hacer clic en el retorno.

Para selección/etapa incompatible, mostrar el estado real y enlace hacia la vista apropiada. No conservar títulos que afirmen confirmación o atención cuando el estado consultado no corresponda.

## 10. Selección, errores e integración posterior

Una única colección en memoria para el recorrido. Validar IDs y restaurante en consulta y acciones; history.state puede transportar una referencia local reconocida, pero no autoriza ni aporta un registro confiable. El retorno no debe cambiar reserva, mesa o cliente.

Atrás/adelante no revierten ni repiten acciones. Recargar puede reiniciar la muestra; explicarlo y nunca restaurar timestamps desde ?vista=. No guardar datos del cliente o dirección/identidad operativa en localStorage o en parámetros inventados.

Estados previstos:
- Carga inicial sin acciones habilitadas ni datos ficticios presentados como respuesta nueva.
- Error de consulta o lectura anterior: informar y bloquear escrituras sobre datos no confirmados como actuales.
- Actualización pendiente: feedback accesible y sin envíos duplicados.
- Rechazo de regla: mensaje concreto, conservación de estado y registro original.
- Error de actualización: conservar el último resultado confirmado; permitir revisar/reconsultar sin éxito falso.
- Reserva inexistente/ajena: no mostrar datos ni aplicar una acción a otra reserva.
- Datos temporales incompletos: explicar la limitación y no habilitar una operación por defecto.

Antes de integrar, confirmar endpoints, identificación, autorización, enums, campos horarios, reloj del servidor, concurrencia y errores. El servidor es autoridad para tolerancia y timestamps; no confiar en la hora del navegador para la aceptación definitiva. No repetir ciegamente una escritura cuyo resultado sea incierto.

US25 exige notificación real al registrar llegada y completar. Un mensaje local no acredita generación ni entrega de ese aviso. La disponibilidad/liberación de mesa depende de reglas y operaciones del servidor: no declarar que se actualizó desde una demostración ni desde un enlace de retorno.

## 11. Estilo, arquitectura y accesibilidad

Rutas hijas, componentes standalone .ts/.html/.css, @if/@for con track y routerLink. Angular Material para tarjetas, botones, diálogo y carga. Reactive Forms si se incorpora un formulario necesario; no añadir campos de reserva nueva o cobro.

Reutilizar recursos y componentes adecuados del marco operativo. Si se generaliza un encabezado/menú existente, limitarlo a admitir el contexto Reservas y mantener Pedidos/Cocina intactos; no activar por arrastre otras pantallas o modificar su reparto. No duplicar un layout completo si el existente puede configurarse para este uso.

Tokens --rp-* y estilo de aplicación del SPEC común; fuentes/assets locales verificados. Evitar selectores internos de Material, ::ng-deep, dependencias nuevas y ocultar overflow global.

Un h1 por vista, estado con texto y color, fechas con zona/fecha legibles, botones con nombre específico por reserva y mensajes asociados al contexto. Teclado, foco visible, diálogo accesible, Escape y foco tras resultado o rechazo. Anuncios moderados sin releer toda la ficha.

Comparar 1440/390 con Figma y comprobar 320/768/1280, zoom 200 %, nombres/notas largos y menú móvil. Omitir RP / 081–083 y perfil ficticio de administradora; identificar muestra y ausencia de sesión conectada.

Heurísticas de [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/), ya consultadas: visibilidad de estado y fechas, lenguaje familiar, prevención de duplicados/acciones fuera de plazo, cancelación sin cambios, consistencia entre vistas y recuperación de errores. No equivale a una evaluación con usuarios.

## 12. Trazabilidad y verificaciones previstas

| Criterio | Evidencia local prevista | Pendiente de integración |
| --- | --- | --- |
| US25-CA01 | Llegada válida conserva Confirmada y fecha/hora | Registro y notificación reales |
| US25-CA02 | Repetición conserva arrivedAt original | Rechazo autoritativo y concurrencia |
| US25-CA03 | No confirmada o tolerancia vencida rechazada | Reloj/estado del servidor |
| US25-CA04 | Finalización válida cambia a Completada y conserva fechas | Operación y aviso reales |
| US25-CA05 | Sin llegada impide completar | Validación API |
| US25-CA06 | Antes del inicio rechaza; exactamente en inicio permite | Comparación temporal autoritativa |
| US25-CA07 | Fixture ajeno/inexistente sin datos ni cambios | Autorización y aislamiento reales |

Antes de cerrar implementación:
1. npm.cmd run check y npm.cmd run build, conservando los 120 escenarios.
2. Pruebas significativas de reglas con reloj controlado: llegada antes/en inicio, límite menos un instante, límite exacto y después; repetición, estados inválidos y pertenencia.
3. Completar sin llegada, antes del inicio, exactamente en inicio y después; llegada oportuna seguida de finalización después del límite. Verificar ambos timestamps y datos intactos.
4. Cancelar cada diálogo, Escape, doble confirmación y cambios de estado/reloj entre apertura y aceptación; no modificar otra reserva ni el registro original.
5. Tres rutas, selección explícita, etapa incompatible, atrás/adelante y recarga sin operaciones implícitas; retorno a agenda sin disparar finalización.
6. Carga, lectura anterior, error de consulta/actualización, recuperación y datos horarios incompletos, sin éxito falso ni exposición de otra reserva.
7. Cinco anchos, zoom, teclado, foco, textos largos y comparación con Figma. Si cambia un marco compartido, verificar también Pedidos/Cocina.
8. Confirmar ausencia de API, avisos y disponibilidad real modificada en fase local. Documentar resultados efectivamente ejecutados.

Este commit documental comprueba siete criterios íntegros, referencias, rutas, separación de US26 y estructura. No requiere build sin cambios de código/configuración. No marcar pantallas implementadas ni S2-TSK-054 terminada por crear el SPEC.

## 13. Commits previstos

Documento actual:
- Título: docs(us25): define la llegada y finalización de reservas
- Descripción: Especifica las acciones de US25 y sus siete criterios de aceptación. Define tolerancia, fechas, registro de llegada, finalización, confirmaciones, rechazos y conservación de la reserva. Incluye rutas hijas, Angular Material, referencias Figma y verificaciones; mantiene pendientes API, notificaciones y disponibilidad real.

Implementación posterior:
- Título: feat(us25): implementa la llegada y finalización de reservas
- Alcance: recorrido y validaciones de muestra, sin integración ni expiración automática de US26.

No crear commit, push, PR ni despliegue al preparar este archivo.

## 14. Criterios originales completos

### US25 — Registro de llegada y finalización de reservas

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 75, 76.

Como dueño o administrador del restaurante, quiero registrar la llegada de los comensales y completar sus reservas para llevar el control de las visitas efectivamente atendidas.

#### US25-CA01 — Llegada registrada

Escenario 1: Llegada registrada Dado que la reserva está Confirmada y aún no venció la tolerancia de llegada. Cuando el usuario registra la llegada de los comensales. Entonces el sistema conserva la fecha y hora de llegada y genera una notificación para el cliente.

#### US25-CA02 — Llegada repetida

Escenario 2: Llegada repetida Dado que la reserva ya tiene una llegada registrada. Cuando el usuario intenta registrarla otra vez. Entonces el sistema informa que la llegada ya fue registrada y conserva el registro original.

#### US25-CA03 — Reserva no confirmada o vencida

Escenario 3: Reserva no confirmada o vencida Dado que la reserva no está Confirmada o ya venció la tolerancia sin llegada. Cuando el usuario intenta registrar la llegada. Entonces el sistema rechaza el registro y conserva el estado que corresponde a la reserva.

#### US25-CA04 — Atención completada

Escenario 4: Atención completada Dado que la reserva está Confirmada, tiene llegada registrada y ya llegó su hora de inicio. Cuando el usuario completa la atención. Entonces el sistema cambia la reserva a Completada, conserva la fecha y hora de finalización y genera una notificación para el cliente.

#### US25-CA05 — Finalización sin llegada

Escenario 5: Finalización sin llegada Dado que la reserva no tiene llegada registrada. Cuando el usuario intenta completarla. Entonces el sistema solicita registrar la llegada antes de completar la atención.

#### US25-CA06 — Finalización anticipada

Escenario 6: Finalización anticipada Dado que la reserva tiene llegada registrada pero aún no llega su hora de inicio. Cuando el usuario intenta completarla. Entonces el sistema rechaza la finalización anticipada y mantiene la reserva.

#### US25-CA07 — Reserva de otro local

Escenario 7: Reserva de otro local Dado que la reserva pertenece a otro restaurante. Cuando el usuario intenta registrar su llegada o completarla. Entonces el sistema impide la operación y conserva la reserva.

