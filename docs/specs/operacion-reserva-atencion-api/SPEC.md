# SPEC — Integración API de atención de reservas (US25)

Fecha: 03/11/2026. Rama: feature/operacion-reserva-atencion-api.
Base frontend: origin/develop actualizado, 5d6383e; incluye la integración previa de pedidos y cocina.
Estado: especificación preparada. Implementación y aceptación integrada pendientes.

## 1. Objetivo y fuentes

Integrar S2-TSK-054: registrar llegada y completar atención de reservas, mostrando estados y fechas confirmados por el servidor y habilitando controles coherentes con sus reglas. Conservar las pantallas de S2-TSK-053, componentes standalone, rutas hijas, Angular Material y estilos existentes.

Leer [AGENTS.md](../../../AGENTS.md), [SPEC común](../../../SPEC.md), [US25 y sus siete criterios](../us25/SPEC.md), [US26](../us26/SPEC.md), [asignación del equipo](../../ASIGNACION-EQUIPO.md) y [guía de integración de cocina](../../GUIA-INTEGRACION-COCINA.md). Este documento abre la fase API; las restricciones y evidencias de las muestras anteriores son históricas. No declara ninguna tarea Done.

Contrato revisado en el backend local: ReservaController, AtencionReservaService, ReservaService, ReglasCicloReserva, ExpiracionReservasService, ReservaResponseDTO, ReservaMapper, EstadoReserva, TimeConfig y AccesoRestaurante. Revalidar estos contratos en la rama del backend que se ejecutará. No se ejecutaron operaciones HTTP sobre reservas del equipo al preparar este documento.

Referencia visual: [Figma original](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92), frames desktop/mobile documentados en US25. No se vuelve a acreditar su inspección en esta entrega documental. No rediseñar la interfaz ni atribuir a una captura las reglas reales del servidor.

## 2. Alcance y secuencia

1. Este SPEC y commit documental independiente.
2. Implementación US25, pruebas y commit de frontend.
3. Ajustes necesarios del contrato y pruebas en backend, con commit propio en ese repositorio.
4. PR de la rama hacia develop con alcance, evidencia y pendientes reales.

Incluye consulta de una reserva por ID real, ambas operaciones, fechas, disponibilidad de acciones, permisos por restaurante, carga/error, confirmaciones y recuperación. Reutilizar la sesión/HTTP compartidos de la base actual.

Excluye implementar la agenda administrativa completa, crear/confirmar/rechazar/cancelar/reprogramar reservas, historial del cliente, plano de mesas, pagos, autenticación completa, despliegue y conexión a Supabase. US26 no se integra en esta entrega; se respeta el estado EXPIRADA que ya devuelva el servidor.

No modificar componentes ajenos por el solo hecho de existir un enlace hacia ellos. La selección puede llegar por URL desde una pantalla que otro módulo implementará; eso no exige construir su listado.

## 3. Estado inicial y arquitectura

ReservaAtencionStore consulta ReservaMuestraStore y ejecuta updateAttendanceSample con un reloj de muestra. ReservaAtencionView puede abrir por defecto la reserva #208 y sus confirmaciones anuncian simulación. Nada de eso acredita S2-TSK-054.

La fase API debe usar un store de atención con datos HTTP y un ReservaService compartido, separado de las colecciones de muestra. Crear modelos/validadores de reserva compatibles con el DTO; no reutilizar un modelo de pedido por coincidencia de nombres. Los componentes consumen el store, no HttpClient directamente.

Reutilizar environment.apiUrl, el único proveedor HTTP, AuthService, API_SESSION, activeOperationSession y el interceptor JWT. No crear tokens, sesiones, restaurantes seleccionados o credenciales de demostración. El componente de marco CocinaShell admite contexto API: reutilizarlo sin acoplar el negocio de reservas a CocinaStore.

Conservar los IDs y responsables del manifiesto. No usar un resultado de check para declarar integración o aceptación. No añadir dependencias nuevas.

## 4. Autorización e identidad

Solo ADMINISTRADOR o DUENO vigente con restauranteId positivo puede operar. Proteger únicamente las rutas de atención de esta historia; no ampliar el guard de cocina para bloquear otros módulos ni usar su bloqueo de mutación como estado de reservas.

Sin sesión, redirigir al login existente con retorno interno seguro. Con rol/local inválido, mostrar acceso restringido sin HTTP ni muestras. El backend comprueba pertenencia: un ID, parámetro o nombre de restaurante visible no concede permisos.

Transportar reservaId validado por URL y conservarlo en cada etapa. Un valor ausente o inválido muestra selección necesaria y no genera consulta. No sustituirlo por #208 ni por la primera reserva de un array. Se admite history.state como compatibilidad de navegación; un parámetro explícito inválido nunca se reemplaza con ese estado.

Cancelar peticiones e invalidar datos al cambiar selección, cuenta, restaurante o sesión. Descartar respuestas tardías. Las acciones quedan bloqueadas durante confirmación/envío/verificación; abandonar la pantalla no debe duplicarlas ni producir navegación tardía a otra reserva.

## 5. Contratos HTTP actuales

Rutas relativas a environment.apiUrl, que ya contiene /api. Authorization: Bearer lo incorpora el interceptor.

| Operación | Petición | Éxito |
| --- | --- | --- |
| Consultar reserva | GET /reservas/{id} | 200, ReservaResponseDTO |
| Registrar llegada | PATCH /reservas/{id}/llegada | 200, ReservaResponseDTO con fecha de llegada |
| Completar atención | PATCH /reservas/{id}/completar | 200, ReservaResponseDTO con estado y fecha de finalización |

Ambos PATCH reciben el ID de ruta, sin DTO JSON ni nuevoEstado. No sustituirlos por /reservas/{id}/estado: ese endpoint confirma/rechaza solicitudes de otra historia.

ReservaResponseDTO contiene id, mesaId, mesaNumero, restauranteId, restauranteNombre, clienteId, clienteNombre, fecha, horaInicio, horaFin, numeroComensales, estado, notas, creadoEn, motivoRechazo, llegadaRegistradaEn, completadaEn, expiradaEn y mensaje. mensaje puede omitirse cuando es nulo; no es una clave para identificar el resultado.

Estados válidos: PENDIENTE, CONFIRMADA, RECHAZADA, CANCELADA, EXPIRADA, COMPLETADA. «Llegada registrada» y «Atendiendo» son presentaciones, no enums nuevos. La llegada conserva CONFIRMADA.

Validar IDs positivos, enums, estructura y fechas/horas antes de presentar datos o acciones. Comprobar que la respuesta es del ID solicitado y del restaurante autenticado. Mantener mesaNumero distinto de mesaId y mostrar los comensales reales; no completar datos faltantes con fixtures. Rechazar fechas incompatibles (por ejemplo COMPLETADA sin llegada/finalización), sin transformar el estado recibido en uno inventado.

fecha es LocalDate, horas son LocalTime y marcas temporales LocalDateTime. TimeConfig usa America/Lima. Preservar esa semántica: no añadir Z ni desplazar horarios de negocio como si fueran UTC. Mostrar ausencia de fecha como no registrada, no como fecha actual del navegador.

Existe GET /reservas?fecha=...&estado=... para el listado administrativo: devuelve {mensaje,reservas}, sin Page. No implementarlo para construir una agenda fuera del alcance. GET /reservas/me es otro contrato de listado, no el detalle ni la autoridad de atención operativa.

## 6. Reglas autoritativas y límites temporales

| Situación confirmada | Llegada | Completar |
| --- | --- | --- |
| CONFIRMADA, sin llegada, antes de inicio + 15 minutos | Permitida | Rechazo: falta llegada |
| CONFIRMADA, llegada registrada, antes del inicio | No repetir | Rechazo: finalización anticipada |
| CONFIRMADA, llegada registrada, desde el inicio | No repetir | Permitida |
| CONFIRMADA, sin llegada, desde inicio + 15 minutos | Rechazo/vencimiento | Rechazo |
| PENDIENTE o cualquier estado terminal | Rechazo | Rechazo |

El límite es estricto: exactamente inicio + 15 minutos ya está vencido. Exactamente en la hora de inicio se permite completar si existe llegada. No exigir esperar a horaFin. Una llegada ya registrada impide que la reserva expire por ausencia de llegada; no aplicar la tolerancia a una reserva ya atendida.

El código actual permite llegada antes del inicio y no define una antelación mínima ni exige que sea el mismo día. No inventar esas restricciones, ni trasladar las reglas de creación/reprogramación a una reserva confirmada que se está atendiendo.

El backend evalúa expiración antes de consultar/operar y puede persistir EXPIRADA en una transacción independiente aunque la acción tardía termine en 400. Un rechazo no implica que todo el estado previo permanezca igual. Reconsultar; no conservar CONFIRMADA como si el reloj del navegador pudiera revocar la expiración.

En llegada válida, conservar la marca original de llegada y estado CONFIRMADA. En finalización válida, conservar llegada, asignar COMPLETADA y completadaEn. No sobrescribir fechas por repetición. El servidor envía la notificación y actualiza la condición que bloquea disponibilidad; el frontend no libera mesas ni envía avisos por su cuenta.

### 6.1. Controles temporales: ampliación prevista del contrato

El DTO actual tiene fechas, pero no informa su reloj ni disponibilidad autoritativa de acciones. Para no depender del reloj del equipo ni del reloj fijo de muestra, la implementación incorporará estos campos aditivos a ReservaResponseDTO; todavía no existen:

| Campo previsto | Tipo | Significado |
| --- | --- | --- |
| fechaHoraServidor | LocalDateTime | Instante de evaluación con el mismo Clock del negocio |
| puedeRegistrarLlegada | boolean | Reserva confirmada, sin llegada y tolerancia no vencida |
| puedeCompletar | boolean | Reserva confirmada, con llegada y desde el inicio |

Calcular ambos indicadores a partir de una misma evaluación temporal y las mismas reglas usadas al operar. No crear otra máquina de estados ni modificar los límites del negocio. Son disponibilidad de negocio de esa lectura, no autorización por rol ni garantía de que una petición posterior sea aceptada.

Mantener estos datos consistentes en GET y ambos PATCH, sin retirar campos existentes ni cambiar endpoints. Usar las marcas temporales ya existentes; no requiere una migración. Las acciones del frontend exigen sesión/local, DTO coherente y el indicador afirmativo correspondiente. Mientras el backend compatible no esté disponible, mostrar una limitación recuperable y no habilitar acciones usando flags o fechas fabricados.

Actualizar consulta permite recoger el cambio temporal de «todavía no» a «permitida». No iniciar polling ni prometer una cuenta regresiva exacta. Aunque un indicador fuera true, el servidor vuelve a evaluar bajo bloqueo al recibir el PATCH.

## 7. Confirmación, envío y recuperación

Confirmar con diálogo Material que identifique reserva, mesa, fecha/horario y acción. Cancelar no envía PATCH y devuelve el foco. Bloquear dobles clics y acciones simultáneas. No adelantar estado ni fechas ni anunciar éxito antes de validar la respuesta del servidor.

Una llegada exitosa exige la misma reserva/local, CONFIRMADA y llegadaRegistradaEn no nula; no permitir que una respuesta repetida sobrescriba una llegada conocida. Completar exige COMPLETADA, llegada preservada y completadaEn no nula. Conservar horario, comensales y mesa confirmados, sin reconstruirlos desde muestras.

Después del éxito, actualizar la fuente operativa y navegar a la etapa coherente, conservando ID y origen. La desaparición del botón por el estado nuevo no debe cancelar esa navegación, como se comprobó en cocina. Reabrir o actualizar consulta no repite una operación.

400/409: explicar el rechazo y volver a consultar antes de habilitar otra acción. Red/timeout/5xx o respuesta incompatible: resultado incierto; no reintentar PATCH automáticamente. Consultar el mismo ID. Si también falla el GET, mantener un bloqueo de verificación y ofrecer recuperación explícita. Un cambio de URL no elimina ese bloqueo.

Si el servidor confirmó el cambio y falla una consulta posterior, conservar la confirmación y mostrar el fallo de refresco por separado. No solicitar nuevamente la llegada/finalización como recuperación. Si llega 401/403/404, limpiar datos protegidos, detener acciones y mostrar sesión vencida/acceso restringido/no disponible según corresponda.

La versión calculada de una fixture y expectedVersion no son revisiones del servidor. No inventar If-Match, claves de idempotencia o un número de versión API. Los bloqueos existentes del backend preservan fechas ante confirmaciones concurrentes; probarlo.

## 8. Pantallas, navegación y coherencia con US26

Conservar /operacion/reserva/llegada, /operacion/reserva/atendiendo y /operacion/reserva?vista=op-reserva-completada, añadiendo reservaId a los enlaces. Proteger la vista completada sin asumir que toda /operacion/reserva pertenece a US25; coordinar el guard por variante para no bloquear el detalle de otro módulo.

GET determina la etapa actual incluso desde un enlace directo. Para CONFIRMADA sin llegada ofrecer llegada; con llegada mostrar atención y su fecha; COMPLETADA mostrar ambas marcas y ninguna acción. Otros estados se muestran explícitamente sin abrir la muestra ni cambiar automáticamente a COMPLETADA.

No mezclar el estado HTTP con ReservaMuestraStore, historial de ejemplo o cálculo local de expiración. La reserva completada no puede reaparecer como Expirada por reutilizar el fixture #208. La consulta al backend del mismo ID es la autoridad; la integración futura de US26 reutilizará ReservaService y los modelos de reserva.

No declarar integrado el historial del cliente ni convertirlo en requisito de US25. Conservar retornos existentes solo como navegación hacia su módulo, identificando las limitaciones si el destino todavía usa muestras. No presentar un listado de ejemplo como evidencia de persistencia del cambio real.

Usar los tokens globales y composición existentes, @if/@for con track estable y archivos TS/HTML/CSS separados. Distinguir carga inicial, vacío/selección ausente, actualización, envío, rechazo y lectura anterior. Texto además de color, fechas legibles, foco visible, nombres accesibles y avisos moderados. Verificar 320/390/768/1440 y zoom, sin ocultar desbordamiento global.

## 9. Errores y privacidad

Los errores locales de ReservaController para reglas y ausencia incluyen timestamp, status y mensaje; no siempre incluyen error. Seguridad y otros errores pueden tener otro formato. No exigir JSON a todo error ni decidir el negocio comparando un mensaje libre.

400 representa reglas como llegada repetida/falta de llegada/horario anticipado/estado no confirmado; no suponer 409 para todos los rechazos concurrentes. 403 puede indicar local ajeno, rol inválido o petición sin autenticar según la configuración vigente. 404 indica reserva no disponible; no sustituirla por otra. No mostrar trazas, SQL, JWT o datos de otro restaurante.

No modificar reglas del backend solo para hacer coincidir un código esperado de una prueba. Documentar por separado una discrepancia funcional real si se detecta.

## 10. Aceptación y pruebas

| Criterio | Verificación exigida |
| --- | --- |
| US25-CA01 | Llegada válida conserva CONFIRMADA, fecha del servidor y aviso único al cliente |
| US25-CA02 | Llegada repetida/concurrente conserva la fecha original y no duplica avisos |
| US25-CA03 | Estado inválido y tolerancia vencida rechazan; inicio + 15 exacto no se acepta y la consulta muestra la expiración que corresponda |
| US25-CA04 | Con llegada y desde inicio, completar fija COMPLETADA/completadaEn y conserva llegada; aviso y disponibilidad coherentes |
| US25-CA05 | Completar sin llegada se rechaza sin inventar fechas |
| US25-CA06 | Antes de inicio se rechaza; exactamente en inicio se acepta con llegada |
| US25-CA07 | Cliente, sin local y operador de otro restaurante no pueden operar ni recibir datos ajenos |

Añadir pruebas de flags/reloj compartidos, futura llegada permitida según regla actual, completada/expirada no reversibles, IDs inválidos, URL directa, cancelar/foco, doble clic, cuenta/selección nueva, respuesta tardía, 400/401/403/404/409, respuesta perdida con guardado, GET fallido y recuperación sin repetir PATCH. No generar confirmaciones por timer o al abrir una ruta.

Frontend: check/build y regresiones de pedidos/cocina afectadas por infraestructura compartida; pruebas de contrato/store y navegador contra HTTP controlado. Backend: HTTP/JWT/H2 con Clock fijo para límites exactos y concurrencia; verificar fechas, notificaciones y disponibilidad por consulta del servidor. Conservar pruebas puras de muestras como evidencia histórica independiente.

Separar evidencia unitaria, simulada y backend real aislado. La aceptación final necesita autenticación y base del equipo compatibles. Un build, un fixture o pruebas H2 no acreditan despliegue ni PostgreSQL compartido. Registrar solo pruebas ejecutadas y sus limitaciones.

## 11. Commits propuestos y estado de esta entrega

- Documentación: docs(us25): especifica la integración API de atención de reservas.
- Frontend: feat(us25): integra llegada y finalización de reservas con la API.
- Backend, si se incorporan los metadatos previstos: feat(us25): expone controles de atención basados en el reloj del servidor.

Esta entrega prepara únicamente el SPEC y sus referencias. No implementa ReservaService, guard, campos nuevos, acciones HTTP ni pruebas de integración. El backend no se modifica en esta fase. No se crean commits, push o PR automáticamente.
