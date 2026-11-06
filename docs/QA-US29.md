# Verificación de US29 — agenda administrativa

Fecha: 06/11/2026. Rama: feature/operacion-reservas-agenda. [SPEC](specs/us29/SPEC.md). Alcance: S2-TSK-027 y S2-TSK-028.

## Comportamiento entregado

Agenda propia con fecha/estado opcionales, filtros conservados en URL, orden API y vacío explícito. Detalle real por ID, reprogramación con consulta de disponibilidad, cancelación confirmada y control de permisos/concurrencia. Se utilizan rutas hijas, componentes standalone, Angular Material, Reactive Forms, AuthService y el interceptor compartido. El detalle compartido deja de confirmar solicitudes en memoria: confirmar y rechazar usan la API existente. Esto no declara completas las demás pantallas de US17.

La consulta de disponibilidad no excluye la reserva editada. La mesa actual ocupada se identifica como tal, sin anunciarla libre; se permite enviarla si está presente y tiene capacidad, porque el PUT verifica el solapamiento excluyendo esa reserva. Cambiar fecha, horario o comensales invalida disponibilidad y selección. El servidor decide atención, horario, capacidad, estado y conflictos; no se ejecuta la expiración desde el navegador.

Tras guardar se consulta detalle y agenda. Rechazos 400/409 conservan el borrador y consultan el estado actual; llegada concurrente bloquea los controles. Una respuesta perdida, incoherente o un refresco posterior fallido bloquea nuevos envíos hasta verificar, sin reintento automático. Cancelar conserva historial y libera disponibilidad. El límite de dos horas corresponde al cliente y no se aplica al personal del restaurante.

## Evidencia ejecutada

- Chequeo estructural y build de producción correctos; 120 escenarios y ocho carpetas de diálogos conservados.
- Las 191 pruebas previas pasan; se añaden ocho pruebas de contratos de agenda, calendario, permisos, identidad, disponibilidad y confirmaciones en scripts/us29-agenda.test.cjs.
- 29 escenarios de navegador con respuestas controladas: 320/390/768/1440 px, filtros combinados e independientes, navegación/retorno, vacío, edición de mesa actual, capacidad, invalidación de consulta, conflictos y llegada concurrente, pérdida de respuesta, errores de lectura/refresco, ID inválido/ajeno, rol, cambio de cuenta, evaluación y bloqueo de navegación durante envío. Escape devuelve foco sin cancelar. [Resultados](evidencias/us29/controladas.json).
- 15 comprobaciones con Spring Boot, JWT firmado y PostgreSQL local aislado: agenda sin mezclar restaurantes, filtros, edición persistida a PENDIENTE, solapamiento rechazado conservando datos, cambio a mesa disponible, cancelación/liberación, cliente rechazado a menos de dos horas mientras personal puede cancelar, detalle ajeno denegado, evaluación persistida y llegada real con enlace a US25. [Resultados](evidencias/us29/api-real.json).
- 23 regresiones US25 con simulación Postman local: llegada, finalización, fechas, permisos, conflictos y resultados inciertos. [Resultados](evidencias/us29/regresion-us25.json).
- 19 regresiones US26 con simulación Postman local: historial/detalle cliente y operación, fecha real de expiración, disponibilidad, errores, aislamiento y recorrido US25 → agenda → detalle. Se adapta el acceso de operación a US29 sin sustituir la vista de expiración. [Resultados](evidencias/us29/regresion-us26.json).
- Capturas de agenda de escritorio, edición de 320 px y cancelación móvil revisadas. Sin desbordamiento global en los anchos comprobados; tabla con desplazamiento interno y campos Material etiquetados. Figma se consultó por MCP en los frames del SPEC. No se certifica equivalencia píxel a píxel ni una auditoría completa de accesibilidad.

## Reproducción

Ejecutar npm.cmd run verify y node --test scripts/us29-agenda.test.cjs desde la raíz del frontend. Si Windows bloquea Sass nativo, establecer NG_BUILD_SASS_EMBEDDED=0. Para pruebas de navegador iniciar frontend de desarrollo en 4356 y ejecutar node scripts/us29-api-browser.cjs. PLAYWRIGHT_MODULE/BROWSER_EXECUTABLE permiten indicar Playwright y Chrome; RP_QA_URL y RP_QA_OUTPUT modifican URL local y carpeta de evidencia.

scripts/us29-real-browser.cjs exige RP_QA_ISOLATED=1 y un backend local de QA conectado a PostgreSQL aislado, por defecto 8083. Crea cuentas, restaurantes, mesas y reservas exclusivas de prueba; no ejecutarlo sobre Supabase ni datos compartidos. La base temporal usada se retira al finalizar y no se guardan credenciales ni tokens en la evidencia.

Para las regresiones iniciar postman simulation run postman/simulations/us25.sim.yaml --port 4358 --output ndjson y postman simulation run postman/simulations/us26.sim.yaml --port 4357 --output ndjson. Ejecutar sus scripts con RP_QA_URL=http://127.0.0.1:4356 y RP_MOCK_URL apuntando al puerto correspondiente. Ahora cada script dirige expresamente las peticiones al mock local; no depende del backend abierto en IntelliJ. El mock US26 incorpora únicamente la lectura del contexto de restaurante que requiere la agenda.

## Límites y coordinación

Esta rama parte de origin/develop y conserva separados los PR pendientes de US10, US14, US27 y US16. Tras integrarlos debe comprobarse el conjunto. El formulario de login de esta base sigue pendiente de su conexión: las pruebas inician sesión mediante AuthService.login real desde un harness de desarrollo, sin sesión ficticia en la aplicación.

El alcance visual se centra en consultar y gestionar reservas existentes; no implementa el alta administrativa de US06 ni la configuración de US27. Se conservan las variantes, servicios y enlaces de US25/US26. No se modifica el reparto de responsables ni se declara finalizada la verificación general del sprint. No se cambian endpoints del backend ni datos de Supabase.
