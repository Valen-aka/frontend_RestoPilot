# Verificación de US20 — reportes operativos

Fecha: 06/11/2026. Rama: feature/operacion-reportes. Alcance S2-TSK-057 y S2-TSK-058. [SPEC](specs/us20/SPEC.md).

## Entrega

Consolidado y tipos PLATOS, DEMANDA, ATENCIONES, OCUPACION y PAGOS; página dedicada de pagos; selector de período, navegación con fechas conservadas, tablas Material y gráficos Chart.js mediante ng2-charts ya instalado. Rutas hijas y componentes standalone con archivos separados. Se reutilizan WorkspaceShell, AuthService e interceptor. No se modifican endpoints ni lógica del backend.

Se distingue vacío global (métricas null) de secciones con colecciones vacías o ceros. Los errores limpian resultados y las respuestas tardías no sustituyen la consulta actual. Fechas faltantes, imposibles o invertidas no generan una petición de reporte; un 401 exige recuperar la sesión. Las variantes del inventario consultan datos reales: vista=op-reportes-vacio no fuerza un vacío si la API devuelve resultados.

## Diferencias resueltas entre Figma y API

Se consultaron por MCP los ocho frames desktop/mobile indicados en el SPEC. La composición conserva encabezado, período, tarjetas, gráficos, tablas y estados. Los platos se devuelven como textos ya agregados: se conserva nombre histórico y unidades sin dividir etiquetas arbitrariamente. Figma presenta importes por método, mientras EstadoPagosDTO devuelve cantidades: tabla y gráfico se etiquetan como pagos confirmados por método. MontoTotal sigue siendo el monto confirmado en soles.

Atenciones presenta pedidos atendidos y reservas completadas por separado; volumenAtenciones se identifica como suma de operaciones, nunca clientes únicos. La ocupación es tiempo reservado del período y no disponibilidad en vivo. El período de pagos depende de creación del pedido, aunque el pago sea posterior.

## Evidencia ejecutada

- Checker y build de producción correctos. Se conservan 120 escenarios, sus responsables, rutas y ocho carpetas de diálogos.
- 200 pruebas unitarias correctas: 191 previas y nueve nuevas de contratos de reportes, fechas, tipos, vacío, ceros, cantidades y coherencia de atenciones.
- 29 escenarios de navegador con respuestas controladas: consolidado y pagos en 320/390/768/1440, cinco tipos específicos, campos/rangos inválidos, vacío/ceros, respuesta incompleta o incompatible, 400/401/403/500/red, recuperación, cambios sin consultar, respuestas tardías y limpieza al cambiar cuenta. Gráficos comprobados contra los valores de sus tablas y retorno del foco desde vacío. [Resultados](evidencias/us20/controladas.json).
- 15 comprobaciones con Spring Boot, JWT y PostgreSQL local aislado. Fixture histórica preparada mediante SQL solo en esa base: ENTREGADOS/PENDIENTES/CANCELADOS, snapshots distintos de la carta, otro restaurante, pedido fuera de fecha, pagos posteriores, reservas completadas y mesa inactiva. [Resultados](evidencias/us20/api-real.json).
- Valores reales contrastados: cinco unidades históricas vendidas, demanda de dos pedidos a las 12 y uno a las 13, dos pedidos atendidos y tres reservas completadas, ocupación 8.33%, monto confirmado S/ 30, un pagado y dos pendientes, YAPE con un pago. Pedidos cancelados, otro restaurante y fecha externa no contaminan resultados. La fecha de pago sin pedidos creados ese día produce vacío.
- Capturas revisadas de consolidado de escritorio y pagos de 320 px. Sin desbordamiento global en los anchos comprobados; tablas con desplazamiento interno. Gráficos sin animación y con tabla equivalente. Recurso de marca local existente verificado como no vacío y reutilizado en su marco compartido. No se certifica equivalencia píxel a píxel ni una auditoría completa de accesibilidad.

## Reproducción

Desde la raíz del frontend: npm.cmd run verify y node --test scripts/us20-reportes.test.cjs. Si Windows bloquea Sass nativo, usar NG_BUILD_SASS_EMBEDDED=0. Para navegador iniciar frontend de desarrollo en 4359 y ejecutar node scripts/us20-api-browser.cjs. PLAYWRIGHT_MODULE y BROWSER_EXECUTABLE permiten ubicar Playwright/Chrome; RP_QA_URL y RP_QA_OUTPUT modifican URL local y destino de evidencia.

scripts/us20-real-browser.cjs requiere RP_QA_ISOLATED=1, backend de QA en 8083 y RP_QA_DB_META apuntando al archivo privado de conexión de una base local aislada de US20. Las credenciales no se guardan en Git. La fixture SQL se envía por entrada UTF-8; el script crea exclusivamente datos de prueba. No ejecutarlo sobre Supabase ni bases compartidas. Se retira la base temporal al terminar.

## Límites y coordinación

Rama independiente desde origin/develop: no incorpora los PR pendientes de US10, US14, US27, US16 o US29. Comprobar el conjunto después de integrarlos. El formulario de login de esta base sigue pendiente de conexión: las pruebas utilizan AuthService.login real desde un harness de desarrollo. La fixture verifica consultas de reportes, no acredita por sí sola las operaciones que generan cada estado histórico.

Este DTO no incluye restauranteId. El cliente valida estructura/tipo y limpia las consultas al cambiar de cuenta; la API aplica el aislamiento por JWT, contrastado con dos dueños reales en la base aislada. No se implementa IA, exportaciones, despliegue ni verificación general del sprint. Supabase permanece sin cambios.
