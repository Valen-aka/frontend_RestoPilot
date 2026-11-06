# Mejoras visuales — 06/11/2026

Solicitud: mejorar el aspecto y la coherencia de la aplicación mediante revisión de navegador, sin consultar Figma. Rama: fix/coherencia-visual. No cambia responsables, rutas, DTO ni reglas del servidor.

## Cambios

- Una composición de marca reutilizable, con variantes para fondos claros y oscuros y un recurso local existente. Sustituye logos tapados, recortados de forma distinta o ausentes.
- Marco administrativo y sidebar en las cinco vistas de platos (listado, alta, edición, disponibilidad y eliminación), reutilizando WorkspaceShell. Se conserva la sesión, los formularios y las consultas existentes.
- Menús de cliente y operación adaptados a móvil: botón con estado accesible, cierre con Escape, retorno del foco y acceso a cerrar sesión. Cabeceras sin duplicar en el historial de reservas.
- Tipografía local compartida, navegación más legible, iconos SVG consistentes, espaciados, colores de foco y contraste. No usa fuentes ni librerías remotas.
- Carta con tres columnas en escritorio, dos en tamaños intermedios y una en móvil; fotografías ajustadas y alternativa explícita cuando no existen o fallan.
- Contadores de platos muestran — durante carga/error. Historial con acciones separadas y texto orientado al cliente.

## Verificación

- Compilación de producción y chequeo estructural aprobados, conservando los 120 escenarios del inventario.
- 230 pruebas unitarias aprobadas.
- 64 vistas de navegador: 13 rutas de cliente/operación en 1440, 768, 390 y 320 px; tres menús abiertos con Escape y foco; nueve vistas de acceso/registro. Sin desbordamientos del documento, imágenes rotas ni cabeceras o sidebars duplicados en esas rutas.
- Carta: 21 escenarios controlados aprobados, incluidas imágenes fallidas, detalle, filtros, carrito y responsive. Mesas: 23 escenarios controlados aprobados, incluidas tablas, formularios y restricciones.
- Capturas inspeccionadas de escritorio, móvil, menú abierto, carta y reservas. Evidencia sanitizada en docs/evidencias/mejoras-visuales.

La revisión visual usa HTTP controlado. El backend local no logró conectar con Supabase durante esta sesión (tiempo de conexión agotado); estos resultados no acreditan una nueva validación con datos en la nube. No se hicieron escrituras en la base. No equivale a aceptación visual de las 120 pantallas ni incluye IA/despliegue.

## Reproducción y entrega

Ejecutar npm run verify y node --test scripts/*.test.cjs scripts/*.test.mjs. Con Angular en localhost:4200 y Playwright/Chrome disponibles, ejecutar scripts/visual-audit.cjs (PLAYWRIGHT_MODULE y BROWSER_EXECUTABLE permiten configurar las rutas). Intercepta las peticiones API, sin enviar credenciales ni operaciones a una base compartida.

Se incorporó el develop local 6e8a036 mediante avance directo de la rama de trabajo. La consulta a GitHub falló por conectividad; no se afirma haber descargado cambios remotos posteriores. El worktree temporal fue eliminado por solicitud del usuario y los cambios quedaron en el repositorio principal, sin crear commit ni publicar PR.
