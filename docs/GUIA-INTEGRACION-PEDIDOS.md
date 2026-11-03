# Guía compartida de conexión — US11

Esta base permite continuar la integración sin duplicar sesión, HTTP ni contratos. No cambia las asignaciones del Sprint 2 ni declara terminadas las historias de acceso, carta, detalle o seguimiento.

## Qué reutilizar

| Necesidad | Archivo o método |
| --- | --- |
| URL pública de API | src/environments/environment.ts y environment.development.ts; desarrollo localhost:8081/api |
| Configuración HTTP única | src/app/app.config.ts: provideHttpClient + apiAuthInterceptor |
| Inicio/cierre de sesión | src/app/core/services/auth.service.ts: login({correo,password}), session(), logout() |
| Sesión compartida | src/app/core/auth/api-session.ts: API_SESSION; signal de AuthService, sin segunda copia |
| Token en solicitudes | src/app/core/interceptors/api-auth.interceptor.ts; solo apiUrl, excluye /auth/ |
| Guard reutilizable | src/app/core/guards/cliente.guard.ts; registrarlo al integrar rutas de acceso, no crear otro equivalente |
| Consultar catálogo | src/app/core/services/catalogo.service.ts: restaurantes(), restaurante(id), platos(id), mesas(id) |
| Preparar carrito desde selección | CarritoStore.prepareSelection(restauranteId, detalles): Observable<void> |
| Registrar pedido | PedidoService.crear(request): Observable<PedidoResponse>; lo consume CarritoStore.submit |
| Solicitudes y respuestas | src/app/core/models/; respetar DTO y enums del backend |

## Conectar el acceso

El formulario de acceso conserva su tarea y diseño pendientes. Su componente debe inyectar AuthService y llamar login con correo/password reales, gestionando carga/error y evitando doble envío. El servicio guarda en memoria únicamente la sesión retornada por POST /api/auth/login; no exige volver a implementarla en el componente.

session().subject es el ID interno de usuario convertido a string (AuthResponseDTO.id); el sub del JWT del backend es el correo. No confundirlos. Las claims se leen para comprobar coherencia/expiración, no para verificar la firma; el backend sigue autorizando cada petición. La sesión expira mediante temporizador y se limpia al recibir 401 para el mismo token. Un 403 informa permisos sin asumir automáticamente expiración.

La sesión no se persiste en localStorage/sessionStorage: al recargar se requiere login nuevamente. No guardar contraseñas, claves de Supabase ni jwt.secret en el frontend. No introducir otra persistencia o mecanismo de sesión sin acuerdo compartido.

Usar clienteGuard en canActivateChild al integrar el árbol de rutas cliente. Devuelve un UrlTree hacia /auth/login con returnUrl. Validar que el retorno sea una ruta interna del contexto permitido antes de navegar; un parámetro recibido no autoriza una URL externa. Este cambio de rutas corresponde a la tarea de autenticación y no está registrado aún.

## Conectar la selección de la carta

La pantalla de carta conserva su tarea. Consultar restaurantes/platos mediante CatalogoService. Al elegir un restaurante y los platos, pasar sus IDs del servidor; nunca nombres, slugs ni números inventados.

Ejemplo dentro del componente de carta, con servicios y router previamente inyectados:

~~~typescript
this.carrito.prepareSelection(restauranteId, seleccion.map(item => ({
  platoId: item.id,
  cantidad: item.cantidad,
  notas: item.notas ?? null
}))).subscribe({
  next: () => this.router.navigate(['/cliente/carrito']),
  error: () => this.error.set('No pudimos preparar tu selección. Revisa la carta.')
});
~~~

Gestionar la suscripción con takeUntilDestroyed y bloquear envíos repetidos desde la carta. prepareSelection consulta restaurante, platos y mesas, valida que los platos seleccionados existan, y crea el borrador con datos reales. Si cambia la sesión o llega tarde una selección anterior, no debe reemplazar la actual. La validación definitiva de atención, precios y disponibilidad se realiza de nuevo al crear el pedido en el backend.

loadDraft(CartDraft) es una alternativa para una carta que ya tenga todos los datos consultados y validados. No rellenarla con fixtures. Mantener un solo CarritoStore, sin copiarlo en la carta. Sus métodos clear/setQuantity no pueden alterar una petición en curso ni saltarse la revisión de un resultado incierto.

## Backend que debe acompañar este cambio

Rama backend: feature/restaurantes-consulta. Antes de probar catálogo se necesita su GET /api/restaurantes y GET /api/restaurantes/{id}. Son consultas autenticadas de datos públicos del restaurante. Las rutas de platos, mesas, login y creación de pedidos ya existían.

Ejecutar Spring Boot desde IntelliJ con la configuración real local del equipo. Comprobar puerto y apiUrl; no copiar credenciales al frontend ni activar inicialización de muestras para aparentar datos reales. El frontend se ejecuta desde VS Code con npm.cmd run dev.

## Pruebas reproducibles

~~~powershell
npm.cmd run check
npm.cmd run build
node --test scripts/us11-api.test.cjs scripts/us11-http-infrastructure.test.cjs
~~~

Para pruebas HTTP controladas, con Postman CLI disponible:

~~~powershell
postman simulation run postman/simulations/us11.sim.yaml --port 4312 --no-history --output ndjson
~~~

En otra terminal, levantar Angular en modo desarrollo en 4311 y ejecutar scripts/us11-api-browser.cjs con PLAYWRIGHT_MODULE apuntando a una instalación existente de Playwright. RP_QA_URL y RP_MOCK_URL permiten escoger otros puertos locales. El harness redirige solo su tráfico desde apiUrl a la simulación. No cambia environment ni agrega usuarios de prueba a la aplicación. Los datos y el token del mock son sintéticos e inválidos en el backend real. No ejecutar el mock como reemplazo del backend del equipo ni usar sus datos como evidencia de persistencia real.

El harness usa ng.getComponent únicamente en el navegador de desarrollo para invocar los servicios mientras las pantallas de acceso/carta siguen pendientes. No se incluyó ese mecanismo en el código de producto. Los endpoints /__test existen solo en el mock, no en Spring Boot.

La simulación se construyó desde los DTO/controladores y el nuevo contrato de restaurantes. No se consultaron mocks remotos del equipo porque postman status no existe en la CLI instalada. No se publicó ni desplegó ningún recurso Postman.

En backend:

~~~powershell
.\mvnw.cmd '-Dtest=ConsultaRestauranteServiceTest,Us11HttpIntegrationTest' test
~~~

Estas pruebas usan H2 aislado. Ni las pruebas con mock ni H2 certifican PostgreSQL/Supabase, despliegue o el recorrido de las pantallas asignadas a otras tareas.

## Qué sigue pendiente

- Conectar acceso/carta con estos servicios desde sus propias tareas y registrar el guard en las rutas acordadas.
- Integrar US12: GET del pedido propio y consulta de pago. No enviar un pedido real hacia las vistas de muestra como si ya lo consultaran.
- Integrar US13: nueva consulta del estado real, sin avances inventados ni polling no acordado.
- Probar el recorrido completo con la base y cuentas válidas del equipo antes de marcar S2-TSK-032 Done.

La confirmación de US11 muestra solo la respuesta guardada de creación durante la sesión actual y conserva pedidoId en la URL. Una recarga no reconstruye esa respuesta; la consulta persistente corresponde a US12. Si falta el contexto, la pantalla no afirma que el pedido nunca se registró.
