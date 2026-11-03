# Guía para continuar la integración de cocina

Rama frontend y backend: feature/operacion-cocina-api. Contrato: [SPEC conjunto de US15/US19](specs/operacion-cocina-api/SPEC.md). US15 conecta lectura; US19 todavía debe conectar las mutaciones.

## Base que deben reutilizar las siguientes historias

- AuthService.login conserva restauranteId validado del DTO/JWT y API_SESSION comparte esa misma sesión. No crear otro token, otro restaurante seleccionado ni otra autenticación. La sesión es de memoria; una recarga completa requiere volver a autenticarse mediante el módulo correspondiente.
- activeOperationSession exige ADMINISTRADOR o DUENO vigente y local positivo. No usar activeClientSession para operaciones. Los guards de cocina validan acceso sin afectar rutas ajenas; el store no consulta con rol/local inválidos.
- PedidoService.pendientesCocina(page,size) usa GET /pedidos/pendientes; obtener(id) consulta detalle. Reutilizar el interceptor JWT y el proveedor HTTP de app.config. environment.apiUrl contiene /api.
- readCocinaPage valida el formato Page Spring. No es el formato de /pedidos/me. El backend ordena antes de paginar y Angular conserva content, incluso al agrupar en columnas.
- cocina-api.adapter convierte datos confirmados a presentación, preservando subtotales registrados. No usa catálogos para reconstruir precios, complejidad o minutos; no presume pago.
- El backend de esta rama añade los dos metadatos derivados. Entregar su commit antes de aceptar esos datos en el entorno compartido. Clientes anteriores siguen funcionando; su ausencia temporal se muestra sin valores inventados.

## Siguiente entrega: US19

Añadir PATCH /pedidos/{id}/estado?nuevoEstado=ENUM al servicio y reemplazar el bloqueo de las acciones por confirmaciones y peticiones reales. No reactivar transitionSample. Aplicar exclusivamente PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO y validar la respuesta antes de confirmar éxito. Conservar el detalle seleccionado cuando LISTO desaparezca de la cola; refrescar sin duplicar mutaciones y resolver respuestas inciertas mediante consulta. Seguir todos los criterios del SPEC conjunto.

## Verificación reproducible

Desde el frontend:

~~~powershell
npm.cmd run verify
node --test scripts/us11-api.test.cjs scripts/us11-http-infrastructure.test.cjs scripts/us12-api.test.cjs scripts/us13-seguimiento.test.cjs scripts/us15-api.test.cjs
node --test scripts/cocina-priority.test.mjs scripts/cocina-transitions.test.mjs
~~~

Para navegador se entrega postman/simulations/us15.sim.yaml y scripts/us15-api-browser.cjs. Ejecutar la simulación local:

~~~powershell
postman simulation run postman/simulations/us15.sim.yaml --port 4314 --no-history --output ndjson
~~~

Iniciar una copia aislada de Angular en 4313, con su apiUrl apuntando a http://localhost:4314/api. Mantener la configuración real del repositorio sin cambios. Definir PLAYWRIGHT_MODULE si Playwright está disponible fuera del proyecto y RP_QA_OUTPUT para guardar evidencia fuera del repositorio. Ejecutar node scripts/us15-api-browser.cjs. Los puertos pueden cambiar usando RP_QA_URL y RP_MOCK_URL.

El harness inicia sesión por el AuthService real desde una instancia Angular de desarrollo, usando cuentas y JWT sintéticos del mock. No modifica la pantalla de acceso, no valida firmas ni prueba PostgreSQL. Sus controles /__test existen solo en el mock. No introducirlos en código de producto ni ejecutar estas cuentas contra un backend real. Cada simulación debe tener su estado propio; no ejecutar simultáneamente suites contra el mismo mock.

Desde el backend, usar JDK 21 y ejecutar:

~~~powershell
.\mvnw.cmd '-Dtest=Us15HttpIntegrationTest' test
.\mvnw.cmd '-Dtest=PedidoServiceTest,Us11HttpIntegrationTest,Us12HttpIntegrationTest,Us13HttpIntegrationTest' test
~~~

Los tests HTTP usan servidor real, JWT y H2 aislado, sin credenciales ni datos del equipo. Cubren prioridad global, empates, paginación, roles/local, entradas/salidas, metadatos nulos/cero y snapshots históricos.

## Evidencia de esta entrega

02/11/2026: check y build correctos; 33 pruebas de contrato/store e infraestructura compartida y 39 pruebas puras históricas correctas. Backend: 3 pruebas HTTP US15 y 10 pruebas de regresión de pedidos correctas. El chequeo estructural conserva 120 escenarios y no mide aceptación funcional.

Pasaron 13 recorridos de navegador con el frontend real contra HTTP simulado: cola/tablero/detalle en 320, 390, 768 y 1440 px sin desbordamiento global; paginación y retorno; refresco fallido y recuperación; rechazo 403/local ajeno; vacío y metadatos ausentes; detalle LISTO e ID inválido; rol/local no autorizado; retorno al login y cierre de sesión. No hubo mutaciones desde cocina. Se inspeccionó además la captura mobile generada; esto no acredita equivalencia con Figma ni una auditoría completa de accesibilidad. Pendiente: aceptación conjunta con autenticación, backend compatible y datos PostgreSQL del equipo. Figma MCP alcanzó el límite del plan; no se acredita una nueva comparación contra el original.
