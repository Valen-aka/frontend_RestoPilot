# SPEC — Integración API de pedidos del cliente

Fecha: 02/11/2026. Rama: `feature/cliente-pedido-api`.
Estado: especificación preparada; implementación y aceptación integrada pendientes.

## 1. Objetivo y fuentes

Conectar el recorrido existente carrito → detalle → seguimiento → consulta de pago con el backend de RestoPilot, conservando componentes, estilos y rutas hijas.

Leer [AGENTS.md](../../../AGENTS.md), [SPEC común](../../../SPEC.md), [US11](../us11/SPEC.md), [US12](../us12/SPEC.md), [US13](../us13/SPEC.md) y [Mis pedidos](../cliente-pedidos/SPEC.md). Este complemento define la nueva etapa de integración solicitada. Las restricciones y evidencias de las entregas de muestra se conservan como historial; no impiden la integración ahora autorizada.

Referencia metodológica: material_teoria_y_explicacion(1).zip, láminas de estructura, environments, modelos/DTO, servicios HTTP/CORS, signals, formularios, guards y rutas; y el [video facilitado](https://www.youtube.com/watch?v=s4xlgdxUdSA). Se revisaron las láminas; no se acredita haber reproducido el video. El material incluye SPEC.md como reglas del proyecto, sin exigir un documento por conexión.

Contrato comprobado en el código local del backend: PedidoController, PedidoService, los DTO de pedidos, PagoController, PagoService, PagoResponseDTO, enums, GlobalExceptionHandler y SecurityConfig. Volver a comprobarlos en la rama que se ejecutará antes de implementar. Los ejemplos EventSales no definen endpoints, puertos ni versiones de RestoPilot.

Referencia visual: [Figma original](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92), con los frames de los complementos existentes. Esta edición documental no vuelve a verificar diseño ni autoriza rediseñar pantallas.

## 2. Historias y alcance

| Historia | Necesidad del cliente | Tarea |
| --- | --- | --- |
| US11 | Registrar platos con una modalidad válida y conocer el importe confirmado | S2-TSK-032 |
| US12 | Consultar un pedido propio y su registro de pago | S2-TSK-034 |
| US13 | Consultar el avance actualizado de preparación y entrega | S2-TSK-042 |

Los criterios completos permanecen en el SPEC común y cada complemento. Este documento no los reduce ni declara tareas Done.

Incluye configuración HTTP pública, modelos API, servicios, adaptación a presentación, carga/error, conservación del pedido seleccionado y dependencias mínimas de autenticación coordinadas con el módulo compartido.

Excluye cobros/pasarelas, registro administrativo de pagos, cambios operativos de estado, cancelación, cocina, reservas, despliegue, cambios de base de datos y reconstrucción completa de autenticación. Conservar el enlace existente a notificaciones; no acredita recepción de avisos ni US13-CA02 completo.

El historial completo también pertenece a US07. Si se conecta /pedidos/me para sostener la selección de estas historias, limitar el cambio a pedidos y documentar la dependencia, sin declarar US07 terminado ni ampliar a reservas.

## 3. Punto de partida y dependencias

- app.config.ts no registra todavía provideHttpClient. environment.development.ts ya define http://localhost:8081/api. Reutilizarlo, sin regenerar environments ni copiar el puerto 8080 del ejemplo.
- CarritoStore usa IDs de muestra como lomo, aji, mesa-04 y un restaurante ficticio. No convertir etiquetas en IDs numéricos ni escoger arbitrariamente registros del servidor.
- ClientePedidosStore y PedidoDemoContext mantienen históricos y pedidos temporales locales. No usarlos como respaldo silencioso si falla la API.
- Recibir restauranteId, platoId y mesaId reales desde catálogo/selección. Acordar esa entrada con el módulo correspondiente; si aún no está conectado, mostrar la dependencia y bloquear el envío, sin aparentar un recorrido completo con fixtures.
- Coordinar y reutilizar sesión, interceptor JWT y guards del módulo compartido. No crear una segunda sesión, tokens fijos, usuarios ficticios ni almacenamiento de credenciales para resolver esta tarea.
- Ejecutar el backend con base configurada y datos válidos. No se requiere migrar a Supabase ni desplegar para probar la conexión local.

## 4. Arquitectura y archivos previstos

Flujo: componente → servicio inyectable → HttpClient → interceptor JWT → API. Respuesta Observable → estado/signal → presentación.

| Ubicación | Cambio previsto |
| --- | --- |
| src/environments/ | Reutilizar apiUrl pública y verificar la configuración activa; sin secretos |
| src/app/app.config.ts | Registrar provideHttpClient una sola vez y el interceptor acordado |
| src/app/core/models/ | Interfaces Request/Response fieles a los DTO; crear la carpeta si no existe |
| src/app/core/services/ | PedidoService y PagoService con HttpClient y environment.apiUrl |
| src/app/core/interceptors/ y guards/ | Infraestructura de sesión compartida y coordinada |
| src/app/pages/cliente/carrito-ui/ | Borrador real y envío de US11 |
| src/app/pages/cliente/pedido-ui/ | Adaptadores, detalle, progreso e identidad del pedido |
| Pantallas existentes de pago | Consulta y errores independientes del mismo pedido |
| src/app/routes/cliente/cliente.routes.ts | Conservar rutas hijas, layout y carga diferida; protección según sesión acordada |

Los componentes no construyen URLs ni llaman HttpClient directamente. Los servicios devuelven Observables. Usar signals para datos, loading, saving y error, y computed para valores derivados. Finalizar suscripciones al destruir la vista y evitar que una respuesta antigua reemplace el pedido recién seleccionado.

Mantener componentes standalone, TS/HTML/CSS separados, Angular Material, Reactive Forms, @if/@for con track y tokens --rp-*. No cambiar dependencias ni versiones para esta integración.

## 5. Contratos HTTP comprobados

Todas las rutas siguientes parten de environment.apiUrl. El backend exige autenticación salvo sus rutas públicas.

| Operación | Método y ruta relativa | Resultado |
| --- | --- | --- |
| Registrar pedido | POST /pedidos | 201 y PedidoResponseDTO; rol CLIENTE |
| Consultar pedido propio/refrescar seguimiento | GET /pedidos/{id} | 200 y PedidoResponseDTO; propiedad validada en servidor |
| Consultar pago | GET /pedidos/{pedidoId}/pagos | 200 y PagoResponseDTO; acceso validado en servidor |
| Listado de soporte, si se necesita | GET /pedidos/me?page=0&size=20 | Objeto con mensaje, pedidos, totalElementos y totalPaginas; no content |

### Request de pedido

PedidoRequestDTO: restauranteId (number), tipoEntrega (SALON | LLEVAR | RECOGER | DELIVERY), mesaId (number o null), direccionEntrega (string o null), detalles (lista no vacía).

DetallePedidoRequestDTO: platoId (number), cantidad (entero positivo), notas (string de hasta 255 caracteres o null). Los IDs deben ser enteros positivos seguros para JavaScript; si exceden ese rango, acordar serialización con el backend antes de operar.

No enviar clienteId, total, precios ni estado: el servidor obtiene el cliente autenticado y calcula el importe.

### Response de pedido

PedidoResponseDTO: id, restauranteId, restauranteNombre, clienteId, clienteNombre, mesaId, estado, tipoEntrega, direccionEntrega, total, fechaCreacion, limiteCancelacion y detalles.

DetallePedidoResponseDTO: id, platoId, nombrePlatoSnapshot, cantidad, precioUnitario, subtotal y notas. Presentar el nombre y precio históricos; no sustituirlos por los actuales de la carta.

Estados exactos: PENDIENTE, EN_PREPARACION, LISTO, ENTREGADO, CANCELADO. Un enum desconocido produce error de contrato, no Pendiente por defecto.

### Response de pago y adaptación

PagoResponseDTO es un objeto, no una lista: mensaje, id, pedidoId, monto, metodo, estado, codigoReferencia, fechaPago y creadoEn. Estados: PENDIENTE | PAGADO. Métodos: YAPE | PLIN | TARJETA | EFECTIVO. Admitir método, referencia y fecha de pago null/ausentes según el registro, sin fabricarlos.

Fechas LocalDateTime: cadenas sin zona explícita. No añadir Z ni asumir UTC; confirmar interpretación con el backend antes de convertir zonas. BigDecimal llega como número JSON: formatear importes sin recalcular el total confirmado con operaciones flotantes.

Mantener DTO y modelo visual separados cuando difieran. Validar campos críticos al adaptar: una interfaz TypeScript no verifica el JSON recibido. No completar direcciones, mesas, fechas, identidades o importes con datos de muestra.

## 6. US11 — Registro y restricciones

1. Recibir un borrador con IDs reales del mismo restaurante. Validar lista no vacía, cantidades enteras positivas y modalidad.
2. SALON requiere atención física y mesa activa del restaurante. DELIVERY requiere habilitación y dirección recortada, no vacía y de hasta 255 caracteres. LLEVAR/RECOGER no requieren mesa ni dirección. Limpiar campos incompatibles al cambiar modalidad.
3. Orientar con las condiciones consultadas. El backend comprueba restaurante activo/horario, platos disponibles y del mismo local, mesa y modalidad; la UI no sustituye estas validaciones.
4. Deshabilitar confirmación mientras se envía y evitar doble clic. No reintentar el POST automáticamente.
5. Confirmar éxito solo ante respuesta 201 válida; conservar ID, detalle y total devueltos. Vaciar el borrador únicamente después de conservar el resultado válido y permitir acceder a ese pedido.
6. Un rechazo conocido conserva selección y muestra causa recuperable. Si una desconexión deja incierto el resultado del POST, informar que no pudo confirmarse y permitir verificar pedidos antes de repetir. El contrato revisado no ofrece clave de idempotencia.

El backend crea el pago Pendiente en la transacción del pedido. Consultarlo desde la pantalla de pago; no fabricar un PagoResponseDTO a partir de esa regla.

## 7. US12 — Identidad, detalle y pago

Conservar /cliente/pedido y /cliente/pago como rutas hijas. Decisión de integración: transportar el ID mediante ?pedidoId=<id>, para permitir recarga y enlaces directos. Admitir el estado de navegación previo durante la transición; si discrepa, prevalece el ID validado de la URL y se vuelve a consultar. Nunca recurrir a #1042 u otra muestra cuando falta el ID.

Un ID ausente/inválido indica que se debe seleccionar un pedido. No consultar con un ID inválido ni revelar el último pedido de otra sesión. La autorización corresponde al servidor. Conservar identidad entre detalle, seguimiento, pago y retorno.

Presentar el snapshot, cantidades, modalidad y total recibidos. No inventar etiquetas de mesa o dirección del restaurante ausentes del DTO. La consulta del pago tiene carga/error propios; su fallo no destruye un detalle válido ni lo convierte en un pago Pendiente.

Distinguir pago PENDIENTE sin método/fecha, PAGADO con sus datos, y ausencia de registro. Antes de interpretar 404 de pago como ausencia de registro, comprobar que el pedido propio sigue accesible mediante GET /pedidos/{id}. Si esta comprobación falla, mostrar su error y retirar datos sensibles según corresponda; no depender solo del texto libre del error.

Pedido ajeno e inexistente producen el mismo mensaje de no encontrado, sin datos anteriores en DOM. Un 403 informa acceso restringido. Esta consulta no añade acciones de cobro o registro administrativo.

## 8. US13 — Actualización del seguimiento

Consultar GET /pedidos/{id} al entrar y mediante la acción Actualizar. No hay endpoint separado de seguimiento en el contrato revisado. No introducir polling, WebSocket, temporizadores de avance, porcentajes ni estimaciones inventadas.

PENDIENTE → Recibido; EN_PREPARACION → En preparación; LISTO → Listo; ENTREGADO → Entregado sin etapas posteriores. CANCELADO conserva el desglose y no muestra progreso de éxito. Pago y estado del pedido son independientes.

?vista= conserva su función de escenario visual del inventario; en consulta integrada manda el estado de la API aunque contradiga la variante. Abrir una URL no modifica el pedido en el servidor.

Error inicial: sin progreso confirmado. En un refresco fallido por red/5xx puede conservarse la última respuesta del mismo pedido identificada como no actualizada, con reintento. Ante cambio de ID/sesión, 401, 403 o 404, retirar los datos sensibles anteriores. Evitar respuestas fuera de orden y refrescos duplicados.

## 9. Errores, sesión y accesibilidad

| Situación | Presentación |
| --- | --- |
| 400 | Mensaje de negocio/validación, detalles útiles y borrador conservado |
| 401 | Sesión no válida según contrato de autenticación; login y retorno interno seguro |
| 403 | Acceso restringido; retirar datos sensibles sin asumir solo expiración |
| 404 | Pedido no encontrado; para pago aplicar la comprobación de sección 7 |
| 409 | Conflicto; permitir actualizar/verificar antes de repetir |
| Red, timeout o 5xx | Error recuperable sin fixtures de respaldo ni éxito inventado |
| Respuesta incompatible | Error de contrato sin completar valores ni mezclar pedidos |

GlobalExceptionHandler suele devolver mensaje y opcionalmente detalles, status, timestamp, error o incidente. El filtro de seguridad puede responder con otro formato: admitir cuerpos no JSON o sin mensaje y usar texto seguro de respaldo. No mostrar trazas, HTML del servidor ni tokens.

El interceptor adjunta Bearer solo a la API configurada. Los guards usan la sesión acordada y no sustituyen permisos del servidor; cualquier cadena almacenada no demuestra una sesión válida. Limpiar datos y selección al cerrar/cambiar sesión. No añadir otra estrategia de almacenamiento de credenciales.

SecurityConfig ya contiene CORS. Verificar solicitudes/preflight desde el origen real del frontend; no desactivar seguridad ni modificar backend a ciegas. Esta fase no cambia CORS.

Carga/envío/errores con texto y aria-live adecuado, labels y errores asociados, foco visible y reintento accesible por teclado. No mover el foco ni anunciar toda la tabla en cada refresco. Mantener desktop/mobile sin desbordamiento y estilos del SPEC común.

## 10. Pruebas y aceptación

| Tarea | Evidencia necesaria para cerrar |
| --- | --- |
| S2-TSK-032 | POST real desde carrito con IDs válidos; cuatro modalidades; ID/total confirmados; restricciones de platos, restaurante, mesas y atención; doble clic y fallos |
| S2-TSK-034 | GET real de pedido propio y pago; snapshot histórico; pendiente/pagado/sin registro; carga, red y cuenta ajena sin filtración |
| S2-TSK-042 | Nueva consulta refleja un cambio válido del backend en el mismo pedido; estados finales; fallo sin avance ficticio; respuesta antigua descartada |

Pruebas automatizadas dirigidas: método/URL/payload/error de servicios HTTP, adaptación de DTO, identidad y limpieza al cambiar sesión, y protección ante respuestas obsoletas. Usar respuestas controladas para fallos difíciles y distinguirlas de integración real.

Navegador con ambos proyectos activos: carrito → detalle → actualización → pago → retorno; enlace directo/recarga; otro ID/cuenta; servidor no disponible y refresco fallido. Cambiar estados mediante una operación backend autorizada, sin incorporar controles de cocina al cliente. Evidencias sin tokens ni datos personales.

En implementación ejecutar npm.cmd run check, npm.cmd run build y pruebas dirigidas, además de revisión desktop/mobile/teclado. Compilar o pasar mocks no acredita conexión real. Mantener las tareas pendientes cuando autenticación, catálogo o backend impidan completar recorridos. US13-CA02 conserva pendiente la consulta de notificaciones reales mientras ese módulo no esté conectado.

## 11. Secuencia de implementación y commits

1. docs(pedidos): especifica la integración API de US11, US12 y US13.
2. feat(us11): integra el registro de pedidos con la API.
3. feat(us12): integra la consulta del pedido propio y su pago.
4. feat(us13): integra la actualización del seguimiento del pedido.

Implementar primero US11 y verificarla antes de continuar con US12; después US13. La infraestructura mínima necesaria pertenece al primer commit que la requiera y debe reutilizarse. Cada commit debe ser revisable y compilar por sí mismo. No crear commits automáticamente: entregar título y descripción al usuario.

PR hacia develop: alcance, pruebas efectivamente realizadas, dependencias y pendientes reales. Sin credenciales, despliegue ni funciones fuera del alcance.

## 12. Estado de esta entrega

Solo documentación. Se revisaron reglas, complementos, configuración, stores locales y contratos del backend. No se modificaron componentes, servicios, HTTP, seguridad ni backend. No se ejecutaron solicitudes reales ni pruebas de navegador. No se marcaron tareas Done. Informar comprobaciones documentales sin atribuirles aceptación de integración.


## 13. Ejecución acotada de US11 — 02/11/2026

Autorización vigente: implementar US11, la base compartida necesaria no asignada por tarea visual y la dependencia faltante del backend. Las pantallas de acceso/carta y las rutas del cliente conservan su contenido anterior; no se reasignan historias del Sprint 2. No se implementan todavía las consultas reales de US12/US13.

Se añaden AuthService (login HTTP y sesión en memoria), API_SESSION, interceptor Bearer limitado a apiUrl, modelos de contrato, CatalogoService, PedidoService y un guard reutilizable aún no registrado en las rutas asignadas a otra tarea. No hay usuarios de muestra ni un campo para pegar tokens en la aplicación. El módulo de acceso debe consumir AuthService; la carta debe llamar prepareSelection. La [guía compartida](../../GUIA-INTEGRACION-PEDIDOS.md) contiene ejemplos.

CarritoStore comienza vacío y obtiene IDs, precios estimados, condiciones y mesas mediante prepareSelection. El POST no envía precios, total ni cliente. Confirma únicamente una respuesta 201 válida del usuario actual; preserva total y snapshots retornados, evita doble envío, conserva el borrador ante rechazos y bloquea repetición ante un resultado incierto. La confirmación mantiene pedidoId en la URL, muestra el desglose recibido y permite volver a la carta; no enlaza hacia una consulta de muestra como si fuera seguimiento real. El acceso a detalle/seguimiento reales se incorporará con US12/US13.

Backend, rama feature/restaurantes-consulta: GET /api/restaurantes (lista de activos) y GET /api/restaurantes/{id} (detalle), autenticados. RestauranteResponseDTO incluye id, nombre, direccion, activo, abierto, tieneAtencionFisica, aceptaDelivery, horaApertura y horaCierre. El cálculo abierto usa el Clock del negocio y la misma ventana que valida PedidoService. No se modifica la base ni CORS ni las reglas de creación existentes.

Figma: el archivo original devolvió límite de llamadas. El usuario proporcionó expresamente la copia sRxKEwFdrMKfXPosGFvoHc para esta revisión; se consultaron metadatos de páginas Style/RestoPilot y contextos/capturas de acceso 84:17154 y carta 84:18200. Esta excepción es de esta tarea y no reemplaza globalmente la referencia original. No se implementaron esas pantallas a partir de la lectura, ni se certificó equivalencia visual.

Evidencia: cinco pruebas dirigidas de payload/validaciones/adaptación; diez recorridos del frontend real contra Postman local (cuatro modalidades, doble clic, rechazo, respuesta incompleta, error HTML 500, sesión 401 y limpieza al salir/recargar). El harness invoca AuthService y prepareSelection mediante Angular de desarrollo, sin modificar acceso/carta ni incluir un acceso de pruebas en producción. Son pruebas simuladas del frontend, no una ejecución del recorrido completo desde las pantallas aún pendientes.

Backend: cuatro pruebas unitarias de consulta/horario y una prueba HTTP real Spring Boot/JWT sobre H2 aislado que cubre login, consultas, cuatro modalidades, pago inicial y rechazos de mesa faltante/plato agotado. Esto no certifica PostgreSQL/Supabase ni el entorno configurado del equipo.

Pendientes de aceptación: conexión de las pantallas de acceso/carta por sus tareas, registro del guard al integrar autenticación, recorrido real del conjunto sobre la base del equipo, consulta real de detalle/pago US12 y actualización US13. S2-TSK-032 no se marca Done por estas pruebas parciales. No se creó commit, push, PR ni despliegue.

Verificación final de la rama: check estructural y build de producción correctos; 98 pruebas unitarias previas/de payload más tres pruebas dirigidas del interceptor/guard (101 en total), diez recorridos HTTP simulados US11 y 21/21 regresiones locales de US12/US13, cocina y reservas. Las regresiones de US12/US13 siguen siendo de muestra, separadas de la creación HTTP de US11. Sin cambios en pantallas de acceso/carta ni rutas de cliente.


## 14. Ejecución de US12 — 02/11/2026

Se integran consulta del pedido propio, pago y listado paginado mínimo de selección, con PedidoService.obtener/propios y PagoService.consultar. Se reutilizan AuthService, API_SESSION y el interceptor de US11. El detalle y pago dejan de consultar fixtures; todas las entradas existentes resuelven el ID real y la API determina los datos/estado, no ?vista=.

La confirmación de US11 ya enlaza al detalle real. Se preserva pedidoId entre detalle/pago/retorno, sin fallback a muestras. Carga/error de pago independiente; 404 de pago revalida el pedido antes de informar ausencia. 401/403/404 no dejan datos anteriores visibles; las respuestas fuera de orden se cancelan/descartan. El [SPEC US12](../us12/SPEC.md#integración-api-de-us12--02112026) describe la evidencia y límites.

Pasaron 109 pruebas unitarias frontend, ocho nuevas de US12, y 25 recorridos HTTP simulados de esta historia. Tres pruebas HTTP backend con JWT/H2 verifican snapshots, consulta del pago y aislamiento real entre cuentas de prueba. No se modifican endpoints backend ni pantallas de acceso/carta, ni se declaran terminadas sus tareas. El mecanismo específico de actualización de US13 y la aceptación del conjunto con PostgreSQL del equipo siguen pendientes.
