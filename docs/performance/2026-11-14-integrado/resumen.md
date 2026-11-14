# Resultado integrado — 14 de noviembre de 2026

Se comparó backend `develop` anterior a las optimizaciones con una rama temporal que reúne cuatro cambios locales, usando el mismo script, fecha del reporte (2026-11-07), tres cuentas de prueba y base PostgreSQL de Supabase. Los cambios funcionales permanecen aislados en `perf/order-query`, `perf/reservation-read`, `perf/catalog-read` y `perf/report-query`; `perf/integrated-review` solo comprueba su convivencia.

## Resultado de carga corta

| Lectura y rol | p95 inicial con 10 VU | p95 integrado con 10 VU | Cambio |
| --- | ---: | ---: | ---: |
| Pedidos propios, cliente | 7210 ms | 2166 ms | −70,0 % |
| Cocina, administrador | 4611 ms | 1862 ms | −59,6 % |
| Cocina, dueño | 4844 ms | 3583 ms | −26,0 % |
| Platos, cliente | 2896 ms | 1434 ms | −50,5 % |
| Reservas propias, cliente | 6587 ms | 4325 ms | −34,3 % |
| Reservas, administrador | 6058 ms | 4920 ms | −18,8 % |
| Reservas, dueño | 5987 ms | 4917 ms | −17,9 % |
| Reporte con datos, administrador | 3083 ms | 2470 ms | −19,9 % |
| Reporte con datos, dueño | 3699 ms | 2883 ms | −22,1 % |

En 5 VU se ejecutaron 128 solicitudes y en 10 VU 252, sin errores HTTP inesperados en ninguno de los dos estados. La duración total del escenario de 10 VU bajó de 36,7 a 26,8 segundos; se trata de una carga corta, no de una jornada sostenida. Los 10 VU reutilizan tres identidades. El detalle de los 19 grupos de endpoint y sus p50/p95 está en `comparacion-5vu.csv` y `comparacion-10vu.csv`; también se conservan las muestras individuales sanitizadas.

Una corrida adicional integrada de 10 VU durante 10 rondas hizo **630 solicitudes en 57,8 s sin errores**. No tiene línea base de igual duración y no equivale a una prueba de jornada laboral.

## Cambios comprobados

- **Pedidos:** seleccionar y ordenar IDs de cocina en PostgreSQL antes de paginar; cargar detalles y relaciones de la página en una consulta agrupada. El historial del cliente también agrupa la carga de detalles. La primera página mantuvo total, cantidad y orden de IDs respecto del backend anterior.
- **Reservas:** cargar mesa, usuario y restaurante junto con cada reserva consultada. Conserva las respuestas; la lista completa sigue sin paginación.
- **Catálogo:** cargar la categoría junto con cada plato. Conserva contrato y evita lecturas adicionales por categoría.
- **Reportes:** combinar recuentos de pedidos y reservas, reutilizarlos en el consolidado y pagos. El hash del reporte con datos fue igual antes y después.

Las cuatro mejoras integradas pasaron 136 pruebas backend en H2 (0 fallos, 0 errores, 1 omitida), además de arranque y lecturas reales contra PostgreSQL. No se ejecutaron escrituras de prueba. Los valores de p95 proceden de 12–16 muestras por ruta en la etapa de 10 VU y pueden variar entre ejecuciones. No se midieron navegador visual, consumo de CPU, pool Hikari por solicitud ni una carga de jornada completa.

## Pendiente antes de declarar capacidad operativa

1. Paginar reservas con un contrato de frontend/backend y probar filtros, permisos y navegación; todavía se cargan listas completas.
2. Instrumentar conteo SQL, adquisición de conexiones y tiempos por endpoint para ubicar el costo restante de reservas y reportes.
3. Repetir en un entorno de staging cercano a la base con más cuentas y volúmenes representativos, durante un período sostenido. Medir errores, p95 y p99, CPU y conexiones.
4. Revisar frontend y diseño por separado; los skeletons quedaron expresamente para después.
