# Diagnóstico inicial — 14 de noviembre de 2026

Frontend `develop` 2822dbd; backend local `feature/supabase-jwt-backend` 840abf4 más la corrección ES256 local posteriormente fusionada en el mismo PR. Angular en modo híbrido; Spring perfil `supabase-api`; PostgreSQL de Supabase mediante pooler. Se hicieron solicitudes de lectura secuenciales desde un cliente local, sin usuarios concurrentes. Son muestras exploratorias, no p50/p95.

## Cobertura

| Rol | Áreas inspeccionadas en código | Lecturas medidas |
| --- | --- | --- |
| Cliente | Carta, carrito, pedidos, reservas, notificaciones | Auth, perfil, restaurantes, platos, categorías, pedidos propios, reservas propias, notificaciones |
| Administrador | Inicio, catálogo, pedidos/cocina, reservas, pagos, reportes, notificaciones | Auth, perfil, restaurante, platos, categorías, pedidos pendientes, reservas, reporte, notificaciones |
| Dueño | Inicio compartido y alta de administradores; rutas de dueño limitadas en esta versión | Auth, perfil, restaurante, pedidos pendientes, reservas, reporte, notificaciones por API |

Las rutas de dueño no equivalen todavía a todas las vistas de operación. Medir una API con token de dueño no demuestra que esa vista exista en su navegación. No se midieron escrituras, pagos, filtros de búsqueda, navegación visual completa ni concurrencia.

La carga reproducible posterior utilizó un reporte del 7 de noviembre, fecha con pedidos. Los primeros archivos `carga-1vu.json`, `carga-5vu.json` y `carga-10vu.json` usaron el 13 de noviembre, sin pedidos para ese reporte; para la comparación integrada deben usarse `carga-5vu-con-datos.json` y `carga-10vu-con-datos.json`.

## Observaciones

- Inicio de sesión Supabase: 251–1286 ms en tres cuentas. `/api/auth/me`: 210–396 ms.
- Restaurante y notificaciones: aproximadamente 460–740 ms; categorías: 367–412 ms; platos: 1198–1266 ms.
- Pedidos pendientes de operación: 2131–2400 ms en repeticiones; reservas de operación: 2916–3180 ms; reporte consolidado: 1651–1898 ms.
- Pedidos propios del cliente: 4130 ms en una muestra; reservas propias: 3031 ms en una muestra.
- Todos los endpoints medidos con el rol previsto respondieron 200. No se midió la carga total de una pantalla en navegador.
- Volumen en la base de prueba: 7 usuarios, 4 restaurantes, 62 platos, 279 pedidos, 552 detalles, 184 reservas, 108 notificaciones y 278 pagos.
- `pg_stat_statements` mostró consultas SQL individuales generalmente submilisegundo en las filas examinadas; esto sugiere investigar número de consultas y viajes entre aplicación y base antes de añadir índices. Es una inferencia, no una causa demostrada por traza de solicitud.

## Hallazgos de código y prioridad

1. **Pedidos de cocina:** `PedidoService.getPendientesCocina` obtiene todos los pedidos elegibles, los ordena en Java por complejidad/tiempo y pagina después. La cantidad de trabajo y memoria crece con todos los pendientes, aunque se pida una página de 10. Medir cantidad de pedidos cargados y SQL por solicitud; conservar el orden funcional al rediseñar la paginación.
2. **Reservas:** `ReservaService` lista reservas de restaurante o cliente sin paginación y luego mapea toda la lista. Medir tamaño de respuesta, número de consultas y costo del mapper. Introducir paginación con contrato compatible si los datos lo justifican.
3. **Reportes:** inicio de operación consulta restaurante y reporte mediante `forkJoin`; no hay espera secuencial en esa pantalla. El reporte tarda alrededor de 1,7–1,9 s en estas muestras. Instrumentar las consultas agregadas antes de optimizarlas.
4. **Carta:** `CartaStore` consulta restaurantes, restaurante seleccionado, platos y categorías mediante `forkJoin`; la vista espera la más lenta. Revisar repetición de catálogo al navegar y tamaño de platos, sin cachear datos de disponibilidad indefinidamente.
5. **Autenticación y sesión:** cada petición protegida resuelve el perfil en PostgreSQL. Medir ese costo y comprobar que la validación de token y permisos no se salten al optimizar.
6. **Base y conexión:** medir tiempos de adquisición del pool y número de SQL por endpoint. No aumentar el pool ni añadir índices sin métricas. PostgreSQL está en una región remota respecto de este cliente local; medir desde el entorno de despliegue antes de atribuirle la demora.
7. **Pagos y gestión de pedidos:** las vistas consultan el pedido y luego su pago en serie. La edición carga después restaurante, platos y mesas cuando los necesita. Este encadenamiento puede sumar varias latencias; no se midió aún el recorrido completo ni debe eliminarse la verificación de permisos por adelantar consultas.

## Siguiente medición

Instrumentar `http.server.requests`, conexiones Hikari y conteo SQL por endpoint; capturar una navegación real por rol con tiempos de red y recursos; repetir con varias iteraciones y después ejecutar carga gradual en un entorno de pruebas aislado. Establecer p50/p95 y tasa de error antes de cambiar consultas. Los skeletons quedan fuera de este alcance de rendimiento.
