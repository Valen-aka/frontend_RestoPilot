# Guía para continuar la integración de cocina

Rama frontend y backend: feature/operacion-cocina-api. Contrato: [SPEC conjunto de US15/US19](specs/operacion-cocina-api/SPEC.md). US15 conecta lectura y US19 conecta las transiciones. La aceptación con el entorno compartido sigue pendiente.

## Base que deben reutilizar las siguientes historias

- AuthService.login conserva restauranteId validado del DTO/JWT y API_SESSION comparte esa misma sesión. No crear otro token, otro restaurante seleccionado ni otra autenticación. La sesión es de memoria; una recarga completa requiere volver a autenticarse mediante el módulo correspondiente.
- activeOperationSession exige ADMINISTRADOR o DUENO vigente y local positivo. No usar activeClientSession para operaciones. Los guards de cocina validan acceso sin afectar rutas ajenas; el store no consulta con rol/local inválidos.
- PedidoService.pendientesCocina(page,size) usa GET /pedidos/pendientes; obtener(id) consulta detalle. Reutilizar el interceptor JWT y el proveedor HTTP de app.config. environment.apiUrl contiene /api.
- readCocinaPage valida el formato Page Spring. No es el formato de /pedidos/me. El backend ordena antes de paginar y Angular conserva content, incluso al agrupar en columnas.
- cocina-api.adapter convierte datos confirmados a presentación, preservando subtotales registrados. No usa catálogos para reconstruir precios, complejidad o minutos; no presume pago.
- El backend de esta rama añade los dos metadatos derivados. Entregar su commit antes de aceptar esos datos en el entorno compartido. Clientes anteriores siguen funcionando; su ausencia temporal se muestra sin valores inventados.

## US19: acciones ya conectadas

PedidoService.cambiarEstado envía PATCH /pedidos/{id}/estado?nuevoEstado=ENUM. CocinaStore.applyTransition devuelve una Promise con el resultado de la operación y posee la petición; no duplicar llamadas desde componentes. Utilizar PedidoAction para confirmar con Angular Material. No reactivar transitionSample. La secuencia autorizada es PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO.

El store conserva detalle/selección al salir de cola y solo anuncia éxito tras una confirmación válida. Bloquea dobles envíos y salida durante la operación; cerrar sesión invalida respuestas. Después del cambio refresca la cola sin repetir PATCH si ese refresco falla. Para un 400/409 o resultado incierto consulta el pedido; si no puede verificarlo, verificationId bloquea acciones hasta verifyPending. No borrar ese bloqueo al cambiar de pantalla ni tratar un 500 como garantía de que la mutación no ocurrió.

La navegación posterior verifica la sesión y la URL de origen, incluso si el botón o tarjeta desapareció al recibir el nuevo estado. Así puede continuarse a entrega y volver a consultar pedidos LISTO/ENTREGADO. Las notificaciones corresponden al backend; no añadir envíos duplicados ni condicionar el avance al estado de pago.

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

## Verificación de US19 — 03/11/2026

Frontend: check/build y 45 pruebas de contrato/store e infraestructura compartida correctos. Incluir scripts/us19-api.test.cjs junto con las suites US11/US12/US13/US15 del comando anterior. Pasaron 15 recorridos US19 de navegador y 13 de regresión US15. Se distinguen datos anteriores, conflictos, pérdida de respuesta y recuperación; solo se enviaron los PATCH confirmados por el usuario de prueba.

Para reproducir sin usar pedidos reales:

~~~powershell
postman simulation run postman/simulations/us19.sim.yaml --port 4316 --no-history --output ndjson
~~~

Usar una copia de Angular de desarrollo en 4315 con apiUrl local http://localhost:4316/api y ejecutar node scripts/us19-api-browser.cjs. Definir PLAYWRIGHT_MODULE si corresponde y RP_QA_OUTPUT fuera del repositorio. RP_QA_URL/RP_MOCK_URL permiten elegir otros puertos. RP_QA_FILTER limita a un nombre de caso para diagnosticar; omitirla al ejecutar toda la suite. Los controles y JWT del mock son exclusivamente de prueba; no prueban firmas ni PostgreSQL.

Backend:

~~~powershell
.\mvnw.cmd '-Dtest=Us19HttpIntegrationTest,Us15HttpIntegrationTest,Us13HttpIntegrationTest' test
~~~

Resultado: 9 pruebas correctas, de las cuales 3 corresponden a US19. Se verificaron 22 transiciones inválidas, permisos, secuencia, instantánea de compra/pago y notificaciones. Dos confirmaciones concurrentes de la misma etapa producen un éxito, un rechazo y un solo avance/aviso. Los endpoints de producción ya existían; esta entrega añade únicamente pruebas en el backend.

La falta de integración de las pantallas de autenticación o un backend incompatible no se resuelve con credenciales de muestra en producto. Queda pendiente la prueba conjunta con el entorno y datos del equipo, además de revisar el diseño con Figma cuando el plan permita nuevas consultas. No se crearon commits ni PR automáticamente.
