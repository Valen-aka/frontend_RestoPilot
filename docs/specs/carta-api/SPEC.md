# US10 — Carta del cliente e integración API

## Alcance y base

S2-TSK-017/018. Permitir al cliente consultar restaurantes, categorías, carta y detalle de platos, conocer disponibilidad y preparar una selección real en el carrito existente. Base histórica: e3a0125; presentación implementada sobre d13a814 (04/11/2026), conservando el merge 5dec04c y todos los commits previos. Rama: feature/carta-api. No implementar autenticación, pedidos, pagos, administración ni IA.

Reutilizar [SPEC común](../../../SPEC.md), [guía de pedidos](../../GUIA-INTEGRACION-PEDIDOS.md) y [contrato US11–13](../cliente-pedido-api/SPEC.md). Los criterios US10-CA01 a CA06 del SPEC común siguen vigentes.

## Pantallas y archivos

Conservar los siete componentes y sus archivos .ts/.html/.css en src/app/pages/cliente: cliente-inicio, cliente-carta, cliente-carta-categoria, cliente-carta-vacia, cliente-plato, cliente-plato-agotado y cliente-plato-bowl. Compartir presentación y consulta en carta-ui, sin duplicar lógica en cada variante ni cambiar rutas, loaders o los 120 identificadores.

Rutas existentes: /cliente, /cliente/carta, /cliente/plato. Parámetros de identidad: restauranteId, categoriaId y platoId, enteros positivos seguros. Parámetros repetidos o inválidos no se sustituyen por IDs de muestra. vista conserva el escenario visual, nunca fuerza vacío, agotado o una identidad contraria a la API. cliente-plato-bowl presenta el plato identificado, no presupone una recomendación de IA ni un nombre fijo.

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

## Fuente visual recuperada — 04/11/2026

El usuario autorizó expresamente el [duplicado de RestoPilot](https://www.figma.com/design/6dDJNh7MMb3pU1UbL8sb2r/RestoPilot--copia-?node-id=5-92) para continuar esta tarea. Es una excepción específica de US10, no un cambio de AGENTS.md ni de la skill global. MCP verificó la cuenta institucional solicitada; get_design_context devolvió código de alta fidelidad y capturas de los catorce frames siguientes. Se contrastaron con las siete exportaciones originales, con la misma composición escritorio/móvil. El bloqueo del archivo original no se considera resuelto por disponer del duplicado.

| Pantalla | Frame escritorio (1440 px) | Frame móvil (390 px) | Composición |
| --- | --- | --- | --- |
| cliente-inicio | 84:31980 | 84:32241 | Hero original, navegación, hasta cuatro platos de la consulta; sin restaurante, selector explícito |
| cliente-carta | 84:18200 | 84:18420 | Categorías reales y tarjetas |
| cliente-carta-categoria | 84:17644 | 84:17860 | Misma lista, filtrada por categoriaId |
| cliente-carta-vacia | 84:18072 | 84:18140 | Vacío solo cuando la consulta devuelve cero resultados |
| cliente-plato | 84:40442 | 84:40554 | Detalle, cantidad y selección |
| cliente-plato-agotado | 84:40038 | 84:40135 | Compra deshabilitada solo si disponible=false |
| cliente-plato-bowl | 84:40224 | 84:40337 | Información y retorno; nunca cantidad ni compra |

## Composición y recursos

- Los siete componentes conservan providers [CartaStore, CartaSelection] y heredan CartaPage. Sus HTML importan CartaView y pasan el controlador y modo. No existen nuevos stores, endpoints ni datos de muestra en producto.
- CartaView (.ts/.html/.css en pages/cliente/carta-ui) compone listas, ficha y estados. Reutiliza client-header/client-footer, antes pendientes, implementados exclusivamente para esta composición. No se modificaron cliente-layout, workspace-shell, ScreenHost, rutas, loaders, tema global ni otras US.
- Inicio muestra hasta los primeros cuatro platos de la consulta; no presupone que el backend ofrezca ranking ni destacados. Todas las categorías y textos de platos proceden de los DTO. La promoción conserva textos de diseño, sin fijar el restaurante de ejemplo.
- Cabecera y pie conservan geometría y enlaces del diseño. La identidad visible es «Cliente»: API_SESSION no conserva nombre/avatar. No se muestra Ana Pérez ni se inventa un usuario. Cerrar sesión llama AuthService.logout.
- Hero: assets/carta/inicio-desktop.svg (340 × 289) e inicio-mobile.svg (210 × 178.5), descargados literalmente con curl desde get_design_context, sin editar rutas SVG ni dimensiones raíz. Se usa picture para la variante móvil. No se incorporaron capturas como interfaz.
- Marca: reutiliza assets/carrito/brand-reference.png, idéntico byte a byte al PNG de Figma (SHA-256 10c26dd4ac9f2eb0f83d849a284f29c7cc3a5185f5854fb75d9cd5327144a325); conserva el overlay blanco original. No se duplica el archivo.
- Fuentes: Roboto y Open Sans locales ya existentes en assets/pedido/fonts, declaradas con familias Carta Roboto/Carta Open Sans. Colores de marca reutilizan --rp-navy y --rp-brand-green. Superficies/espaciados propios del frame se limitan a CSS local; no cambian el contrato global.
- Las imágenes de platos siguen siendo imagenUrl del DTO. URL ausente, no segura o error de carga muestra «Imagen no disponible»; no hay fallback de otro plato. Los SVG en scripts/fixtures/us10 son exclusivos del harness y no se publican como datos de catálogo.
- Cabecera, tarjetas y ficha usan flex/grid adaptativo; cuatro columnas en escritorio y dos en móvil. Los títulos y descripciones pueden crecer sin recortarse. Se verificaron también anchos 320, 720, 768 y 1024.

### Adaptaciones funcionales y accesibles del prototipo

Se omiten las etiquetas internas RP/xxx y textos «de muestra». Precio, disponibilidad, tiempos, ingredientes y alérgenos son dinámicos. El subtítulo editorial del detalle se sustituye por el nombre real porque el DTO no ofrece ese campo. Los campos ausentes se identifican como no informados. Bowl informa que no hay datos de contaminación cruzada: no garantiza su ausencia ni implementa IA.

Los botones y formularios son Material; los dos formularios utilizan FormGroup con los FormControl existentes para impedir un submit nativo que recargue la página. El detalle conserva el enlace de regreso solicitado. Las categorías tienen altura táctil de 44 px; el + mantiene su apariencia de 30 px con área extendida. Estas adaptaciones y los textos dinámicos impiden afirmar igualdad píxel a píxel para cualquier dato real. No se cambian los SVG originales para compensar diferencias de contenido.

Los estados de sesión/carga/error y selector de restaurante componen los controles Material y el patrón de estado ya utilizado en el proyecto; no existen frames específicos de estos estados en las siete referencias. Hay etiquetas accesibles, mensajes status/alert, disponibilidad textual y foco visible. No se oculta overflow global para disimular desbordamientos. La prueba de reflujo a 720 px no equivale a certificación de zoom nativo ni de lector de pantalla.

## Navegación, sesión y selección

CartaPage lee queryParamMap con cartaContext, cancela selección/consulta en NavigationStart y reinicia cantidad e imágenes fallidas al cambiar parámetros. CartaStore y CartaSelection mantienen sus protecciones previas de generación, identidad completa de sesión, expiración y destrucción. No se modificaron en esta entrega.

Los enlaces a detalle incluyen restauranteId/platoId/categoriaId. Todos elimina categoriaId. Volver a carta conserva restauranteId. Bowl retorna a /cliente/asistente?vista=cliente-ia-recomendaciones con restauranteId: no garantiza que la pantalla de recomendaciones de otra tarea esté integrada. Los enlaces de cabecera conservan el restaurante, sin arrastrar vista ni IDs de platos a otros módulos.

El botón + añade una unidad; la ficha usa quantity del controlador. La preparación llama CartaSelection.add y el único CarritoStore.prepareSelection. Se conservan líneas y notas previas, se impide mezclar restaurantes y se navega solo tras preparar correctamente. No se ejecuta POST de pedido ni pago desde US10. Doble clic, cambio de contexto, logout o respuesta tardía no crean otra selección ni provocan navegación posterior.

## Criterios y evidencia

US10-CA01/02: consulta de restaurante y categorías; CA03: detalle e identidad; CA04: indisponible bloquea compra; CA05: vacío verdadero; CA06: inexistente se informa sin inventar un plato. Se cubren además cantidades, acumulación, aislamiento de sesión, errores, cancelación y continuidad con carrito.

Comandos desde la raíz:

```powershell
npm.cmd run verify
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json
node --test scripts/us10-api.test.cjs scripts/us10-carrito.test.cjs scripts/us10-components.test.cjs scripts/us11-api.test.cjs scripts/us11-http-infrastructure.test.cjs scripts/us12-api.test.cjs scripts/us13-seguimiento.test.cjs scripts/us15-api.test.cjs scripts/us19-api.test.cjs
node scripts/us10-ui-browser.cjs
```

El harness requiere Playwright ya disponible (PLAYWRIGHT_MODULE permite señalar la instalación existente), Chrome en Windows o BROWSER_EXECUTABLE y ng serve --host 127.0.0.1 --port 4310. RP_QA_URL debe ser local; RP_QA_OUTPUT permite elegir la carpeta de evidencia (por defecto, directorio temporal/restopilot-us10-qa). No requiere instalar dependencias ni modificar environment. Intercepta únicamente el navegador de prueba; AuthService real recibe un login sintético. La aplicación no contiene acceso de prueba.

- Angular y TypeScript: compilación sin errores.
- Estructura: 120 escenarios, 41 interfaces declaradas y 79 pendientes; solo cambian estados de las siete entradas US10. El conteo no certifica integración.
- 84 pruebas preexistentes conservadas, 0 fallos; incluyen continuidad US11–13 y regresión US15/19 con transporte controlado.
- 38 recorridos nuevos DOM/HTTP simulados, 0 fallos: siete variantes en dos anchos, selección/filtro, detalle/cantidad, carrito y doble clic, salida durante preparación, logout, expiración/cambio de identidad, consulta obsoleta, 401/403/404/500, reintento, imágenes fallidas, campos ausentes, IDs inválidos, teclado/foco, textos largos y restaurante cerrado.
- Catorce capturas de página completa y archivos de geometría de imágenes; todos los slots de imagen visibles cargan. Hero conserva medidas originales en ambos anchos y marca conserva slot de 43 × 43. Revisión visual frente a las capturas MCP; sin sustituciones de assets estáticos.
- La aceptación visual usa fixtures identificados en el harness; no prueba PostgreSQL, persistencia ni la autorización del servidor.

## Integración con backend real — 04/11/2026

Se revisó el backend original actualizado en develop 734bc95, igual a origin/develop tras fetch, limpio antes de trabajar. El hallazgo anterior de RestauranteController vacío quedó obsoleto: ahora ya existen ConsultaRestauranteService, repositorio, DTO y controlador funcionales. La rama backend feature/us10-catalogo-integracion parte de esa base; no se fusionó ninguna rama.

### Cambios aplicados

- acceso.ts/acceso.html: el formulario existente llama AuthService.login, bloquea doble envío y edición durante la consulta, muestra errores 401/403/red, limpia contraseña y cancela al destruirse. No se rehízo la apariencia ni se implementó registro.
- Tras login se usa el destino existente del rol; returnUrl solo admite rutas internas del mismo rol, sin URL externa, traversal ni outlets secundarios. La carta conserva su URL completa al enlazar al acceso, incluidos restaurante/plato/categoría.
- CartaView solo añade el enlace de retorno. CatalogoService, CartaStore, CartaSelection, CartaPage, CarritoStore, ScreenHost, guards, interceptores y las siete interfaces conservan su implementación.
- Sesión única en memoria de AuthService: JWT real, validación de claims, temporizador de expiración y logout existentes. Recargar exige iniciar sesión nuevamente. No se añadieron tokens a localStorage/sessionStorage ni una segunda autenticación.
- Las rutas de carta conservan la pantalla explicativa de acceso requerido, sin consultar HTTP ni exponer datos cuando falta sesión. El servidor mantiene autenticación obligatoria. No se retiraron guards ni se debilitaron reglas de seguridad.
- Backend: no hubo que modificar controladores ni servicios de producción. Se añadió Us10HttpIntegrationTest para verificar contratos, aislamiento, disponibilidad, errores y CORS; opcionalmente lanza el navegador contra el servidor real de esa prueba.

### HTTP real comprobado

Servidor Spring Boot real, filtro JWT, BCrypt, servicios, repositorios JPA y base H2 en memoria aislada en modo PostgreSQL. No es un mock HTTP; tampoco acredita PostgreSQL o Supabase.

| Endpoint | Resultado verificado |
| --- | --- |
| POST /api/auth/login | 200 con JWT válido; 401 con contraseña incorrecta; login por formulario |
| OPTIONS /api/auth/login | 200 y Access-Control-Allow-Origin para localhost:4200 |
| GET /api/restaurantes | 200 lista autenticada; 403 sin sesión |
| GET /api/restaurantes/{id} | 200 DTO real; 404 inexistente |
| GET /api/categorias/restaurante/{id} | 200 categorías del restaurante, incluida categoría sin platos |
| GET /api/platos/restaurante/{id} | 200 lista con disponible=false conservado; [] para local vacío |
| GET /api/platos/{id} | 200 detalle, precio, categoría, campos null; 404 inexistente; 400 ID no numérico |
| GET /api/platos?restauranteId=…&categoriaId=… | 200 con lista vacía para categoría vacía o de otro restaurante, sin mezclar locales |
| GET /api/mesas/restaurante/{id} | Consulta real desde prepareSelection, respuesta vacía válida |

Restaurantes y mesas permiten CLIENTE/ADMINISTRADOR/DUENO. Lecturas de categorías/platos requieren autenticación global; escrituras conservan permisos administrativos y validación de pertenencia. No hay endpoint de carrito: el borrador del frontend usa prepareSelection; no se registra pedido ni pago al añadir.

### Verificaciones de esta entrega

- Todas las pruebas frontend disponibles: 217 correctas, incluidas las 84 exigidas y 6 nuevas de login/retorno/cancelación; sin fallos.
- Se repitieron los 38 recorridos DOM/HTTP simulados existentes: correctos.
- Backend: 105 pruebas previas correctas; se añadieron 2 pruebas HTTP de US10. Suite completa: 107 correctas, 0 fallidas.
- E2E real con navegador: dos recorridos, 1440 y 390 px, Angular → formulario de login → Spring Boot/JWT → JPA/H2 → restaurante → categoría → detalle/cantidad → carrito. También contraseña incorrecta, doble clic, vacío, agotado, cambio de local, bowl, 404 y logout. No se generó POST /pedidos ni cobro.
- El harness real solo redirige el puerto configurado 8081 hacia el puerto aleatorio del servidor de prueba; no usa route.fulfill ni devuelve respuestas sintéticas. Los registros de prueba se crean mediante repositorios del backend en H2 aislado; no se alteran bases existentes.
- Capturas reales de carta, detalle y carrito en ambos anchos: sin desbordamiento horizontal, datos persistidos y fallback cuando imagenUrl es null. Las otras variantes conservan las capturas y pruebas visuales de la suite de 38 recorridos.

### Ejecución reproducible

Frontend: Node compatible con package.json; npm.cmd run verify, TypeScript y node --test con los scripts *.test.cjs/*.test.mjs. Ejecutar ng serve --host 127.0.0.1 --port 4310 para los harnesses.

Backend: Java 21 existente (no Java 25 predeterminado, incompatible con el procesador Lombok de esta revisión), Maven Wrapper y .\mvnw.cmd '-DforkCount=0' test. Para incluir E2E real, definir RP_US10_BROWSER con la ruta absoluta a scripts/us10-real-browser.cjs del frontend y RP_NODE con node.exe; PLAYWRIGHT_MODULE señala la instalación existente de Playwright si no está en resolución normal. El test inicia Spring Boot en un puerto aleatorio, pasa IDs y credenciales exclusivamente de prueba al proceso hijo y cierra el servidor. RP_REAL_OUTPUT permite guardar las capturas y results.json. No se imprime ni persiste el JWT.

Para ejecución normal con PostgreSQL, proporcionar mediante la configuración local existente DB_URL (JDBC), DB_USERNAME, DB_PASSWORD y JWT_SECRET válido en Base64. No copiar credenciales de pruebas. Revisar docs/sql/actualizacion_tb2.sql antes de usar una base antigua; no se ejecutaron migraciones ni ddl sobre una base existente. El perfil supabase exige esquema validado y SSL; no se activó ni modificó.

### Bloqueo externo y clasificación

PostgreSQL 18 está ejecutándose en localhost:5432 y pg_isready informa que acepta conexiones (cliente psql 18.6). No existe .env en el backend original ni variables DB_URL/DB_PASSWORD/JWT_SECRET en el proceso; no hay pgpass configurado. Se intentó spring-boot:run con Java 21 y la configuración existente: falló por el placeholder JWT_SECRET no resuelto. No se inventaron contraseñas ni se cambiaron configuraciones de producción. La existencia, esquema y datos de la base de destino todavía no pueden comprobarse sin esa configuración.

**IMPLEMENTADA, PENDIENTE DE VALIDACIÓN** en PostgreSQL y en el entorno compartido. La funcionalidad ya tiene evidencia E2E con backend HTTP/JWT/JPA real sobre H2; falta repetirla con la configuración PostgreSQL autorizada. No se declara aceptación final ni autorización para integrar develop. Se mantienen las siete interfaces, 120 escenarios y contratos de US11–13/US15/US19. No se hizo push, PR ni merge.
