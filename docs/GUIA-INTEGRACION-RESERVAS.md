# Guía para continuar la integración de reservas

Fecha: 03/11/2026. Rama en ambos repositorios: feature/operacion-reserva-atencion-api. [SPEC US25 API](specs/operacion-reserva-atencion-api/SPEC.md).

## Qué está conectado

ReservaService.obtener(id), registrarLlegada(id) y completar(id) consumen GET /reservas/{id}, PATCH /reservas/{id}/llegada y PATCH /reservas/{id}/completar. Los PATCH no reciben DTO ni nuevoEstado. Conservar environment.apiUrl con /api, el proveedor HTTP único y el interceptor compartido.

ReservaAtencionStore posee la consulta y las mutaciones. apply(command) devuelve Promise con resultado confirmado; no realizar una segunda petición desde la pantalla. expectedVersion compara el snapshot local al confirmar, no es una revisión de la API. No inventar If-Match o un endpoint alternativo.

El backend añade fechaHoraServidor, puedeRegistrarLlegada y puedeCompletar al DTO actual. Llegada mantiene CONFIRMADA y asigna llegadaRegistradaEn; completar asigna COMPLETADA/completadaEn y conserva la llegada. El mismo Clock y ReglasCicloReserva gobiernan indicadores y operaciones. No calcular disponibilidad con Date.now(), reloj de fixtures o nombre de pantalla. Indicadores antiguos o ausentes no autorizan una acción; actualizar consulta recoge el nuevo resultado del servidor.

Llegar antes del inicio está permitido sin una restricción adicional de mismo día. En inicio + 15 minutos sin llegada, ya no se permite registrar llegada. Con llegada registrada se puede completar desde el inicio, sin exigir esperar al fin; no expira por ausencia de llegada. Estas reglas se vuelven a evaluar bajo bloqueo en cada operación.

## Sesión y navegación

Reutilizar AuthService/API_SESSION y activeOperationSession. ADMINISTRADOR/DUENO necesitan restaurante asignado; el backend autoriza cada reserva. No crear credenciales ni una sesión paralela para reservas. Una recarga completa pierde la sesión de memoria y requiere autenticarse mediante el módulo correspondiente.

Las URLs son /operacion/reserva/llegada?reservaId=ID, /operacion/reserva/atendiendo?reservaId=ID y /operacion/reserva?vista=op-reserva-completada&reservaId=ID. No abrir #208 por defecto. Los guards de atención no protegen como propia la variante genérica del detalle ni reutilizan el bloqueo de pedidos.

Mientras una operación está en curso no duplicarla al cambiar de pantalla. Cerrar sesión cancela la espera local y descarta respuestas antiguas; no garantiza revertir algo que el servidor ya guardó. Para continuar tras volver a autenticarse, consultar la reserva.

## Errores y recuperación

400/409 en PATCH: consultar la situación actual antes de otra acción. Red/5xx/confirmación incompatible: resultado incierto; no repetir el envío automáticamente. Si falla también GET, verificationId mantiene bloqueadas las acciones hasta verifyPending. Cambiar de URL no debe borrar ese bloqueo.

Si el cambio fue confirmado y el refresco posterior falla, conservar fechas y confirmación con aviso de lectura anterior, y reintentar solo consulta. 401/403/404 eliminan datos protegidos. El GET actual también usa 400 para reserva ajena: se limpia esa lectura, sin confundir ese caso con un PATCH de regla rechazado.

No crear notificaciones o liberar mesas desde el frontend. El backend realiza ambas consecuencias. No compartir respuestas reales con ReservaMuestraStore ni transformar su historial en prueba de persistencia. La agenda completa y la integración de historial/expiración US26 quedan para sus historias; ese trabajo deberá reutilizar ReservaService y el DTO validado.

## Pruebas reproducibles

Desde frontend:

~~~powershell
npm.cmd run verify
node --test scripts/us11-api.test.cjs scripts/us11-http-infrastructure.test.cjs scripts/us12-api.test.cjs scripts/us13-seguimiento.test.cjs scripts/us15-api.test.cjs scripts/us19-api.test.cjs scripts/us25-api.test.cjs
~~~

Para navegador, iniciar el entorno aislado:

~~~powershell
postman simulation run postman/simulations/us25.sim.yaml --port 4318 --no-history --output ndjson
~~~

Ejecutar una copia de Angular de desarrollo en 4317 con apiUrl http://localhost:4318/api, sin cambiar la URL real del repositorio. Con PLAYWRIGHT_MODULE configurado si Playwright vive fuera del proyecto, ejecutar node scripts/us25-api-browser.cjs. RP_QA_URL y RP_MOCK_URL cambian los destinos locales; RP_QA_OUTPUT permite guardar evidencia fuera del repositorio. RP_QA_FILTER limita un caso para diagnóstico: omitirla al ejecutar la suite completa.

El harness invoca el AuthService real desde Angular de desarrollo, pero el mock usa cuentas/JWT sintéticos. /__test existe solo en la simulación. No usarlo como backend ni ejecutar esas cuentas contra los datos del equipo. No valida firmas, persistencia PostgreSQL ni notificaciones reales. No correr simultáneamente suites contra el mismo estado simulado.

Desde backend con JDK 21:

~~~powershell
.\mvnw.cmd '-Dtest=Us25HttpIntegrationTest,CicloReservaIntegrationTest' test
~~~

Us25HttpIntegrationTest usa servidor HTTP y JWT firmados, H2 aislado y Clock controlado; CicloReservaIntegrationTest cubre además expiración, concurrencia y las reglas existentes. No contienen credenciales del equipo. Los scripts anteriores de recorridos de muestra son evidencia de aquella fase y no sustituyen la nueva suite API de atención.

## Evidencia y pendientes

check/build correctos; 62 pruebas frontend correctas (17 nuevas de US25), 23 recorridos de navegador correctos y 27 pruebas backend correctas (8 HTTP US25 y 19 de regresión del ciclo). Capturas revisadas: confirmación mobile y completada desktop; sin desbordamiento global a 320/390/768/1440 en los escenarios ejecutados.

Pendiente: integrar ambos commits en las ramas del equipo y aceptar el flujo con autenticación y PostgreSQL compatibles. No se acredita despliegue, integración del historial US26, nueva comparación con Figma ni auditoría completa de accesibilidad. No se crearon commits ni PR automáticamente.
