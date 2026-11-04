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

## Dependencias y aceptación real pendiente

El 04/11/2026 localhost:8081/api/restaurantes no respondió (HTTP 000, conexión no disponible). No se ejecutó un recorrido autenticado contra backend real. La copia backend original contiene RestauranteController.java vacío; la copia de referencia de RestoPilot-Trabajo sí incluye los GET de restaurantes. El equipo debe ejecutar una revisión compatible antes de aceptar el flujo real.

La pantalla de acceso aún no llama AuthService.login en esta rama. Corresponde a su mantenedor conectarla a la infraestructura existente; no se implementa US02 dentro de US10. Sin esa conexión, el producto muestra correctamente acceso requerido; las pruebas de UI autentican exclusivamente en el harness.

La implementación de las siete interfaces y eventos queda disponible para revisión, no se declara US10 aceptada de extremo a extremo. Antes de integrar: revisar visualmente con el equipo, resolver login/backend compatible y ejecutar con sesión real los seis criterios. origin/develop 6381fb3 contiene avances de reservas separados; no se fusionó ni se hizo push/PR en esta entrega.
