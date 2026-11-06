# Verificación US16 — gestión de mesas

Fecha: 06/11/2026. Rama: feature/operacion-mesas. Alcance: S2-TSK-021 y S2-TSK-022. [SPEC](specs/us16/SPEC.md).

## Resultado funcional

Plano y listado propios, incluidas mesas inactivas; registro y edición de número, capacidad y coordenadas; desactivación confirmada y reactivación con actualización desde API. Se reutilizan rutas hijas, componentes standalone, Angular Material, Reactive Forms, AuthService e interceptor JWT. No se agregan endpoints ni se modifica el backend.

El plano usa coordenadas relativas del servidor, agrupa posiciones coincidentes y conserva mesas sin ubicación. Activa/inactiva expresa la condición administrativa: la disponibilidad horaria sigue siendo responsabilidad de la API de reservas. Los errores de negocio conservan el formulario; un resultado incierto bloquea reenvíos hasta consultar y nunca repite automáticamente el POST.

## Evidencia ejecutada

- Checker y build de producción correctos; se conservan 120 escenarios y ocho carpetas de diálogos.
- Suite previa: 191 pruebas correctas. Se añaden seis pruebas de contrato y proyección numérica en scripts/us16-model.test.cjs.
- 23 escenarios de navegador con HTTP controlado: escritorio/móvil 320, 390, 768 y 1440; formulario, plano/listado, coordenadas negativas/fraccionarias, inactivas, duplicados, reservas, pausa concurrente, ID inválido/ausente/inexistente, respuesta ajena/repetida, error y recuperación, envío pendiente, pérdida de respuesta y fallo de refresco posterior al guardado. Cancelación por Escape devuelve foco sin escribir. [Resultados](evidencias/us16/controladas.json).
- 14 comprobaciones contra Spring Boot y PostgreSQL local aislado: login JWT real, altas y ediciones desde Angular persistidas, rechazo de número duplicado de mesa inactiva, desactivación/reactivación, reserva real que impide reducir capacidad y desactivar, cancelación que libera la restricción, atención pausada y rechazo de acceso administrativo para cliente. [Resultados](evidencias/us16/api-real.json).
- Capturas revisadas de plano de escritorio y formulario de 320 px. Se comprobó ausencia de desbordamiento global; la tabla conserva su desplazamiento interno. La referencia Figma se consultó por MCP según el SPEC. No se certifica equivalencia píxel a píxel ni una auditoría completa de accesibilidad.

## Repetir las pruebas

Desde la raíz del frontend, establecer NG_BUILD_SASS_EMBEDDED=0 si Windows bloquea Sass nativo, ejecutar npm.cmd run verify y node --test scripts/us16-model.test.cjs. Para el navegador, iniciar el frontend de desarrollo en 4355 y ejecutar node scripts/us16-api-browser.cjs con PLAYWRIGHT_MODULE y BROWSER_EXECUTABLE si no están en el entorno. RP_QA_URL y RP_QA_OUTPUT permiten cambiar URL local y destino.

scripts/us16-real-browser.cjs necesita exclusivamente un backend de QA en 8083 conectado a PostgreSQL aislado y vacío: crea cuentas, restaurante, mesa y reserva de prueba. No ejecutarlo contra Supabase ni datos compartidos. La base temporal usada en esta verificación se retira al terminar; no se guardan contraseñas ni tokens en la evidencia.

## Límites y coordinación

La pantalla de login de develop aún no conecta su formulario. Para estas pruebas se invoca AuthService.login desde un harness de desarrollo; las operaciones usan el JWT emitido por el backend. El recorrido desde la pantalla de acceso queda sujeto al PR de autenticación. US29 y el resto de historias no se declaran terminadas por esta entrega.

Esta rama parte de origin/develop y no incorpora los PR pendientes de US10, US14 o US27. Tras fusionarlos se deberá comprobar el conjunto antes de cerrar la validación general del sprint. El marco de navegación y su recurso de marca se reutilizan sin cambios.
