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

Las respuestas controladas comprueban la interacción de los controles y la conservación de las solicitudes existentes; no certifican persistencia en Supabase ni modificaron datos reales. No se volvió a verificar la equivalencia visual con Figma. El ajuste funcional pendiente del checkbox de disponibilidad en edición, que requiere su operación PATCH separada, queda fuera de esta adaptación de controles.
