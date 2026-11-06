# US29 — Agenda y gestión administrativa de reservas

Rama: `feature/operacion-reservas-agenda`. Tareas S2-TSK-027 y S2-TSK-028. Base: origin/develop; los PR pendientes de otras historias no se incorporan automáticamente.

Como dueño o administrador quiero consultar las reservas de mi restaurante, filtrarlas y gestionar los cambios permitidos para organizar la atención.

## Referencias y pantallas

Leer AGENTS.md y el SPEC común. La copia Figma indicada por el usuario (`sRxKEwFdrMKfXPosGFvoHc`) se consultó por MCP: agenda 91:51761/91:51957, detalle 89:44726/89:44875, edición 89:44983/89:45130 y cancelación 89:44304/89:44424. Adaptar la composición a Angular Material y los tokens existentes. Reutilizar WorkspaceShell y el recurso de marca local. No introducir información de muestra en las vistas integradas.

Conservar rutas hijas y slugs: op-reservas `/operacion/reservas`, op-reserva-detalle `/operacion/reserva`, op-reserva-editar y op-reserva-cancelar. La reserva se identifica por `reservaId`, con `id` legado solo si reservaId no existe. Un ID explícito inválido no usa otra reserva. Conservar variantes existentes de US25/US26 y sus rutas de llegada, finalización y expiración.

## Contratos existentes

| Operación | Contrato |
|---|---|
| Agenda | GET `/api/reservas`, parámetros opcionales `fecha=yyyy-MM-dd`, `estado=PENDIENTE/CONFIRMADA/RECHAZADA/CANCELADA/EXPIRADA/COMPLETADA`. Respuesta `{mensaje,reservas:ReservaResponse[]}`. Conservar el orden devuelto. |
| Detalle | GET `/api/reservas/{id}`. Verificar ID y restaurante de la sesión antes de mostrarlo. |
| Contexto | GET `/api/restaurantes/{id}` del restaurante autenticado. |
| Disponibilidad | GET `/api/reservas/disponibilidad` con restauranteId, fecha, horaInicio, horaFin y numeroComensales. Devuelve mensaje y mesas con mesaId, numero, capacidad y disponible. |
| Reprogramación | PUT `/api/reservas/{id}`: `{mesaId,restauranteId,fecha,horaInicio,horaFin,numeroComensales,notas}`. Respuesta 200 ReservaResponse. Siempre vuelve a PENDIENTE. |
| Cancelación | PATCH `/api/reservas/{id}/cancelar`, `{motivo:string}` opcional; 200 ReservaResponse CANCELADA. |
| Evaluación existente compartida | PATCH `/api/reservas/{id}/estado`, `{estado:CONFIRMADA/RECHAZADA,motivo}`. La acción del detalle compartido debe usar API y no el store ilustrativo de US17. No se declara la historia US17 completa por esta conexión. |

Reutilizar ReservaService, AuthService/API_SESSION e interceptor JWT. No enviar clienteId ni permitir cambiar el restaurante. Los guards del navegador no sustituyen la autorización del servidor.

## Reglas

1. Agenda solo del restaurante asignado a dueño/administrador. Filtros por fecha, estado, ambos o ninguno; conservarlos en URL al abrir detalle y volver. Consultar API al aplicar/limpiar/actualizar; no filtrar muestras locales. Vacío no es error. Rechazar filas ajenas, IDs duplicados o respuestas incompatibles con los filtros.
2. Mostrar fecha, horas, mesa, comensales, cliente, estado, notas, motivo de rechazo y fechas de creación/llegada/finalización/expiración cuando existan. No deducir EXPIRADA ni liberar mesas desde el reloj del navegador. La vista consulta el estado real.
3. Editar/cancelar únicamente PENDIENTE o CONFIRMADA sin llegada. Estados terminales y llegada bloquean los controles; el servidor vuelve a validar concurrencia. No aplicar el límite de más de dos horas del cliente a la gestión del personal.
4. Reprogramar: fecha ISO válida, horas válidas e inicio anterior a fin; comensales enteros positivos hasta Integer.MAX_VALUE; notas máximo 500. Consultar disponibilidad real del período y comensales antes de guardar. Cambiar esos campos invalida la consulta y selección anterior. El servidor valida fechas pasadas, atención, capacidad y solapamiento.
5. La API de disponibilidad no excluye la reserva actual. Si la mesa original aparece ocupada, identificarla como mesa actual con ocupación a verificar al guardar; puede seleccionarse si la API la devuelve y tiene capacidad suficiente, sin anunciarla disponible. Las otras mesas ocupadas o insuficientes no se pueden seleccionar. El PUT excluye la propia reserva al validar solapamiento y es la decisión definitiva. No inventar un parámetro de exclusión no soportado.
6. Cancelar: motivo opcional máximo 300 caracteres y confirmación con MatDialog. Informar que notas previas y motivo combinados están sujetos al límite del servidor. Escape/cancelar no escribe y devuelve foco; una URL no cancela automáticamente. Conservar historial y refrescar detalle/agenda tras respuesta confirmada.
7. La evaluación pendiente del detalle compartido usa HTTP real, motivo obligatorio para rechazar y nunca anuncia notificaciones por una operación local. No implementar nuevas pantallas de US17 fuera del detalle compartido.
8. Bloquear doble envío y salida de la ruta mientras se escribe. Conservar formulario ante 400/409 y consultar estado actual tras conflicto, mostrando si cambió. Si falla esa consulta, bloquear nuevas escrituras hasta verificar. Pérdida de respuesta/5xx/contrato incoherente no es éxito: exigir reconsulta, sin reintentar automáticamente la escritura. Si se confirmó el cambio pero falló el refresco, explicarlo y evitar repetirlo.
9. Limpiar información al salir/cambiar cuenta/local; cancelar respuestas tardías. ID ajeno/inexistente, 401/403 y errores de contrato no muestran otra reserva ni datos previamente seleccionados como actuales.

## Criterios y verificación

| Criterio | Evidencia requerida |
|---|---|
| CA01 | Agenda propia y orden API, incluyendo estados terminales. |
| CA02 | Fecha, estado, ambos y limpieza llegan a la API y se conservan al volver. |
| CA03 | Detalle completo de la reserva seleccionada y enlaces de atención coherentes. |
| CA04 | Vacío explícito y recuperación de errores sin muestras. |
| CA05 | Rechazo de ID ajeno/inválido y limpieza entre cuentas. |
| CA06 | Disponibilidad real, edición persistida a PENDIENTE y conflictos que conservan la reserva. |
| CA07 | Cancelación persistida, horario liberado y gestión sin frontera de dos horas del cliente. |

Verificar checker/build, regresiones de US25/US26 y modelos compartidos, navegador desktop/mobile (320/390/768/1440), teclado/foco, mensajes y errores controlados. Para escrituras reales usar backend y PostgreSQL local aislado, cuentas y reservas exclusivas; retirar la base al terminar sin modificar datos compartidos en Supabase. Registrar resultados y límites reales en docs/QA-US29.md. La integración de la pantalla de login y la verificación general del sprint conservan su alcance propio.
