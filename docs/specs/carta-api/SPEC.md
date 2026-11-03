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

Fuente autorizada: Figma original wBq85sZ8G5W5RQ1RmQmdqg, página 5:92; aplicar tokens/Material del SPEC común. El 03/11/2026 get_design_context no entregó contexto y metadata/screenshot fueron bloqueados por límite MCP Starter. No se acredita comparación visual. La decisión de usar provisionalmente la base visual existente se consulta al usuario; no afirmar fidelidad verificada.

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
