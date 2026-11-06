# Corrección de rutas tras los merges a develop

Fecha: 06/11/2026. Base: develop 9106980. Rama: fix/integracion-rutas-operacion.

## Defecto y corrección

Develop no compilaba porque operacion.routes.ts referenciaba mesasPendingGuard sin importarlo. Además tenía 12 paths repetidos: mesas, mesas/lista, mesa/nueva, mesa/editar, mesa/desactivar, reservas, reserva/editar, reserva/cancelar, atencion, atencion/confirmar, reportes y reportes/pagos. En mesas y atención, las definiciones antiguas aparecían antes que las protegidas y evitaban aplicar sus guards.

Se añade el import existente y se conserva una sola definición por path, con los guards y políticas de actualización de cada US. Se mantienen rutas hijas, componentes, estados alternativos y servicios. No se cambian contratos API ni datos del backend.

## Prevención

scripts/route-audit.mjs analiza el árbol TypeScript y detecta duplicados dentro del mismo arreglo de rutas. Se integra en npm.cmd run check; permite nombres iguales en distintos niveles, como path vacío en padre e hijo. La regresión verifica además que mesas, atención, agenda y reportes conserven sus guards. El análisis sobre el archivo original de origin/develop detectó las 12 duplicaciones.

## Evidencia ejecutada

- Chequeo estructural y build de producción correctos, con NG_BUILD_SASS_EMBEDDED=0 por la restricción local de Sass nativo en Windows.
- 218 pruebas unitarias correctas: 214 existentes y cuatro nuevas de estructura de rutas y guards.
- 23 escenarios US16: gestión de mesas, permisos, cancelación de confirmación, restricciones, errores y navegación bloqueada mientras se guarda. [Resultados](evidencias/integracion-rutas/us16.json).
- 24 escenarios US27: atención física, confirmaciones, envíos pendientes, acceso a reservas y efectos en salón. [Resultados](evidencias/integracion-rutas/us27.json).
- 29 escenarios US29: filtros, detalle, reprogramación/cancelación, permisos, conflictos y navegación durante envío. [Resultados](evidencias/integracion-rutas/us29.json).
- 29 escenarios US20: reportes, gráficos, rangos, permisos, vacío y errores. [Resultados](evidencias/integracion-rutas/us20.json).

Total: 105 escenarios de navegador sobre el frontend integrado, con HTTP controlado y sin escrituras reales. Se usa el AuthService del frontend desde el harness de desarrollo; no se acredita aquí el formulario de login ni una nueva validación del backend. Las pruebas cubren escritorio y móvil según las suites existentes. El servidor temporal se detiene al terminar.

## Reproducción

Ejecutar npm.cmd run verify y las pruebas node --test de scripts/*.test.cjs y scripts/*.test.mjs. Las suites de navegador se ejecutaron con frontend de desarrollo en 4360, RP_QA_URL=http://127.0.0.1:4360, PLAYWRIGHT_MODULE apuntando a Playwright y RP_QA_OUTPUT a una carpeta de evidencia por US. Scripts: us16-api-browser.cjs, us27-api-browser.cjs, us29-api-browser.cjs y us20-api-browser.cjs.

Esta corrección queda pendiente de commit y PR hacia develop. No representa despliegue ni cierre de las tareas de otros integrantes.
