# US10 — Carta del cliente e integración API

## Alcance y base

S2-TSK-017/018. Permitir al cliente consultar restaurantes, categorías, carta y detalle de platos, conocer disponibilidad y preparar una selección real en el carrito existente. Base frontend: e3a0125 (develop, 03/11/2026). Rama: feature/carta-api. No implementar autenticación, pedidos, pagos, administración ni IA.

Reutilizar [SPEC común](../../../SPEC.md), [guía de pedidos](../../GUIA-INTEGRACION-PEDIDOS.md) y [contrato US11–13](../cliente-pedido-api/SPEC.md). Los criterios US10-CA01 a CA06 del SPEC común siguen vigentes.

## Pantallas y archivos

Conservar los siete componentes y sus archivos .ts/.html/.css en src/app/pages/cliente: cliente-inicio, cliente-carta, cliente-carta-categoria, cliente-carta-vacia, cliente-plato, cliente-plato-agotado y cliente-plato-bowl. Compartir presentación y consulta en carta-ui, sin duplicar lógica en cada variante ni cambiar rutas, loaders o los 120 identificadores.

Rutas existentes: /cliente, /cliente/carta, /cliente/plato. Parámetros de identidad propuestos: restauranteId, categoriaId y platoId, enteros positivos seguros. Parámetros repetidos o inválidos no se sustituyen por IDs de muestra. vista conserva el escenario visual, nunca fuerza vacío, agotado o una identidad contraria a la API. cliente-plato-bowl presenta el plato identificado, no presupone una recomendación de IA ni un nombre fijo.

## Contratos verificados

Fuente: controladores, entidades y DTO del backend proporcionado en RestoPilot-Trabajo/backend_RestoPilot. El checkout backend original puede tener otra revisión; verificar compatibilidad antes de aceptación real. apiUrl ya incluye /api.

| Operación | Respuesta |
| --- | --- |
| GET /restaurantes | RestauranteResponse[] |
| GET /restaurantes/{id} | RestauranteResponse |
| GET /categorias/restaurante/{restauranteId} | Categoria[] (entidad serializada, no sobre paginado) |
| GET /platos/restaurante/{restauranteId} | PlatoResponse[] |
| GET /platos/{id} | PlatoResponse; 404 inexistente |
| GET /mesas/restaurante/{restauranteId} | MesaResponse[], utilizado internamente por prepareSelection |

GET /platos?restauranteId=…&categoriaId=… también existe y devuelve {mensaje,platos}; no confundirlo con la lista anterior. Para esta entrega el filtro se aplica sobre la lista completa consultada por restaurante; las categorías se consultan aparte para poder representar categorías vacías.

Reutilizar RestauranteResponse, PlatoResponse, MesaResponse y DetallePedidoRequest. Añadir solo CategoriaResponse de lectura: id, restauranteId, nombre, descripcion nullable, creadoEn y actualizadoEn nullable. Verificar IDs, relación al restaurante, tipos, precios finitos no negativos y disponibilidad; no convertir respuestas malformadas en listas vacías. El detalle verifica que el restaurante coincide con el contexto solicitado.

Restaurante: activo, abierto, tieneAtencionFisica, aceptaDelivery, dirección y horarios. Plato: nombre, categoría, descripción, precio, imagenUrl, ingredientes, alérgenos, complejidad, tiempoPreparacionMinutos, disponible y fechas. No inventar ingredientes, alérgenos, imágenes, tiempos ni garantías de ausencia de contaminación cruzada cuando falten datos.

## Consulta, selección y estados

- Sin sesión de cliente vigente: explicar acceso requerido y enlazar /auth/login; no consultar ni insertar una sesión ficticia.
- Inicio: consultar restaurantes y permitir elegir uno explícitamente. Nunca fijar un restaurante por nombre o ID de muestra.
- Carta: conservar restauranteId en enlaces; mostrar categorías reales, opción Todas y platos filtrados. No mezclar restaurantes.
- Detalle: requiere platoId real; consultar GET /platos/{id}, verificar pertenencia y mostrar todos los campos disponibles. Información ausente se comunica como no informada.
- Carga: mensaje accesible, sin mostrar datos del restaurante anterior; bloquear acciones dependientes.
- Vacío: distinguir ausencia de restaurantes, carta sin platos y categoría sin platos; permitir volver a Todas.
- Error: distinguir identificador inválido, 401, 403, 404, fallo de red/servidor y contrato inválido. Ofrecer reintento cuando corresponda; no presentar éxito.
- Agotado: mostrar estado textual e impedir añadir. Cambiar vista no cambia disponible.
- Restaurante cerrado/inactivo: mostrar condición e impedir iniciar selección; la autorización definitiva pertenece al backend.
- Cancelar consultas al cambiar parámetros, destruir vista o cambiar sesión; descartar respuestas tardías. No persistir sesión ni selección adicional en localStorage.

## Conexión con carrito

Utilizar una única instancia de CarritoStore. Añadir selección mediante prepareSelection(restauranteId, detalles), enviando únicamente platoId, cantidad y notas. Reconsultar catálogo y condiciones mediante ese método; navegar a /cliente/carrito únicamente tras completar correctamente la preparación.

Conservar las líneas existentes del mismo restaurante, incrementar el plato elegido y respetar notas existentes. No mezclar locales ni reemplazar silenciosamente un carrito de otro restaurante: informar que debe revisarse/vaciarse desde el carrito. Bloquear doble envío y cambios durante submitting/uncertain. Cantidades enteras 1..2147483647 y suma dentro del rango; no usar cero, decimales, NaN o infinito. No duplicar IDs en detalles. Las notas conservadas tienen máximo 255 caracteres.

La consulta y preparación no crean pedidos ni cobran. Los precios de la carta son informativos; el total definitivo lo confirma US11. No modificar PedidoService, PagoService ni AuthService para conectar US10.

## Permisos y dependencias

Las consultas requieren autenticación según SecurityConfig. La interfaz US10 es de cliente; el backend vuelve a validar cada operación. API_SESSION e interceptor existentes son la única infraestructura de sesión/HTTP.

Acceso sigue asignado a otra tarea: no implementar su formulario ni introducir un login de prueba en producto. La aceptación conjunta requiere acceso conectado, backend compatible y datos reales. Las pruebas aisladas pueden inyectar una sesión sintética exclusivamente en el harness.

## Diseño y accesibilidad

Fuente autorizada: Figma original wBq85sZ8G5W5RQ1RmQmdqg, página 5:92; aplicar tokens/Material del SPEC común. El 03/11/2026 get_design_context no entregó contexto y metadata/screenshot fueron bloqueados por límite MCP Starter. No se acredita comparación visual. El usuario rechazó expresamente usar una apariencia provisional: las siete plantillas y su conexión a eventos se dejan pendientes hasta recuperar Figma. No afirmar fidelidad verificada.

Mantener títulos, labels, texto de estado además del color, foco visible, teclado y mensajes aria-live. Imágenes de platos provienen del DTO; sin imagen mostrar ausencia, no una foto de otro plato. Conservar los recursos locales de marca. Verificar móvil, escritorio, zoom y ausencia de desbordamiento.

## Aceptación y pruebas

1. US10-CA01/02: restaurante y categorías reales; filtros correctos, incluida categoría vacía.
2. US10-CA03: detalle completo de identidad correcta, campos ausentes explícitos y precio del DTO.
3. US10-CA04: agotado no admite inclusión aunque se use otra variante visual.
4. US10-CA05/06: vacío e inexistente distinguibles de fallo de red.
5. Cantidades válidas, acumulación sin duplicados, separación entre restaurantes, cancelación de consultas obsoletas y protección de sesión.
6. prepareSelection real conserva selección previa ante error, evita doble envío y navega únicamente tras éxito; sin POST desde carta.
7. Continuidad con US11/12/13 y regresión US15/19; no recrear estos contratos.
8. npm run check conserva 120 escenarios; npm run build; pruebas unitarias/contrato y navegador identifican explícitamente HTTP simulado frente a backend real.

Pendiente registrar comandos/resultados ejecutados y aceptación contra el entorno compartido. No declarar Done por compilar o por mock.

## Entrega parcial verificada — 03/11/2026

Por instrucción expresa del usuario, no se implementó apariencia provisional. Las siete pantallas mantienen su estado pendiente y el manifiesto no se modifica. CartaStore y CartaSelection están preparados y probados, pero todavía NO son invocados desde las pantallas. US10 no está terminada ni existe un nuevo recorrido de usuario visible.

Implementado: CategoriaResponse, validadores de lectura, CatalogoService.categorias/plato, CartaContext, CartaStore (consulta/filtro/errores/cancelación) y CartaSelection (adaptador a CarritoStore.prepareSelection, sin segundo carrito). La futura vista debe proveer CartaStore y CartaSelection por instancia, interpretar queryParamMap con cartaContext y llamar load(context) al cambiar parámetros. CartaStore observa API_SESSION directamente; no recibe un booleano de autorización. Al desmontarse se cancelan consultas y preparación. CarritoStore sigue siendo la única instancia compartida del borrador. La futura vista invoca add con restaurante/plato consultados y cantidad válida; el adaptador navega únicamente tras completar prepareSelection.

Verificaciones ejecutadas:

```powershell
npm.cmd run verify
node --test scripts/us10-api.test.cjs scripts/us10-carrito.test.cjs scripts/us11-api.test.cjs scripts/us11-http-infrastructure.test.cjs scripts/us12-api.test.cjs scripts/us13-seguimiento.test.cjs scripts/us15-api.test.cjs scripts/us19-api.test.cjs
```

Resultado: build correcto; 120 escenarios conservados (26 interfaces declaradas, 94 pendientes); 63 pruebas correctas, 0 fallidas: 18 nuevas de US10/continuidad y 45 regresiones existentes. Además se verificó TypeScript con los nuevos archivos como raíces explícitas porque aún no los importan las pantallas: 0 diagnósticos. Los tests usan datos sintéticos solo en scripts; la continuidad ejecuta los servicios/stores reales con HttpClient simulado. No se ejecutó navegador, comparación Figma ni backend real. No se acredita persistencia PostgreSQL ni aceptación integrada de UI.

La documentación de acceso pendiente corresponde al commit base e3a0125. Durante el trabajo develop avanzó externamente a b210dc8 (incluye cambios de auth/inicio); no se integraron ni sobrescribieron esos avances en esta rama. Antes de reanudar UI, revisar ese nuevo develop y la interfaz de acceso con su mantenedor. No atribuir a la base de esta entrega los cambios de otra revisión.

## Revisión de navegación y sesión — 03/11/2026

Se integró origin/develop b210dc8 mediante merge normal 5dec04c, conservando los cuatro commits iniciales y el historial del equipo. No hubo conflictos. El acceso incorporado sigue siendo visual: no llama AuthService.login. No se implementaron las siete pantallas ni se modificaron ScreenHost, rutas, estilos o manifiesto para US10.

### Contrato técnico para los futuros componentes

- Declarar providers: [CartaStore, CartaSelection] en la vista compartida de US10. No proveer otro CarritoStore, CatalogoService, API_SESSION ni autenticación. CartaSelection ya no tiene providedIn root: su vida corresponde a la vista.
- Convertir queryParamMap con cartaContext(params, esDetalle) y llamar store.load(context). La vista solo controla el contexto; no decide la autenticación. Cada nueva carga cancela la anterior. Conservar restauranteId/categoriaId/platoId válidos en los enlaces; vista no cambia estados reales.
- CartaStore observa identidad, rol, token y vencimiento de API_SESSION. Oculta datos de una identidad anterior desde sus señales públicas, antes de ejecutar el efecto; cancela y vuelve a consultar el último contexto al cambiar sesión. Sin sesión válida no consulta. AuthService sigue siendo responsable del temporizador de expiración; no se añade otra sesión ni persistencia.
- Cada respuesta comprueba generación e identidad vigente antes de aceptarse. Destruir la vista cancela las suscripciones, elimina los datos y evita cargas posteriores. store.cancel() invalida explícitamente un contexto sin navegación y no lo reactiva al cambiar sesión.
- state distingue loading, ready, error y session. empty solo es true tras lectura exitosa de una lista vacía (restaurantes/carta/categoría). soldOut solo es true para detalle confirmado no disponible. No usar vacío para errores o carga.
- selection.add(restaurante, plato, cantidad) conserva las validaciones y el único borrador de US11. Ignora dobles envíos mientras prepara y llamadas durante una navegación pendiente. Captura URL de origen e identidad; solo navega si ambas siguen vigentes.
- NavigationStart cancela la preparación, incluso al cambiar query, volver atrás o iniciar una navegación que luego sea rechazada. Es una cancelación conservadora: en ese último caso el usuario puede reintentar. Destruir la vista o cambiar sesión también cancela. selection.cancel() sirve para invalidar cambios de contexto que no actualicen la URL.
- Cancelar preparación no vacía el carrito previo. Una respuesta HTTP cancelada no lo reemplaza ni navega. Si la preparación ya concluyó, el borrador válido permanece en el carrito.

Se añadió una comprobación mínima en CarritoStore.prepareSelection: además del usuario/generación/sesión vigente, exige que token y expiresAt coincidan antes de loadDraft. Es necesaria porque ese método modifica el borrador antes del callback del adaptador; una respuesta del token anterior podría llegar antes de los efectos de Angular. No se cambió registro de pedidos, pagos, modalidades ni totales.

### Evidencia de esta revisión

- TypeScript con carta-store.ts, carta-selection.ts y carta.model.ts como raíces explícitas: 0 diagnósticos. Siguen sin estar conectados a las pantallas.
- npm.cmd run verify: compilación Angular correcta y 120 escenarios conservados; 34 interfaces declaradas y 86 pendientes. El incremento corresponde a las pantallas incorporadas de develop, no a US10. Se conserva el nuevo chequeo de ocho diálogos.
- Comando de suites de la entrega anterior: 75 pruebas correctas, 0 fallidas (30 US10/continuidad y 45 regresiones US11/12/13/15/19).
- Nuevos casos: salida de carta, cambio de query y retorno al origen, destrucción de solo la vista con carrito conservado, navegación en curso, cancelación explícita, token/usuario/vencimiento cambiados antes del efecto, datos ocultos inmediatamente, respuestas obsoletas, carga/vacío/agotado y doble envío.

Estas pruebas ejecutan stores/servicios con transporte HTTP simulado y eventos de Router simulados. No son pruebas de navegador ni contra backend real. Permanecen pendientes el diseño autorizado, las siete interfaces, su conexión a eventos, la autenticación integrada y aceptación visual/funcional conjunta. US10 no está terminada.


## Controladores de las siete pantallas — 04/11/2026

Estado actual: US10 parcialmente completada, con presentación bloqueada. Esta sección actualiza el estado histórico anterior: las siete clases Angular ahora heredan CartaPage, proveen CartaStore/CartaSelection por instancia y leen queryParamMap en ngOnInit. Sus HTML/CSS siguen pendientes: todavía no existen controles visibles ni eventos de plantilla conectados. contenidoImplementado permanece false en las siete entradas del manifiesto.

CartaPage concentra el enlace entre ruta y stores sin duplicar HTTP ni carrito. Cancela al cambiar parámetros, iniciar navegación o destruir la vista; reinicia cantidad e imágenes fallidas al cambiar contexto. Reintenta la consulta del contexto actual. Ofrece selección de restaurante y categoría solo entre los datos consultados, navegación a detalle con IDs reales y retorno a carta. Sustituye los parámetros en vez de arrastrar IDs de otro restaurante. Ante navegación rechazada/error recupera la consulta e informa el fallo. No se cambiaron ScreenHost, rutas, tema, autenticación ni CarritoStore.

La cantidad utiliza FormControl con validQuantity (entero 1..2147483647); detalle pasa su valor al adaptador y listado pasa una unidad. Solo se aceptan platos presentes en los datos de la vista. CartaSelection mantiene todas las validaciones definitivas de sesión/restaurante/disponibilidad/borrador. La variante bowl bloquea addDish y retorna a la ruta existente /cliente/asistente?vista=cliente-ia-recomendaciones con restauranteId; no implementa US03 ni garantiza que esa pantalla esté integrada. Estas son decisiones funcionales del controlador; el comportamiento visual de + sigue pendiente de contrastar.

imageFor utiliza dishImage y devuelve null si la URL falla; no sustituye fotografías ni inventa información alimentaria. El futuro template deberá invocar imageFailed desde error y mostrar ausencia explícita. Falta conectar todos estos métodos a controles y enlaces Material cuando se recupere el diseño.

### Referencias y bloqueo visual verificado

Se revisaron las siete exportaciones originales de referencias/figma/US10 (cada una contiene escritorio y móvil). No equivalen a respuestas MCP. get_design_context del original wBq85sZ8G5W5RQ1RmQmdqg, página 5:92, devolvió ausencia de selección; get_metadata y get_screenshot confirmaron nuevamente límite Starter. No se obtuvieron IDs de los siete frames ni contexto de alta fidelidad.

La skill figma-design-to-code exige implementar exclusivamente desde respuestas de alta fidelidad de get_design_context. Se conserva ese requisito y no se modifica la skill. Permanecen bloqueados cabecera/pie, bloque promocional, tarjetas, pestañas, ficha, estados visuales, recursos exactos, CSS responsive y comparación de las siete interfaces. Los PNG sirven para análisis, no se incorporan como interfaz ni fondo. La selección visual de restaurante tampoco aparece en las exportaciones y requiere resolver su composición con las referencias autorizadas.

### Git y dependencias

Base conservada: 9c153b7 en feature/carta-api. Tras fetch, origin/develop está en 6381fb3; sus avances posteriores a b210dc8 afectan reservas US05/US06, reserva-ui y cuatro entradas de su manifiesto. No modifican catálogo, sesión, carrito, rutas ni componentes compartidos. No se fusionaron ni se cambió el historial. El manifiesto de este trabajo modifica únicamente los estados de las siete entradas US10.

La copia original local del backend está en fix/cambios y contiene RestauranteController.java vacío, además de un cambio local preexistente en .idea/compiler.xml; no se tocó. La copia backend_RestoPilot de RestoPilot-Trabajo sí contiene GET /api/restaurantes y /api/restaurantes/{id}, para CLIENTE/ADMINISTRADOR/DUENO. No asumir que esos endpoints existen en la rama activa del backend. Los controladores de platos/categorías y PlatoResponseDTO se revisaron; no se añadieron endpoints ni propiedades.

La consulta real a http://localhost:8081/api/restaurantes terminó en conexión rechazada. No se dispone de backend ejecutándose para aceptación autenticada. Sigue pendiente el acceso integrado de su tarea correspondiente; no se crean credenciales ni sesiones de producto ficticias.

### Verificación ejecutada

- npm.cmd run verify: correcto; 120 escenarios conservados, 34 interfaces declaradas y 86 pendientes; build Angular correcto.
- node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json: sin diagnósticos. Ahora los controladores y stores forman parte del grafo compilado de las pantallas.
- node --test scripts/us10-api.test.cjs scripts/us10-carrito.test.cjs scripts/us10-components.test.cjs scripts/us11-api.test.cjs scripts/us11-http-infrastructure.test.cjs scripts/us12-api.test.cjs scripts/us13-seguimiento.test.cjs scripts/us15-api.test.cjs scripts/us19-api.test.cjs: 84 correctas, 0 fallidas.
- Nueve pruebas nuevas de clases de componente y navegación con ActivatedRoute/Router/stores controlados: siete clases, cambios de query/destrucción, navegación saliente, IDs, cantidad, bowl, sesión, imágenes y navegación rechazada. No son pruebas DOM ni clics de navegador.
- Las 75 pruebas anteriores incluyen stores/servicios reales con transporte simulado y continuidad US11–13/regresión US15/US19. No certifican el backend real.

Pendiente: presentación y enlaces/eventos HTML de las siete pantallas; DOM/navegador, responsive, teclado/zoom, fidelidad visual, recorrido autenticado y aceptación contra backend compatible. No se generan capturas de pantallas terminadas porque no existen aún. No se declara US10 Done.
