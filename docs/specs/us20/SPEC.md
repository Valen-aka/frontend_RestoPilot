# US20 — Reportes operativos por período

Rama: `feature/operacion-reportes`. Alcance S2-TSK-057 y S2-TSK-058. Parte de origin/develop; no incorpora PR pendientes de otras historias. Como dueño o administrador quiero consultar resultados de mi restaurante por período para analizar su desempeño.

## Pantallas y referencia

Conservar op-reportes, op-reportes-pagos, op-reportes-vacio y op-reportes-fechas-invalidas, con las rutas hijas `/operacion/reportes` y `/operacion/reportes/pagos` y sus variantes `vista`. No inventar datos vacíos ni errores por acceder a una variante: el rango y la respuesta API determinan el estado real. Usar la copia Figma indicada por el usuario: sRxKEwFdrMKfXPosGFvoHc. Frames consultados por MCP con contexto de diseño y capturas: 89:37929/89:38154 (consolidado), 89:43540/89:43714 (pagos), 89:43844/89:43976 (vacío), 89:43337/89:43459 (fechas inválidas). Registrar en QA el acceso al contexto visual MCP efectivamente logrado.

## Contratos existentes

- GET `/api/reportes/operativos?fechaInicio=yyyy-MM-dd&fechaFin=yyyy-MM-dd&tipo=CONSOLIDADO|PLATOS|DEMANDA|ATENCIONES|OCUPACION|PAGOS`.
- GET `/api/reportes/pagos?fechaInicio=yyyy-MM-dd&fechaFin=yyyy-MM-dd` para la vista dedicada a pagos.
- GET `/api/restaurantes/{id}` para el contexto del restaurante autenticado.
- Permisos: dueño/administrador con restaurante asignado. El backend obtiene el local del JWT; no se envía restauranteId a los endpoints de reportes.
- ReporteResponse: mensaje, platosMasVendidos (lista de textos preparados por la API), horariosMayorDemanda (mapa horario→cantidad), volumenAtenciones, ocupacionMesasPorcentaje, estadoPagos, pedidosAtendidos y reservasCompletadas.
- estadoPagos: montoTotal, pedidosPagados, pagosPendientes y metodosPagoUtilizados (mapa método→cantidad de pagos confirmados).
- Sin operaciones: todos los campos de métricas son null y mensaje informa ausencia de datos. En reportes específicos las secciones no solicitadas son null. Colecciones vacías y ceros en una sección solicitada son resultados legítimos, no ausencia global de operaciones.

## Reglas y experiencia

1. Selector de fechas requeridas y tipo de reporte. No utilizar períodos de muestra ni disparar reportes con fechas ausentes, imposibles o inicio posterior a fin. El mismo día es válido. Mantener rango/tipo en URL al navegar entre consolidado y pagos; actualizar desde API mediante una acción explícita o un enlace con consulta válida.
2. Validar el contrato según el tipo solicitado, sin sustituir null por cero. Un error elimina las métricas previas para evitar mostrarlas como actuales. Identificar el período al que corresponden los resultados y avisar si el formulario contiene cambios aún no consultados.
3. Platos: conservar textos y orden API, que agregan cantidades históricas de pedidos ENTREGADOS. No calcular ventas con la carta actual ni precios actuales. No deducir importes o cantidades de una etiqueta que la API devuelve como texto.
4. Demanda: usar horarios y cantidades devueltos, excluyendo pedidos CANCELADOS conforme al servidor. Gráfico y tabla equivalente con los mismos datos; no inventar horarios intermedios.
5. Atenciones: presentar por separado pedidos atendidos y reservas completadas. Si se muestra la suma histórica volumenAtenciones, etiquetarla como operaciones, nunca clientes únicos. Validar que la suma corresponda a los dos componentes recibidos.
6. Ocupación: porcentaje de tiempo reservado por mesas activas CONFIRMADAS/COMPLETADAS dentro del horario disponible y período inclusivo. No es disponibilidad u ocupación en vivo. Mostrar el valor de la API sin recalcularlo ni recortarlo artificialmente.
7. Pagos: monto confirmado en soles, pedidos pagados/pendientes y cantidad de pagos confirmados por método. No presentar el desglose por método como montos porque la API devuelve cantidades. Se delimita por creación del pedido, aunque el pago se registre después; excluir pedidos cancelados según el servidor.
8. Mostrar vacío global solo cuando la respuesta no incluye métricas. Para una sección con lista/mapa vacío, explicar la ausencia de resultados de esa sección. No dibujar valores de muestra ni anunciar éxito de una consulta fallida.
9. Sesión real compartida, interceptor JWT y guards. Cambiar cuenta/local limpia resultados y cancela consultas anteriores. No aceptar respuestas tardías de otra consulta. Este DTO no devuelve restauranteId: el aislamiento definitivo se verifica en la API; no afirmar una validación de identidad del DTO que no es posible.
10. Carga, reintento y errores 400/401/403/5xx/red/contrato con mensajes claros. No modificar datos para generar el reporte, no persistir JWT ni añadir autenticación propia. Sin implementación IA, exportaciones o filtros no ofrecidos por el backend.

## Interfaz y accesibilidad

Standalone TS/HTML/CSS, rutas hijas y WorkspaceShell. Reactive Forms, MatFormField/MatInput/MatSelect, MatButton, MatCard y MatTable. Gráficos con la biblioteca ya instalada y tablas/textos equivalentes; desactivar animaciones para respetar movimiento reducido. Tokens CSS comunes, controles de al menos 44 px, foco visible, estados con texto y tablas con scroll interno. Verificar 320/390/768/1440 px sin ocultar desbordamiento global.

## Criterios

| Criterio común | Verificación |
|---|---|
| CA01 | Consolidado real con las cinco secciones. |
| CA02 | Cada tipo y endpoint de pagos solicitan y muestran solo sus métricas. |
| CA03 | Pedidos y reservas atendidas separados; suma como operaciones. |
| CA04 | Monto confirmado, pedidos pagados/pendientes y cantidades por método. |
| CA05 | Ocupación reservada por período, sin fingir información en vivo. |
| CA06 | Período sin operaciones muestra vacío sin indicadores inventados. |
| CA07 | Fechas faltantes, inválidas o invertidas no generan petición. |
| CA08 | Permisos, cambio de cuenta y aislamiento real entre restaurantes. |
| CA09 | Platos ENTREGADOS y demanda sin CANCELADOS contrastados con datos reales. |
| CA10 | Pago fuera del período se incluye según creación del pedido, no fecha de pago. |

## Validación y entrega

Ejecutar checker/build, pruebas compartidas y de contrato, navegador con errores controlados y revisión de gráficos/tablas en móvil y escritorio. Contrastar reportes reales con datos conocidos en PostgreSQL local aislado; retirar su base al finalizar. No alterar datos compartidos de Supabase. Documentar evidencia y límites en docs/QA-US20.md. El formulario de login y la verificación general del sprint conservan sus PR/tareas propios.
