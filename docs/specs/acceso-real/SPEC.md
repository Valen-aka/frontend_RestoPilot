# Acceso real y navegación de la web

Rama: feature/auth-navegacion-real. Base: corrección de rutas a82fa82 sobre develop 9106980; integrar primero el PR de fix/integracion-rutas-operacion. El usuario autoriza conectar las tareas necesarias para entrar desde la landing y recorrer las pantallas, aunque sus formularios pertenezcan al mantenimiento de otro integrante. No se cambia el reparto del backlog.

## Alcance

US02 (009–010): login real, navegación por rol, retorno interno seguro, guards, cierre y expiración. US01 (008): registro de cliente. US21 (006): alta atómica de dueño y restaurante en dos pasos. US22 (012): creación de administradores desde dueño. Conectar además los paneles de inicio a consultas reales y accesos a los módulos integrados, sin indicadores de muestra. Mantener landing, rutas hijas, componentes standalone, Angular Material y Reactive Forms.

Quedan fuera IA, despliegue y las demás integraciones de pagos, ajustes, notificaciones o reservas de otros integrantes que no sean necesarias para estos accesos. No declarar todas las tareas pendientes como terminadas por permitir navegar.

## Contratos

- POST /api/auth/login: correo/password → 200 AuthResponse (token, id, nombreCompleto, correo, rol, restauranteId, mensaje).
- POST /api/auth/register: nombreCompleto/correo/password → 201 AuthResponse CLIENTE. No enviar rol o restaurante elegido por el navegador.
- POST /api/auth/register-owner: cuenta más restaurante {nombre,direccion,telefono,horaApertura,horaCierre,tieneAtencionFisica,aceptaDelivery} → 201 AuthResponse DUENO. Un solo envío final; el primer paso no crea registros parciales.
- POST /api/usuarios/administradores: nombreCompleto/correo/password → 201 AdministradorResponse sin token. Mantener la sesión del dueño; el backend asigna rol y restaurante.
- GET /api/restaurantes/{id} y GET /api/reportes/operativos del día para contexto e indicadores iniciales, reutilizando los servicios existentes. No deducir cifras si falta el reporte.

Reutilizar AuthService, API_SESSION e interceptor. Validar los claims y el DTO antes de aceptar sesión; el servidor verifica firma y autorización. Token en memoria, sin localStorage, sessionStorage ni claves del backend. Recargar la página requiere iniciar sesión nuevamente mientras no exista renovación segura del lado servidor.

## Recorrido y reglas

1. Landing → Entrar → formulario real → inicio de cliente (/cliente), administrador (/operacion) o dueño (/dueno). Un returnUrl se usa solo si es interno y compatible con el rol; rechazar esquemas externos, doble slash, barras inversas o rutas de otro perfil.
2. Proteger todas las rutas privadas por sesión vigente y rol. Cliente no entra a operación; administrador no entra al panel de dueño. Acceso denegado muestra la pantalla existente y permite volver a su inicio. La autorización definitiva permanece en la API.
3. Evitar envíos simultáneos. Carga, error de credenciales, red, duplicado y validaciones por campo con mensajes y foco. No anunciar sesión/cuenta/administrador creados sin respuesta verificable. No reintentar POST automáticamente si el resultado es incierto.
4. Registro de dueño conserva el paso de cuenta solo en memoria durante el recorrido y por tiempo limitado. Entrada directa al segundo paso pide completar el primero. No poner contraseña ni cuenta en URL, estado de navegación, logs o almacenamiento. Al terminar, cancelar o abandonar el flujo, eliminar el borrador sensible.
5. Administrador se crea solo desde sesión DUENO, con restaurante asignado por servidor. Mostrar identidad confirmada sin contraseña y no convertir la respuesta en sesión del nuevo empleado. No simular correo de invitación.
6. Cierre de sesión y 401 limpian la sesión. Expiración del JWT devuelve al acceso con motivo y retorno interno. Cambiar cuenta cancela/descarta respuestas anteriores. No perder datos de otro usuario en una respuesta tardía.
7. Estados alternativos de login/duplicado son variantes del mismo formulario real, sin fabricar errores por vista. Bienvenida y administrador creado muestran éxito únicamente con respuesta previa real, y permiten continuar sin datos inventados si se accede directamente.
8. Inicio de dueño/operación muestra restaurante e indicadores del día consultados. Vacío y error se explican; no conservar cifras ilustrativas. Accesos a carta, cocina, mesas, reservas y reportes reutilizan sus rutas.

## Diseño y validación

Referencia: copia Figma indicada por el usuario sRxKEwFdrMKfXPosGFvoHc. Contexto MCP/capturas desktop consultados: 173:2, 173:7, 173:9, 173:11, 89:5483, 89:5824 y 89:20779; Variantes móviles consultadas con contexto y captura MCP: 173:3, 173:6, 173:8, 173:10, 89:5619, 89:5980 y 89:21024. Reutilizar AuthLayout/AuthStory y los recursos locales de marca/plato; formularios Material con tokens comunes.

Probar formularios reales con backend de QA/PostgreSQL aislado, sin inyectar sesión desde el harness para acreditar este flujo. Verificar cliente, dueño y administrador, alta atómica, duplicados, permisos, retorno malicioso, vencimiento/401, salir/volver, responsive 320/390/768/1440, teclado y ausencia de contraseñas/tokens persistidos. Ejecutar checker/build y regresiones compartidas; adaptar los harness anteriores al acceso protegido, sin relajar los guards para hacerlos pasar. Dejar la web local disponible al usuario con el backend habitual y las cuentas de prueba existentes, sin sembrar altas de QA en Supabase.


Ejecución y límites comprobados: [QA de acceso real](../../QA-ACCESO-REAL.md).
