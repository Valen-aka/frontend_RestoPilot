# Correcciones de distribución de pantallas

Rama: `fix/layout-pantallas`, desde `origin/develop` actualizado.

## Cambios

- El contenedor cliente/cuenta estira su contenido y mantiene los límites de ancho compartidos. Corrige el inicio, la carta, las notificaciones y el pie que aparecían estrechos a la izquierda.
- El inicio cliente presenta sus accesos en columnas cuando hay espacio y en una columna en móvil, con espaciados uniformes.
- El panel del dueño separa avisos y tarjetas, añade espacio interior y separa el texto de las acciones.
- El menú conserva el desplazamiento y ajusta lo necesario para mostrar completa la opción activa al entrar a otra pantalla.
- Reportes deja de mostrar el error de un rango inválido cuando las fechas actuales están corregidas; solicita enviar de nuevo la consulta y no presenta resultados nuevos automáticamente.

## Verificación

Se ejecutaron 25 comprobaciones de navegador en inicio cliente, carta, notificaciones, inicio dueño y reportes, a 1536, 1024, 768, 390 y 320 px. Se verificaron ancho del contenedor, ausencia de desbordamiento horizontal, una marca por pantalla, distribución del inicio y desaparición del error antiguo de fechas. Se inspeccionaron capturas de escritorio y móvil. Se usaron cuentas existentes para lectura; no se crearon ni modificaron pedidos, reservas o pagos.

Las nueve pruebas de contratos de reportes pasaron. Se ejecutaron el chequeo estructural y la compilación. Esto no acredita todos los recorridos funcionales del sprint.
