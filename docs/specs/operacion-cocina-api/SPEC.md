# SPEC — Integración API de cocina y estados del pedido

Fecha: 02/11/2026. Rama: feature/operacion-cocina-api.
Estado: especificación preparada; implementación por historia y aceptación integrada pendientes.

## 1. Objetivo y fuentes

Conectar la cola y el tablero existentes con los pedidos reales del restaurante y registrar preparación, pedido listo y entrega mediante la API. Conservar las rutas hijas, componentes standalone, Angular Material y estilos compartidos.

Leer [AGENTS.md](../../../AGENTS.md), [SPEC común](../../../SPEC.md), [US15](../us15/SPEC.md), [US19](../us19/SPEC.md), [integración de pedidos del cliente](../cliente-pedido-api/SPEC.md) y [reparto de tareas](../../ASIGNACION-EQUIPO.md). Los criterios originales siguen vigentes. Este complemento abre la fase API; las restricciones de las fases de muestra y sus evidencias son históricas.

Contrato revisado en el backend local: PedidoController, PedidoService, PedidoResponseDTO, DetallePedidoResponseDTO, EstadoPedido, CurrentUser, AccesoRestaurante y GlobalExceptionHandler. Revalidar estos contratos en la rama del backend que se ejecute antes de implementar.

Aplicar la organización del material del profesor ya revisado: environments, configuración HTTP, modelos compatibles con DTO, servicios, signals, interceptor JWT, guards y rutas. El [video de referencia](https://www.youtube.com/watch?v=s4xlgdxUdSA) no sustituye el contrato de RestoPilot ni define sus versiones o puertos.

Referencias visuales y frames: [registro del proyecto](../../REFERENCIAS-FIGMA.md) y complementos de US15/US19. La [copia facilitada del diseño](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=5-92) sirve como referencia indicada por el usuario. Esta revisión documental no acredita una nueva inspección por MCP ni autoriza rediseñar pantallas.

## 2. Historias y entregas

| Historia | Tarea de integración | Resultado esperado |
| --- | --- | --- |
| US15 | S2-TSK-036 | Consultar la cola priorizada de la API y conservar su orden al actualizar tabla y tablero |
| US19 | S2-TSK-038 | Registrar cambios de estado autorizados, refrescar y explicar rechazos |

Las interfaces de S2-TSK-035 y S2-TSK-037 son la base existente, sujetas a los ajustes necesarios de integración. Este documento no declara ninguna tarea Done.

Incluye únicamente dependencias compartidas indispensables, permisos operativos, lectura de cola/detalle, metadatos de prioridad y transiciones. Excluye edición/cancelación de pedidos, cobros, reservas, notificaciones como módulo independiente, autenticación completa, gestión de carta, despliegue y configuración de Supabase. No se necesita una migración para los metadatos derivados descritos aquí.

Orden de trabajo: este SPEC y commit documental; implementación y commit US15; implementación y commit US19. No implementar ambas historias en un solo commit. Los cambios necesarios del backend se entregan en su repositorio con su propia validación y descripción.

## 3. Estado inicial y arquitectura

La cocina actual usa modelos y fixtures locales de cocina-ui. La API ya tiene consulta priorizada y transiciones; no crear endpoints paralelos. Existe una base compartida de HttpClient, AuthService, API_SESSION, interceptor JWT, PedidoService y validadores de consulta, usada por US11–US13.

- Reutilizar environment.apiUrl y el proveedor HTTP único de app.config. No repetir URLs ni registrar otro interceptor de autenticación.
- Ampliar PedidoService para consultar la cola y cambiar estado; reutilizar su consulta de detalle. Los componentes consumen servicios/store, no HttpClient directamente.
- Separar DTO, validación y adaptación visual. Reutilizar readPedido donde corresponda; un store exclusivo de cliente no sirve para operaciones porque exige propiedad por cliente.
- Mantener estado reactivo de consulta, selección y envío en un store operativo compartido. Cancelar consultas obsoletas y descartar respuestas de otra sesión, restaurante, página o selección.
- La ruta API operativa no usa fixtures ni ejecuta transitionSample/prioritizeSample. Una falla no activa un modo de demostración silencioso.
- Durante US15, dejar deshabilitadas o fuera del recorrido real las acciones de simulación de US19. No permitir cambios locales sobre pedidos obtenidos de la API.

## 4. Sesión, restaurante y autorización

Roles válidos: ADMINISTRADOR y DUENO. No introducir COCINERO ni habilitar CLIENTE como operador.

ApiSession actualmente no conserva restauranteId, aunque AuthResponse y el JWT del backend lo ofrecen para usuarios con restaurante. En US15 incorporar ese contexto validado al adaptar la autenticación existente: identificador entero positivo, concordancia entre respuesta y token cuando esté presente y coherencia con la sesión. Mantener restaurante nulo para los perfiles que no lo tienen. No inventar un restaurante por defecto.

Crear una comprobación operativa específica; no reutilizar activeClientSession ni debilitar los controles de propiedad del cliente. Proteger las rutas de cocina afectadas mediante guard, sin bloquear módulos ajenos. Sin sesión válida, dirigir al inicio de sesión existente conservando únicamente un retorno interno seguro; con rol incorrecto o sin restaurante, mostrar acceso restringido sin consultar ni mostrar muestras.

El guard mejora la navegación; el backend sigue validando permisos y pertenencia en cada petición. El restaurante no se autoriza mediante parámetros de URL, selección visual ni nombres de fixtures. La cola obtiene el restaurante del usuario autenticado y el detalle/cambio comprueba que el pedido pertenece al mismo local.

Al cerrar sesión, expirar el token o cambiar cuenta/restaurante, limpiar selección y datos operativos y cancelar peticiones. Reutilizar el interceptor que agrega el JWT solo al API configurado y evita que un 401 antiguo cierre una sesión nueva.

## 5. Contratos HTTP existentes

Rutas relativas a environment.apiUrl, que ya contiene /api. Usar Authorization: Bearer mediante el interceptor.

| Operación | Petición | Respuesta válida |
| --- | --- | --- |
| Cola activa | GET /pedidos/pendientes?page=0&size=20 | 200, Page de Spring con content y metadatos de paginación |
| Detalle | GET /pedidos/{id} | 200, PedidoResponseDTO |
| Cambio de estado | PATCH /pedidos/{id}/estado?nuevoEstado=EN_PREPARACION | 200, PedidoResponseDTO actualizado |

page=0 y size=20 son la política inicial propuesta del cliente, no constantes obligatorias del servidor. En PATCH, nuevoEstado es un parámetro de consulta con el enum destino; no enviar un DTO JSON inventado.

PedidoResponseDTO actual: id, restauranteId, restauranteNombre, clienteId, clienteNombre, mesaId, estado, tipoEntrega, direccionEntrega, total, fechaCreacion, limiteCancelacion y detalles.

Cada detalle contiene id, platoId, nombrePlatoSnapshot, cantidad, precioUnitario, subtotal y notas. Mantener nombre y precios registrados; no sustituirlos por los actuales de carta. Los importes son números JSON y las fechas LocalDateTime no incluyen zona: no añadir una Z ni desplazar horas arbitrariamente.

Estados: PENDIENTE, EN_PREPARACION, LISTO, ENTREGADO, CANCELADO. Modalidades: SALON, LLEVAR, RECOGER, DELIVERY. Validar estructura, identificadores positivos, enums, cantidades e importes antes de presentar acciones. Verificar identidad y restaurante de cada respuesta. Un contrato inválido produce un error recuperable, no datos de muestra.

La página operativa usa content, totalElements, totalPages, number y size. No reutilizar sin adaptar el formato de /pedidos/me, que usa pedidos, totalElementos y totalPaginas. Validar metadatos, entradas repetidas y estados permitidos en la cola.

El DTO actual no informa pago ni número visible de mesa: no afirmar Pagado/Pendiente ni convertir mesaId en un número de mesa inventado. Mostrar solo el identificador disponible con una etiqueta explícita; no consultar pagos por cada tarjeta.

## 6. US15: prioridad y consulta

La API devuelve exclusivamente PENDIENTE y EN_PREPARACION del restaurante autenticado. Ordena el conjunto completo antes de paginar:

1. Mayor complejidad máxima de los platos: ALTA, MEDIA, BAJA; ausente/desconocida queda por debajo según el backend actual.
2. Mayor tiempo máximo de preparación entre todas las líneas.
3. Fecha de creación más antigua.
4. Identificador numérico ascendente para estabilizar empates.

Complejidad máxima y tiempo máximo se calculan independientemente y pueden proceder de platos diferentes. No sumar tiempos, multiplicar por cantidades ni recalcular prioridad en Angular. No aplicar ordenación de tabla que cambie la prioridad confirmada.

Conservar el orden de content. Al agrupar por estado, conservar el orden relativo de las entradas de cada columna. Identificar que el tablero representa la página consultada; conteos de columnas corresponden a esa página y totalElements a toda la cola. Ofrecer paginación accesible, sin afirmar que una página contiene todos los pedidos.

Actualizar vuelve a consultar al servidor e incorpora nuevas entradas y salidas. Tras reducirse la cola, si la página quedó fuera de rango, consultar la última página válida; si no hay resultados, mostrar vacío real. No implementar polling ni WebSockets en esta fase.

### 6.1. Brecha de metadatos y cambio previsto del backend

La interfaz de US15 requiere explicar complejidad y minutos, pero el DTO actual no los incluye. Para conservar esa información, US15 contempla una ampliación aditiva de PedidoResponseDTO con estos campos derivados; todavía no existen en el contrato revisado:

| Campo previsto | Tipo JSON | Fuente |
| --- | --- | --- |
| complejidadMaxima | ALTA, MEDIA, BAJA o null | Máximo reconocido entre los platos del pedido |
| tiempoPreparacionMaximoMinutos | Número entero no negativo o null | Máximo disponible de tiempos de los platos |

Usar la misma fuente y regla que el orden del backend, compartiendo el cálculo para no divergir entre mapper y comparador. Si no hay dato conocido, devolver null y mostrar «No informado»; el orden mantiene la política existente de valor desconocido. Si existe un tiempo cero válido, conservarlo. Los datos derivan del catálogo consultado por el backend, no de un snapshot histórico de complejidad inexistente.

Añadirlos consistentemente a cola y detalle, sin eliminar/renombrar campos existentes ni alterar precios históricos. No hacer consultas de carta por tarjeta. Los consumidores anteriores de pedidos deben seguir funcionando. Mientras se despliegan versiones compatibles, la ausencia de estos campos no se convierte en Alta, Baja, cero minutos ni ETA inventados; la validación de aceptación de esta información exige el backend ampliado.

Los minutos describen preparación, no tiempo transcurrido ni promesa de entrega. El orden del servidor sigue siendo autoritativo aunque falten metadatos.

## 7. US19: transiciones y confirmación

| Estado confirmado | Acción | Destino enviado |
| --- | --- | --- |
| PENDIENTE | Iniciar preparación | EN_PREPARACION |
| EN_PREPARACION | Marcar listo | LISTO |
| LISTO | Registrar entrega | ENTREGADO |
| ENTREGADO o CANCELADO | Sin avance disponible | Ninguno |

No permitir saltos, retrocesos o entrega de un pedido en preparación. La API vuelve a validar la transición bajo bloqueo del pedido; no dispone de un contrato de revisión, ETag o clave de idempotencia que el cliente pueda asumir.

Solicitar confirmación visual con Angular Material, identificando pedido y acción. Cancelar no envía nada y devuelve el foco. Mientras se envía, bloquear dobles envíos y navegación que duplique la misma acción; no adelantar estado, avisos de éxito ni contadores antes de la respuesta válida.

Al recibir éxito, validar pedido/restaurante y destino confirmado, actualizar su detalle y volver a consultar la cola. LISTO y ENTREGADO salen de la cola activa: su ausencia allí no significa que el pedido no exista. Conservar el detalle seleccionado para permitir LISTO → ENTREGADO y la confirmación final. Una entrada a la ruta por ID consulta el detalle, aunque no esté en la página actual de cocina.

Si el cambio se confirmó y falla el refresco de cola, informar ambas cosas por separado y permitir reconsultar sin repetir PATCH. Si se pierde la respuesta del cambio, no asumir éxito ni rechazo: bloquear nuevos avances mientras se verifica el estado actual con GET y ofrecer recuperación explícita si esa consulta también falla. No reintentar mutaciones automáticamente ni avanzar al siguiente estado por un doble clic.

Si otro operador cambió el pedido, explicar el rechazo y refrescar su estado antes de habilitar otra acción. La notificación al cliente es responsabilidad del backend; esta historia no crea avisos simulados ni duplica el envío.

## 8. Navegación e interfaz

Conservar /operacion/pedidos, /operacion/cocina, /operacion/pedido, /operacion/pedido/listo y /operacion/pedido/entregar, su estructura de rutas hijas y el mecanismo existente de confirmación de entrega. No intervenir en edición/cancelación ni rutas administrativas ajenas.

Transportar la identidad por el mecanismo de selección/URL existente, con validación de ID; conservar origen, página y retorno seguro. Recargar, entrar por enlace o usar atrás no sustituye el pedido por #1042 ni requiere encontrarlo en una fixture. Un ID inválido no genera consulta.

Distinguir carga inicial, vacío, actualización, error y envío de acción. Durante actualización se pueden conservar datos anteriores identificados como pendientes de refrescar; no permitir acciones sobre un detalle desactualizado tras conflicto, cambio de sesión o resultado incierto. Los errores de acceso limpian datos protegidos.

Conservar tokens --rp-*, estilos globales y composición del diseño. Componentes standalone con archivos separados, @if/@for con track estable, Angular Material y formularios reactivos donde corresponda. No añadir dependencias, estilos internos de Material o ::ng-deep.

Aplicar las heurísticas ya recogidas en el proyecto: estado visible, términos familiares, confirmación, cancelación, consistencia y recuperación. Estado/prioridad con texto además de color, foco visible, mensajes accesibles y controles operables por teclado. Verificar mobile, desktop y zoom sin desbordamiento global.

## 9. Errores y privacidad

| Resultado | Comportamiento |
| --- | --- |
| 400 | Mostrar regla/validación segura; transiciones inválidas actualmente usan BusinessRuleException con 400 |
| 401 | Gestionar sesión mediante infraestructura compartida; limpiar datos y ofrecer autenticación |
| 403 | Acceso restringido por rol/local; no mostrar el pedido ni permitir acciones |
| 404 | Pedido no disponible, sin sustituirlo por otro ni inferir que fue entregado |
| 409 | Conflicto de persistencia/concurrencia; reconsultar antes de otra acción |
| Red, 5xx o respuesta inválida | Error recuperable sin inventar estado; resultado de mutación puede ser incierto |

Los errores de aplicación suelen incluir timestamp, status, error y mensaje; validaciones pueden añadir detalles. Las respuestas de seguridad pueden tener otro formato. No exigir que todo error tenga JSON ni mostrar trazas, SQL, token o datos personales innecesarios. No interpretar todos los rechazos como 409.

## 10. Verificación y aceptación

Cada implementación ejecutará check/build y pruebas pertinentes a su cambio. Usar la autenticación real existente y datos de prueba autorizados; no crear credenciales o roles de producto para pasar pruebas. Distinguir pruebas unitarias/HTTP controladas, backend de prueba y recorrido contra el entorno real compartido.

| Historia | Escenario y resultado exigido |
| --- | --- |
| US15 | Dos restaurantes: cada operador consulta solo el suyo; CLIENTE, sesión vencida y usuario sin restaurante no acceden |
| US15 | Prioridad global con máximos en líneas distintas y empates por complejidad, minutos, fecha e ID; Angular conserva orden |
| US15 | Más de una página: agrupación estable, conteos honestos, cambio de página y última página vaciada |
| US15 | Nuevos pedidos, salida por LISTO/ENTREGADO/CANCELADO, vacío global y columna vacía sin fixtures |
| US15 | Metadatos derivados correctos, valores ausentes explícitos y compatibilidad de US11–US13 tras ampliar DTO/sesión |
| US15 | Tabla → tablero → detalle, enlace directo y recarga conservan identidad, página y origen |
| US15 | Error inicial, refresco fallido, respuesta tardía y cambio de cuenta no mezclan datos ni habilitan simulaciones |
| US19 | Secuencia completa PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO mediante PATCH y nueva consulta |
| US19 | Cancelar confirmación no llama API; doble clic no duplica petición; no existen saltos ni acciones terminales |
| US19 | LISTO desaparece de cola pero sigue consultable para entrega; ENTREGADO conserva confirmación real |
| US19 | Rechazo por regla, 403, 404 y conflicto concurrente mantienen estado confirmado y permiten recuperación segura |
| US19 | PATCH exitoso con refresco fallido no se repite; respuesta perdida obliga a comprobar estado antes de otra acción |
| Ambas | Teclado, foco, carga/error accesibles, mobile/desktop y ausencia de regresiones del recorrido del cliente |

Para cerrar S2-TSK-036 y S2-TSK-038 se exige evidencia de sus consultas/transiciones contra el backend compatible y aislamiento por restaurante; una pantalla visual o prueba con respuestas simuladas no acredita integración completa. Registrar comando, alcance, resultado y limitaciones sin declarar Done por anticipado.

## 11. Commits y cierre de rama

1. docs(cocina): especifica la integración API de US15 y US19.
2. feat(us15): integra la cola priorizada de cocina con la API.
3. feat(us19): integra los cambios de estado del pedido con la API.

Preparar primero el contrato y después implementar cada historia. Los nombres anteriores son propuestas; no crean commits automáticamente. Al finalizar la rama, el PR hacia develop debe explicar cambios, pruebas y pendientes reales, incluyendo dependencias del backend.

Esta entrega es documental: define contratos actuales y cambios previstos, y enlaza los SPEC existentes. No implementa consultas, guard, ampliación del DTO ni transiciones; tampoco acredita pruebas HTTP, de base de datos o de interfaz ejecutadas para esta nueva fase.
