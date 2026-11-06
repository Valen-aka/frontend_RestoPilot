# US10 — Carta del cliente

Rama: `feature/cliente-carta`. Alcance: S2-TSK-017 y S2-TSK-018. Fuente funcional: SPEC común, US10-CA01–CA06. No depende del PR pendiente de ajustes de US14.

Como cliente autenticado, quiero consultar la carta de un restaurante, filtrarla por categoría y revisar cada plato antes de preparar mi pedido.

## Pantallas y navegación

Conservar las rutas hijas `/cliente`, `/cliente/carta` y `/cliente/plato`, el inventario y sus variantes existentes. El inicio `/cliente` presenta una bienvenida con accesos a carta, pedidos, reservas y notificaciones. El listado de platos corresponde a `/cliente/carta`; las variantes de carta y detalle reutilizan sus respectivas vistas; `vista` no inventa productos, agotamiento ni resultados vacíos. Los datos reales deciden esos estados.

- `restauranteId` identifica el local consultado; sin él, ofrecer selección entre restaurantes devueltos por la API.
- `categoriaId` conserva el filtro en la URL y al regresar del detalle. Todas las categorías permite limpiar ese filtro.
- `platoId` identifica el detalle. Parámetros explícitos inválidos o de otro local muestran error; nunca sustituyen la selección por un plato de muestra.
- Mostrar enlace de regreso a la carta y acceso al carrito. Cambiar de restaurante no mezcla productos de locales distintos.

## Contrato HTTP existente

Reutilizar AuthService/API_SESSION, CatalogoService y el interceptor. Peticiones autenticadas a GET `/restaurantes`, `/restaurantes/{id}`, `/categorias/restaurante/{id}`, `/platos/restaurante/{id}` y `/platos/{id}` según el contexto. No modificar endpoints ni usar Supabase directamente. Las categorías vacías siguen apareciendo como filtros seleccionables. Filtrar localmente únicamente los datos del restaurante consultado.

Mostrar nombre, categoría, descripción y precio retornados; el detalle incluye ingredientes, alérgenos, preparación e imagen cuando existen. No inventar ingredientes ni declarar ausencia de alérgenos si la API no informa. Las imágenes proceden de `imagenUrl`, con alternativa visible si falta, es insegura o falla. Los importes se muestran en soles.

Gestionar carga, error/reintento, sin restaurantes, carta vacía, categoría vacía, plato inexistente, acceso restringido y sesión expirada. Cancelar consultas anteriores y limpiar datos al cambiar cuenta o contexto. Una respuesta tardía no puede reemplazar otro restaurante/plato.

## Selección hacia US11

El detalle permite cantidad entera positiva y notas de hasta 255 caracteres. Bloquear platos no disponibles y locales cerrados/inactivos; reconsultar disponibilidad mediante `CarritoStore.prepareSelection` antes de navegar. Reutilizar el borrador del mismo restaurante y sumar cantidades, sin eliminar otras líneas. Si hay un carrito de otro local, solicitar confirmación explícita antes de reemplazarlo. No sustituir un pedido en envío o resultado incierto. US10 prepara un borrador, nunca registra un pedido ni un pago. La API sigue validando el pedido definitivo.

## Interfaz

Componentes standalone con TS/HTML/CSS separados, Reactive Forms, Angular Material y control de flujo moderno. Reutilizar WorkspaceShell y tokens `--rp-*`. Tarjetas en cuadrícula adaptable y detalle en dos columnas/escritorio y una/móvil. Etiquetas, errores asociados, texto de disponibilidad, foco y regiones de estado accesibles. Sin desbordamiento global a 320/390/768/1440 px.

Por instrucción explícita del usuario, esta tarea utiliza la [copia de Figma](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-). No cambia la fuente general de otras tareas. El MCP permitió consultar metadatos, código de referencia de alta fidelidad y capturas de carta desktop 84:18200/mobile 84:18420 y detalle desktop 84:40442/mobile 84:40554. La composición conserva tarjetas en cuadrícula (cuatro en escritorio, dos en móvil y una a 320 px), filtros por categoría y detalle con imagen/información.

Los datos de ejemplo del diseño no se usan como productos reales. Las imágenes de platos son dinámicas desde imagenUrl; las ausentes muestran una alternativa informativa. Se reutiliza el shell de cliente y se mantienen las áreas táctiles/tipografía del contrato Angular Material. La selección de restaurante, el acceso al carrito y las notas son adaptaciones funcionales; no se afirma equivalencia de píxeles con el prototipo.

## Criterios y pruebas

| Criterio | Resultado esperado |
|---|---|
| CA01 | Consultar un local muestra exclusivamente sus platos, precios y disponibilidad reales. |
| CA02 | Seleccionar categoría conserva la URL y filtra por ID, con opción de mostrar todas. |
| CA03 | Detalle consulta el ID exacto y muestra toda la información recibida. |
| CA04 | Agotados siguen visibles y no pueden incorporarse al carrito. |
| CA05 | Categoría sin productos muestra un mensaje y permite cambiar el filtro. |
| CA06 | 404 o ID inválido informa ausencia/error sin reutilizar otro plato. |

Verificar además cambio rápido de local, cambio de sesión, errores/reintento, URL directa, imagen fallida, cantidades/notas inválidas, combinación con carrito existente y confirmación para cambiar de restaurante. Ejecutar checker, build, regresiones compartidas y navegador con HTTP controlado. Comprobar lecturas reales y preparación del borrador sin registrar pedidos cuando el backend esté disponible. Documentar resultados y límites por separado.
