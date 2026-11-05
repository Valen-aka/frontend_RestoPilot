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

No crear notificaciones o liberar mesas desde el frontend. El backend realiza ambas consecuencias. No compartir respuestas reales con ReservaMuestraStore ni transformar su historial en prueba de persistencia. La agenda completa continúa fuera de estas entregas. US26 ya reutiliza ReservaService y el DTO validado para integrar historial/expiración, como se describe al final.

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

Pendiente: integrar ambos commits en las ramas del equipo y aceptar el flujo con autenticación y PostgreSQL compatibles. No se acredita despliegue, nueva comparación con Figma ni auditoría completa de accesibilidad. No se crearon commits ni PR automáticamente.

## US26 — Historial, expiración y disponibilidad (03/11/2026)

Rama frontend y backend: feature/reserva-expirada-api. [SPEC US26 API](specs/reserva-expirada-api/SPEC.md).

Reutilizar ReservaService.propias() para GET /reservas/me y restaurante() para GET /reservas; sus respuestas tienen mensaje y reservas, sin Page. obtener(id) sigue siendo la consulta de detalle compartida con US25. readReservaList valida cada fila y duplicados. No copiar DTO o sesión en el módulo siguiente.

ReservaExpiradaStore controla contexto, listado/detalle y disponibilidad. CLIENTE ve únicamente clienteId de su sesión; operación exige ADMINISTRADOR/DUENO con el local asignado. Una fila ajena invalida la colección. No filtrar para ocultar un fallo de aislamiento. Las respuestas antiguas se cancelan/descartan al cambiar ID, cuenta o contexto.

La reserva expira solo en backend. La interfaz muestra estado y expiradaEn recibidos y conserva llegada/completada. Sin fecha no se calcula una sustituta; sin causa documentada no se deduce inasistencia de los minutos. Una completada de US25 permanece completada al actualizar historial/detalle. Los datos de muestra permanecen independientes del recorrido HTTP.

Las rutas de historial son /cliente/reservas y /operacion/reservas. Sus detalles utilizan /cliente/reserva?vista=cliente-reserva-expirada&reservaId=ID y /operacion/reserva?vista=op-reserva-expirada&reservaId=ID. No asumir #190/#207/#208 ni depender solo de history.state. Los enlaces de atención conservan reservaId hacia US25. Las vistas parciales no implementan todas las operaciones de US07/US29.

disponibilidad(reserva) envía GET /reservas/disponibilidad con restauranteId, fecha, horaInicio, horaFin y numeroComensales del registro real. Usa la respuesta mensaje/mesas y compara mesaId; numero es el número visible de mesa. Solo un booleano disponible=true verificado se presenta como libre. Error, mesa ausente o formato incompatible no implican disponible. Consultar es manual desde el detalle; al actualizarlo se invalida una lectura anterior y se repite si ya había sido solicitada.

El backend ahora permite consultar un horario ya iniciado/pasado para comprobar la mesa que liberó la reserva. Creación/reprogramación siguen rechazando pasado. Una expirada deja de bloquear y su mesa queda libre para el rango si no hay otra ocupación; una reserva posterior con solapamiento se refleja como ocupada sin reactivar la anterior. No emitir PATCH para liberar ni añadir un temporizador de Angular.

Para reproducir las pruebas de frontend, añadir scripts/us26-api.test.cjs al comando anterior (79 pruebas compartidas correctas). La suite del navegador utiliza:

~~~powershell
postman simulation run postman/simulations/us26.sim.yaml --port 4320 --no-history --output ndjson
~~~

Usar copia de Angular de desarrollo en 4319 con apiUrl http://localhost:4320/api, sin cambiar la configuración del repositorio. Ejecutar scripts/us26-api-browser.cjs con PLAYWRIGHT_MODULE si corresponde y RP_QA_OUTPUT fuera del repositorio. RP_QA_URL/RP_MOCK_URL permiten otros puertos locales; omitir RP_QA_FILTER para ejecutar todos los casos. Para regresión ejecutar después scripts/us25-api-browser.cjs contra esa misma copia/simulación; no ejecutar suites simultáneamente sobre su estado compartido.

Pasaron 18 recorridos US26 y 23 de regresión US25. El mock es sintético y no acredita JWT firmado, job, notificaciones, liberación real de mesa o PostgreSQL; esas garantías se comprobaron por separado con el backend aislado:

~~~powershell
.\mvnw.cmd '-Dtest=Us26HttpIntegrationTest,Us25HttpIntegrationTest,CicloReservaIntegrationTest,ReglasNegocioIntegrationTest' test
~~~

Resultados ejecutados: 11 pruebas HTTP/JWT/Clock/H2 US26 y 53 de regresión correctas, 64 en total. Se ejecutaron US26 y la regresión en invocaciones separadas. Se revisaron capturas de las vistas cliente/operación y no hubo desbordamiento global en los escenarios a 320/390/768/1440.

Pendiente: aceptación conjunta en el entorno del equipo y despliegue. No declarar tareas Done únicamente por estas pruebas. No se crearon commits ni PR automáticamente.

## Corrección de entradas cliente — 05/11/2026

Historial, expirada y completada deben seguir componiendo ReservaExpiradaView con ReservaExpiradaStore. No sustituirlos por ReservaStore de muestra: rompería identidad, fechas y disponibilidad pese a pasar pruebas aisladas del store. reservaId es el parámetro canónico; id se admite como compatibilidad. Un ID explícito inválido no permite recurrir a history.state. Ver [QA actual](QA-US26-CORRECCION-Y-REGRESION.md).

## PostgreSQL remoto — 05/11/2026

Se verificaron historial, fecha de expiración, disponibilidad y estado Completada contra Supabase desde el frontend actual y la API de IntelliJ en 8081. Ver [evidencia de conexión](CONEXION-SUPABASE.md). Se mantiene el servidor como autoridad de estados y disponibilidad; esta etapa no ejecutó llegada/finalización ni otras escrituras.
