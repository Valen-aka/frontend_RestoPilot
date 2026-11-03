# SPEC — Integración API de reservas expiradas (US26)

Fecha: 03/11/2026. Rama: feature/reserva-expirada-api.
Base frontend: origin/develop actualizado, 5b351c7; incluye la integración API de US25.
Estado: especificación preparada; implementación y aceptación integrada pendientes.

## 1. Objetivo y fuentes

Integrar S2-TSK-056 y completar la presentación de S2-TSK-055 con consultas reales: detalle e historial del cliente y del restaurante, estado EXPIRADA, fecha registrada y disponibilidad actualizada. Una reserva expirada debe liberar la mesa para su horario; la expiración y sus consecuencias las ejecuta el servidor.

Leer [AGENTS.md](../../../AGENTS.md), [SPEC común](../../../SPEC.md), [US26 y sus cinco criterios](../us26/SPEC.md), [US25 API](../operacion-reserva-atencion-api/SPEC.md), [guía compartida de reservas](../../GUIA-INTEGRACION-RESERVAS.md) y [asignación del equipo](../../ASIGNACION-EQUIPO.md). Las restricciones de las muestras anteriores se conservan como historial y no impiden esta fase autorizada.

Contrato comprobado en el backend local: ReservaController, ReservaService, ReservaResponseDTO, MesaDisponibilidadDTO, ReservaRepository, ReglasCicloReserva, ExpiracionReservasService, ExpiracionReservasJob y TimeConfig. Antes de implementar, contrastar con la rama que se ejecutará. Las comprobaciones de este documento son de código; no se realizaron operaciones con reservas reales del equipo.

Referencia visual: [Figma original](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92), con los frames desktop/mobile registrados en US26. No se acredita una nueva inspección visual en esta entrega documental ni se autoriza reconstruir el diseño.

## 2. Alcance y entregas

1. SPEC y commit documental.
2. Implementación de US26 y commit de frontend.
3. Ajuste mínimo necesario de consultas/pruebas en backend y commit propio.
4. PR hacia develop con cambios, evidencia y pendientes reales.

Incluye lectura de detalle/listados, selección por ID, sesión/aislamiento, actualización manual, información de expiración y consulta puntual de disponibilidad del horario de la reserva. Reutilizar el trabajo API de US25.

Excluye crear/confirmar/rechazar/reprogramar/cancelar reservas, construir toda la agenda US29 o todo US07, plano de mesas, notificaciones como módulo, pagos, configuración del job, despliegue y Supabase. No añadir funciones de expiración al navegador ni activar cambios de estado por abrir una pantalla.

## 3. Base frontend y componentes

ReservaExpiradaStore utiliza ReservaMuestraStore, contextos y selecciones de ejemplo. Las vistas ya tienen tabla, detalle y variantes cliente/operación, pero no consultan datos reales. La fase API reemplaza esa fuente por respuestas validadas, sin escribir sobre las colecciones de muestra.

Reutilizar ReservaService, ReservaResponse, readReserva, parseReservaId, AuthService, API_SESSION, interceptor JWT, environment.apiUrl y el proveedor HTTP existente. Ampliar el servicio para listados y disponibilidad; no crear otra sesión o cliente HTTP.

El store de consulta de US26 debe separar contexto, detalle, listado y disponibilidad, con sus estados de carga/error y versiones de petición. No usar el store de mutaciones de US25 como autenticación ni su reserva seleccionada como resultado de otra consulta. Ambos módulos comparten contrato y backend, no fixtures ni supuestos de selección.

Mantener componentes standalone, archivos separados, Angular Material, Reactive Forms para parámetros de consulta, @if/@for con track estable y estilos/tokens existentes. Preservar el inventario, sus clases y responsables. No añadir dependencias.

## 4. Sesión y permisos

Cliente: CLIENTE vigente; listados propios y detalle con clienteId igual al subject de su sesión. Operación: ADMINISTRADOR/DUENO vigente, restauranteId positivo y todas las respuestas del mismo local. La comprobación frontend no sustituye autorización backend.

Proteger /cliente/reservas y /operacion/reservas en el alcance de estas vistas de consulta. En /cliente/reserva y /operacion/reserva, aplicar el guard correspondiente solo a sus variantes expiradas, coordinado con la variante completada de US25 y sin apropiarse de detalles de otros módulos.

Sin sesión, login con retorno interno seguro. Rol/local incompatible, acceso restringido sin consultas ni muestras. Limpiar datos y cancelar peticiones al cerrar/cambiar sesión, cuenta, restaurante o contexto. Una respuesta tardía no debe poblar el detalle o historial de otra cuenta.

Un listado o detalle que devuelve una fila ajena es incompatible: no filtrar silenciosamente para aparentar éxito. No mostrar datos personales de esa fila. El GET de un detalle ajeno actualmente puede devolver 400 por BusinessRuleException; las consultas deben manejarlo limpiando esa lectura, además de 401/403/404.

## 5. Contratos HTTP existentes

Rutas relativas a environment.apiUrl, que contiene /api. El interceptor agrega Bearer.

| Consulta | Petición | Respuesta |
| --- | --- | --- |
| Detalle | GET /reservas/{id} | ReservaResponseDTO |
| Historial del usuario | GET /reservas/me | {mensaje,reservas} |
| Listado del restaurante | GET /reservas | {mensaje,reservas} |
| Filtro administrativo opcional existente | GET /reservas?fecha=YYYY-MM-DD&estado=EXPIRADA | {mensaje,reservas} |
| Disponibilidad | GET /reservas/disponibilidad?restauranteId=ID&fecha=YYYY-MM-DD&horaInicio=HH:mm:ss&horaFin=HH:mm:ss&numeroComensales=N | {mensaje,mesas} |

Las respuestas de éxito son 200. Los listados son arrays dentro de reservas, no Page Spring ni el formato de pedidos. No inventar page/size, totales del servidor ni parámetros de cliente/restaurante que no existan en el contrato de listado.

ReservaResponse conserva identidad de reserva/mesa/local/cliente, fecha, horaInicio/horaFin, comensales, estado, notas, creadoEn, motivoRechazo, llegadaRegistradaEn, completadaEn, expiradaEn y mensaje opcional. US25 añade fechaHoraServidor, puedeRegistrarLlegada y puedeCompletar. No retirar esos datos ni introducir otro enum incompatible.

MesaDisponibilidadDTO contiene mesaId, numero, capacidad, coordenadaX, coordenadaY y disponible. Mantener mesaId separado de numero. Una respuesta vacía, una mesa ausente o una petición fallida no significa disponible=true.

Validar estructura, IDs positivos, enums, fechas y duplicados en listados; mantener el validador de detalle compartido. No completar una respuesta incompleta con #190/#207/#208. expiradaEn es la marca realmente guardada por el backend, no el límite calculado ni el reloj actual del navegador.

LocalDate/LocalTime/LocalDateTime expresan el negocio en America/Lima, como TimeConfig. No añadir Z ni convertir automáticamente como UTC. Preservar fechas de llegada/finalización y nombres/datos confirmados.

## 6. Expiración autoritativa y presentación

| Reserva | Momento evaluado por servidor | Resultado |
| --- | --- | --- |
| PENDIENTE | Antes del inicio | Se conserva |
| PENDIENTE | Desde el inicio exacto | EXPIRADA |
| CONFIRMADA sin llegada | Antes de inicio + 15 minutos | Se conserva |
| CONFIRMADA sin llegada | Desde inicio + 15 minutos exactos | EXPIRADA |
| CONFIRMADA con llegada | Después de ese límite | No expira por falta de llegada |
| COMPLETADA/CANCELADA/RECHAZADA/EXPIRADA | Cualquier momento | No se reabre por esta regla |

El job existente evalúa periódicamente con intervalo configurable y las consultas relevantes también llaman a expiración. El job no garantiza que la marca expiradaEn coincida exactamente con el instante límite; puede registrar después. No presentar una cuenta regresiva de Angular como prueba de expiración ejecutada.

ExpiracionReservasService guarda estado/fecha y notifica bajo bloqueo, en transacción independiente. Repetir consultas o un rechazo posterior no debe duplicar avisos ni revertir el vencimiento. No enviar PATCH/PUT/DELETE desde estas pantallas para simular esa tarea.

Un detalle EXPIRADA muestra el estado y expiradaEn conservando fecha/horario, mesa, comensales y datos disponibles. No habilitar llegada, completar, confirmar, cancelar o reprogramar desde la vista. «Hacer otra reserva» navega al módulo existente sin reactivar ni reutilizar el ID expirado.

La API actual no informa el estado previo ni un motivo específico de expiración. No derivar «sin confirmación» o «inasistencia» comparando expiradaEn con el horario: un proceso tardío no permite saber esa causa. Usar texto neutral de reserva vencida; no reutilizar motivoRechazo como causa de expiración. No hace falta añadir un campo nuevo solo para inventar esa explicación.

EXPIRADA sin fecha registrada se trata como información incompleta, con aviso de fecha no disponible y reconsulta; nunca asignar fecha aproximada. No esconder información válida de la reserva por rellenar la marca con un fixture.

## 7. Liberación y disponibilidad: regla confirmada

Al expirar, la reserva deja de bloquear la mesa para su fecha/horario. Con esa única ocupación y sin otra reserva bloqueante, la API debe devolver disponible=true para esa mesa y ese rango. Esta condición es parte de la aceptación, no solo un texto visual.

La consulta considera PENDIENTE/CONFIRMADA que se solapen con el rango: inicioExistente < finConsultado y finExistente > inicioConsultado. Si posteriormente otra reserva ocupa un horario solapado, la API reflejará esa nueva ocupación. La reserva expirada original no se reactiva.

Consultar disponibilidad a petición del usuario desde el detalle, usando restaurante, fecha, inicio/fin y comensales del registro confirmado. No lanzar una petición por fila. Reconsultar después de actualizar una reserva cuya expiración se acaba de confirmar. Distinguir la carga/error de disponibilidad del éxito de la consulta de reserva.

Mostrar el resultado de esa mesa devuelto por la API como lectura de disponibilidad, sin transformarlo en una nueva reserva ni prometer que continuará libre al intentar reservar. Una consulta falla o no devuelve esa mesa: informar que no pudo verificarse. No inferir disponibilidad por borrar una fila o por una fecha del navegador.

### 7.1. Brecha detectada y ajuste previsto del backend

consultarDisponibilidad actualmente llama a validarRestauranteYHorario, que rechaza fechas pasadas y horas de inicio anteriores al reloj del servidor. Una confirmada que expira quince minutos después del inicio ya no puede consultar su rango original con esa validación; ese rechazo no demuestra que la mesa siga ocupada.

La implementación separará la validación de la consulta de solo lectura de la validación para crear/reprogramar: GET de disponibilidad podrá consultar el rango histórico válido de una reserva expirada para comprobar la liberación. Mantener validación de restaurante, fecha/horas presentes, inicio anterior a fin, rango/horario comercial aplicable y comensales positivos. No permitir crear o reprogramar reservas en el pasado ni retirar esas restricciones de las operaciones de escritura.

Conservar el endpoint y MesaDisponibilidadDTO existentes; no añadir un endpoint ficticio de «liberar mesa» ni una migración. Registrar la ampliación de la semántica de lectura y probar compatibilidad con consultas de horarios futuros y rechazo de escrituras pasadas. Los cambios del backend tendrán commit y pruebas propios.

## 8. Historial, selección y coherencia con US25

Conservar las rutas /cliente/reservas, /operacion/reservas, /cliente/reserva?vista=cliente-reserva-expirada y /operacion/reserva?vista=op-reserva-expirada, con reservaId validado en los enlaces de detalle. history.state puede conservar foco/origen, pero un ID inválido explícito no se sustituye con una muestra.

Los listados se alimentan de sus endpoints propios y muestran las filas recibidas necesarias para conservar contexto, estado y fecha de expiración. Esto no implementa las acciones generales de US07/US29 ni añade una agenda completa. Conservar el orden de la respuesta; si se ofrece un filtro local, identificarlo como filtro de la colección cargada, sin afirmar paginación de servidor.

Una fila EXPIRADA abre exactamente su ID, mesa y fechas. Enlace directo y recarga consultan al servidor aunque el ID no figure en el listado cargado. No asumir inexistencia a partir de un filtro local.

Una reserva Confirmada/Completada recibida en una ruta de expiración no se transforma en Expirada. Mostrar su estado real y el contexto de consulta; para atención operativa, usar los enlaces US25 con reservaId. No inventar una implementación de un detalle de otra historia por añadir ese enlace.

Tras completar una reserva mediante US25, actualizar el listado y reabrir el mismo ID debe conservar COMPLETADA y sus marcas. Una reserva llegada a tiempo no cambia a EXPIRADA al cruzar el límite. No mezclar resultados con ReservaMuestraStore ni con una selección compartida por defecto.

## 9. Estados de consulta, errores y accesibilidad

Separar carga inicial, vacío real, actualización manual, lectura anterior y error de contrato/acceso. Conservar datos anteriores solo cuando pertenezcan a la misma sesión/contexto e identificarlos como desactualizados. No anunciar un nuevo vencimiento o una liberación de mesa si la consulta falla.

400 en detalle ajeno, 401/403/404 y fila fuera de contexto eliminan datos protegidos; no mostrarlos como vacío global del historial. Un error de disponibilidad conserva el estado confirmado de la reserva y deja esa disponibilidad sin verificar. No depender de mensaje libre, de que todos los errores sean JSON ni de que incluyan siempre el mismo campo error.

Cancelar y descartar respuestas antiguas al cambiar ID, contexto o cuenta. No registrar tokens ni información personal en logs/URLs; reservaId es el identificador de navegación, no la autorización.

Usar tabla y controles Material, texto además de color, foco visible al volver a la fila, anuncios de estado moderados y fechas legibles. Conservar recursos/estilos existentes y comprobar 320/390/768/1440, zoom y nombres largos, sin ocultar desbordamiento global. No introducir temporizadores que escriban estados en Angular.

## 10. Aceptación y verificación

| Criterio | Evidencia exigida |
| --- | --- |
| US26-CA01 | PENDIENTE se conserva antes del inicio y expira desde el inicio; historial/fecha, mesa liberada y aviso único |
| US26-CA02 | CONFIRMADA sin llegada se conserva antes del límite y expira desde inicio + 15; disponibilidad de su rango consultable y libre sin otro bloqueo |
| US26-CA03 | Tolerancia vigente permite llegada según indicadores de US25; Angular no adelanta EXPIRADA |
| US26-CA04 | Llegada registrada conserva CONFIRMADA/COMPLETADA, fechas y coherencia entre atención, historial y detalle |
| US26-CA05 | Peticiones tardías de confirmar/reprogramar/cancelar/completar no reviven una expirada ni restablecen su bloqueo |

Frontend: contratos de ambos listados/disponibilidad; aislamiento entre cuentas/locales; IDs distintos y URL inválida; vacío/error inicial/refresco; respuestas tardías; expiración sin motivo disponible; metadata incompleta; estado real diferente de la variante; disponibilidad fallida sin falso libre; cero mutaciones desde US26.

Backend: Clock fijo para instante anterior/exacto/posterior a inicio y tolerancia; job/consulta repetidos y concurrentes sin avisos duplicados; expiración persistida aunque una operación tardía sea rechazada; disponibilidad libre tras expirar y ocupación si otra reserva bloquea; consulta histórica permitida sin habilitar escrituras pasadas; regresión US25 y reglas existentes.

Recorrido conjunto mínimo: llegada → completar US25 → historial → detalle del mismo ID; pendiente/confirmada que vence → actualizar historial → detalle → consultar disponibilidad. Usar backend aislado con JWT/H2 para reglas/persistencia y frontend real contra HTTP controlado para fallos; separar esas evidencias de la aceptación en PostgreSQL del equipo.

Ejecutar check/build y pruebas pertinentes al implementar. La entrega documental verifica referencias y estructura; no acredita HTTP, job ejecutado, disponibilidad comprobada, aceptación o despliegue.

## 11. Commits propuestos y estado

- Documentación: docs(us26): especifica la integración API de reservas expiradas.
- Frontend: feat(us26): integra reservas expiradas y disponibilidad con la API.
- Backend: feat(us26): permite verificar disponibilidad tras la expiración de reservas.

Esta entrega crea únicamente el SPEC y sus referencias. No implementa listados, disponibilidad, guards o cambios del backend. No se crean commits, push ni PR automáticamente. La siguiente entrega implementará US26 con las pruebas aquí definidas.
