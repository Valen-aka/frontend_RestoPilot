# Verificación de pedidos

Fecha: 2026-10-30. Rama: feature/pedidos.

- `npm.cmd run verify`: estructura y build correctos.
- Navegador: edición, bloqueo y cancelación por URL directa; revisión visual a 1440 y 390 px, sin desbordamiento global. Tabla con desplazamiento interno móvil.
- Cambiar Lomo a 2 recalcula total a S/104; guardar muestra aviso sin persistencia. Cantidad -1 muestra validación.
- Diálogo: abre con acción explícita, foco inicial en Volver, cerrar y confirmar funcionan; confirmación muestra que no se canceló un pedido real. Diálogo móvil sin desbordamiento.
- Revisión estática de seguridad: sin hallazgos bloqueantes en alcance visual; sin HTTP ni almacenamiento.

Datos de diseño. Backend, permisos efectivos y operaciones reales pendientes.
