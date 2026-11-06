# Ajuste de Angular Material en gestión de platos

Rama: `fix/us14-angular-material`. Base: `256f409` de `origin/develop`.

## Alcance

Adaptación de `op-platos`, `op-plato-nuevo` y `op-plato-editar`, manteniendo sus servicios, rutas y operaciones existentes.

- Campos con `mat-form-field`, `matInput`, `mat-select`, opciones con IDs numéricos y errores asociados mediante `mat-error`.
- Disponibilidad del formulario con `mat-checkbox`; acciones con botones Material.
- Listado con `mat-table`, búsqueda y filtro por categoría. En móvil, la tabla dispone de desplazamiento interno con nombre accesible y foco por teclado.
- Estilos locales con tokens `--rp-*`, títulos y áreas de interacción del contrato compartido. No se modificaron el tema global, las dependencias ni los responsables.

## Verificación ejecutada

- `npm.cmd run verify`: estructura y build de producción correctos. En este equipo se utilizó `NG_BUILD_SASS_EMBEDDED=0`.
- Las 191 pruebas existentes terminaron sin fallos.
- 20 comprobaciones de navegador con respuestas HTTP controladas: listado, búsqueda, categoría, formularios cargados, checkbox, errores, reintento y navegación posterior al registro/edición.
- Las tres pantallas sin desbordamiento global a 320, 390, 768 y 1440 px. La tabla conserva su desplazamiento interno.
- El selector se abre con teclado y Escape lo cierra conservando el foco.
- Sin errores JavaScript en los casos ejecutados. Capturas de registro móvil y listado de escritorio inspeccionadas.

Resultados sanitizados: `docs/evidencias/us14-material/resultado.json`.

Las respuestas controladas comprueban la interacción de los controles y la conservación de las solicitudes existentes; no certifican persistencia en Supabase ni modificaron datos reales. No se volvió a verificar la equivalencia visual con Figma.

## Cierre funcional de disponibilidad — 2026-11-05

La edición envía los datos por PUT sin el campo disponible y aplica PATCH únicamente si el estado devuelto difiere del seleccionado. Verifica ID, restaurante y disponibilidad antes de navegar al listado. El formulario se bloquea durante el envío. Si los datos se guardan y falla el cambio de disponibilidad, informa el guardado parcial y conserva lo ingresado; no simula una transacción atómica entre ambas operaciones. Los campos complementarios vaciados se envían como cadenas vacías para que el servidor pueda borrarlos.

- 9 regresiones HTTP controladas: desactivar/reactivar, omitir PATCH innecesario, borrar descripción, rechazo de PUT, conflictos/fallos de PATCH y respuestas de identidad/estado incorrectos.
- 10 comprobaciones reales desde Angular con Spring Boot temporal en 8082 y PostgreSQL de Supabase. Registro de un plato temporal, edición de nombre y descripción, disponibilidad false/true, consulta independiente, recarga completa con sesión nueva, guardado sin PATCH redundante y eliminación desde la interfaz. El plato temporal quedó eliminado; los platos preexistentes no se modificaron.
- Regresión Material: 20 comprobaciones aprobadas. Las 191 pruebas existentes y la compilación también pasaron.

Las pruebas reales utilizan AuthService mediante un harness de desarrollo porque el formulario general de acceso todavía está pendiente. Esto no convierte US02 en terminada. Las comprobaciones de US14 permiten cerrar las tareas S2-TSK-015 y S2-TSK-016 para el alcance revisado.

### Reproducir la regresión de disponibilidad

Con Angular en modo desarrollo y Playwright disponible, ejecutar desde el frontend:

~~~powershell
$env:RP_QA_URL='http://127.0.0.1:4350'
# PLAYWRIGHT_MODULE puede apuntar al módulo Playwright instalado fuera del repo.
node scripts/us14-disponibilidad-browser.cjs
~~~

La regresión intercepta todas las rutas /api y utiliza exclusivamente respuestas controladas; no necesita credenciales ni escribe en el backend. Guarda resultados en artifacts/us14-disponibilidad o en RP_QA_OUTPUT.
