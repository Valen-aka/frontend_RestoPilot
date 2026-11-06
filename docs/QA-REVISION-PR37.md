# Revisión e integración local del PR 37 — 2026-11-06

Rama revisada: `feature/auth-navegacion-real`, cabeza original `00da272`.
Base incorporada: `develop` en `a68c095`. La resolución permanece local hasta
crear el commit y publicar la rama; este documento no acredita un merge remoto.

## Conflictos y correcciones

- Resueltos los 19 archivos con conflictos de acceso, registros, administradores,
  paneles y shell. Se conserva la lógica HTTP del PR y el navbar único e inicio
  independiente de `develop`.
- Retirado un import duplicado de `mesasPendingGuard` introducido por la unión
  automática de las rutas de operación. Se conservan los guards y las rutas.
- El navbar de cliente reacciona a `NavigationEnd`; la prueba detectó que leer
  solamente `router.url` no actualizaba siempre el enlace activo.
- Los registros envían exclusivamente campos permitidos, incluidos los datos
  anidados del restaurante. No se envían roles ni identificadores adicionales.
- Crear administrador requiere sesión de dueño vigente y conserva su identidad.
  No se aceptan respuestas tardías de otra sesión ni propiedades adicionales de
  la respuesta del administrador.
- Los errores HTTP 400 con `detalles` se asocian a los controles conocidos de
  cliente, restaurante y administrador; se pueden corregir y volver a enviar.
  Se distinguen además 401, 403 y 404 en los mensajes compartidos.
- Los guards de registro se vuelven a evaluar al cambiar parámetros de consulta,
  para no desmontar un formulario con un alta pendiente al cambiar de variante.
- Una respuesta de error antigua del panel no altera el estado de otra cuenta.
- Los scripts de acceso permiten configurar `RP_BROWSER_EXECUTABLE`; se utilizó
  Microsoft Edge porque la ruta fija de Chrome no existe en este equipo.

## Contrato contrastado

Se consultaron controladores, DTOs, servicios, validaciones y manejo de errores
del backend local `feature/supabase`, sin modificar sus fuentes:

- `POST /api/auth/login`: 200 y sesión validada contra el DTO/JWT.
- `POST /api/auth/register`: 201, cliente sin rol elegido por el formulario.
- `POST /api/auth/register-owner`: 201 y creación atómica de cuenta/restaurante.
- `POST /api/usuarios/administradores`: 201; el backend exige DUENO y asigna
  restaurante/rol. La respuesta no sustituye la sesión del dueño.

Los endpoints existentes cubren este alcance; no se añadió backend.

## Verificaciones ejecutadas en esta revisión

- `npm.cmd run check`: aprobado; 120 escenarios conservados y rutas sin duplicados.
- `node --test scripts/*.test.cjs scripts/*.test.mjs`: 230 aprobadas, 0 fallidas.
  Incluye cuatro regresiones nuevas de campos permitidos, sesión de dueño,
  respuesta tardía y validación de campos.
- `npm.cmd run build`: aprobado tras corregir el import duplicado.
- `scripts/acceso-control-browser.cjs`: 17 escenarios aprobados con HTTP
  interceptado y Microsoft Edge headless, en `http://127.0.0.1:4361`.
  Incluyen sesión vencida/401, login inválido, errores de red/contrato,
  bloqueo de doble envío/salida durante alta, corrección de errores por campo,
  flujo dueño → restaurante → administrador, cabecera única y enlace activo.
  El primer paso de registro se comprobó a 320/390/768/1440 px, sin desbordamiento
  horizontal en esos escenarios. Resultado sanitizado en
  `evidencias/acceso-real/revision-pr37.json`.
- Backend: `.\mvnw.cmd '-DforkCount=0' '-Dtest=AltaPersonalIntegrationTest' test`:
  14 aprobadas, 0 fallidas; Spring/MockMvc con H2 en modo PostgreSQL y fallos
  controlados. El modo PostgreSQL de H2 no constituye una prueba con PostgreSQL.
- `git diff --check`: aprobado. Sin archivos con conflictos pendientes en el índice.

## Límites

No se repitieron las pruebas previas con PostgreSQL/Supabase ni se crearon cuentas
contra una base compartida. Los 17 escenarios de navegador usan respuestas
controladas; no acreditan aceptación del flujo real contra PostgreSQL.
No se volvió a verificar equivalencia con Figma ni toda la accesibilidad o todos
los módulos. Las evidencias históricas del PR permanecen diferenciadas de esta
ejecución. Pagos, edición/cancelación de pedidos y notificaciones siguen fuera
de este PR. No se marca ninguna historia como aceptada.
