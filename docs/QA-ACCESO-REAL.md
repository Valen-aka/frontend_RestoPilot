# Acceso real y navegación — 06/11/2026

Rama: feature/auth-navegacion-real. Parte de a82fa82 (fix/integracion-rutas-operacion); integrar primero esa corrección de rutas si todavía no está en develop.

## Implementado

- US01: alta real de cliente con validaciones, duplicado, carga y resultado incierto sin reenvío automático.
- US21: cuenta y restaurante en dos pasos; un único POST final atómico. Borrador sensible en memoria, con vencimiento y limpieza al abandonar el recorrido.
- US02: acceso JWT real, retorno interno compatible con el rol, rutas privadas protegidas, salida y expiración/401. El servidor conserva la autorización definitiva.
- US22: creación real de administrador por el dueño; conserva la sesión del dueño y muestra solo la respuesta confirmada.
- Inicio de dueño y operación con restaurante e indicadores reales del día; estados vacíos, error y reintento. Menús, salida móvil y acceso denegado reutilizan componentes y rutas existentes.
- Angular Material, formularios reactivos, signals y rutas hijas. Se preservan los 120 identificadores de pantallas y sus responsables.

## Evidencia ejecutada

- 225 pruebas unitarias aprobadas, incluidas siete nuevas sobre contrato de acceso, retorno, roles, alta, cierre e identidad del dueño.
- 18 comprobaciones de navegador usando formularios reales contra Spring Boot/PostgreSQL aislados: altas, tres roles, permisos, duplicado, navegación, ausencia de credenciales persistidas y anchos 320/390/768/1440.
- 14 escenarios controlados de navegador: vencimiento, 401, fallos de red/contrato, doble envío, envío pendiente, resultado incierto, campos y responsive.
- Acceso mediante formulario con tres cuentas existentes de Supabase (dueño, administrador y cliente), consulta de mesas y carta. Sin crear usuarios ni operaciones de QA en Supabase.
- JSON sanitizados en docs/evidencias/acceso-real. Las credenciales permanecen fuera de Git.

## Cómo reproducir

Ejecutar npm run verify y node --test scripts/*.test.cjs scripts/*.test.mjs. Para navegador: iniciar Angular en 4361 y usar PLAYWRIGHT_MODULE con Playwright instalado y Chrome disponible. scripts/acceso-control-browser.cjs intercepta HTTP. scripts/acceso-real-browser.cjs exige RP_QA_ISOLATED=1 y redirige la API a un backend aislado en 8083; crea usuarios de prueba únicamente allí. No ejecutarlo apuntando a una base compartida.

La aplicación de uso local se sirve en http://localhost:4200 con API habitual 8081. Las cuentas demo existentes están en un archivo privado fuera del repositorio. Mantener IntelliJ/backend y frontend activos mientras se usa.

## Límites

JWT exclusivamente en memoria: una recarga completa requiere volver a iniciar sesión. No hay refresh token ni recuperación de contraseña del servidor en este alcance. Pagos administrativos, ajustes y notificaciones de Fran conservan su estado previo; esta entrega permite entrar y recorrer los módulos existentes, sin acreditar esas US como terminadas. No incluye IA, despliegue público ni aceptación visual de todo el sprint.

Los harness anteriores se adaptan al acceso protegido. Las regresiones de navegador efectivamente terminadas se anotan debajo; la existencia de un script modificado no equivale a haberlo ejecutado.

## Regresiones terminadas

- US10: 21 escenarios de navegador aprobados.
- US16: 23 escenarios de navegador aprobados.
- US27: 24 escenarios de navegador aprobados.
- US29: 29 escenarios de navegador aprobados.
- US20: 29 escenarios de navegador aprobados.

Compilación de producción y comprobación estructural aprobadas. Se retiró la base aislada de QA al finalizar; la aplicación habitual conserva su conexión a Supabase.
