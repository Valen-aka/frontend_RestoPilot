# Guía de conexión directa a Supabase

## Uso del equipo

Ejecutar npm ci y npm start desde el frontend; abrir localhost:4200. No se necesita IntelliJ ni pgAdmin para usar la aplicación. Los accesos son cuentas de la aplicación en Supabase Auth, no cuentas para entrar al panel administrativo de Supabase. El archivo de contraseñas se entrega fuera de Git.

La rama feature/supabase-directo prepara el transporte común, autenticación y funciones del servidor para las operaciones existentes. Conserva las pantallas, componentes, estilos y rutas de la base. Las pantallas que todavía usan muestras, como pagos administrativos, ajuste/cancelación y notificaciones, requieren implementación en ramas separadas: cambiar el transporte no completa esas historias de usuario. La IA sigue prevista.

## Arquitectura y reglas

- environments contiene únicamente URL y clave publicable. transport=supabase es el modo vigente tanto en desarrollo como en publicación.
- AuthService y API_SESSION mantienen una sola sesión en memoria. Supabase Auth emite el JWT; el perfil vincula el UUID con el identificador numérico existente. No añadir una segunda sesión ni almacenar contraseñas en el navegador.
- Los servicios de dominio conservan sus DTO y rutas internas. supabase-transport.interceptor transforma esas solicitudes a public.rp_api. /restopilot-api es un identificador interno; no es una API que deba iniciarse localmente.
- rp_api aplica permisos por usuario, rol y restaurante; devuelve status/body para conservar el tratamiento de errores HTTP. Los totales, snapshots, cambios de estado y restricciones se calculan en PostgreSQL.
- Las tablas están en restopilot, con RLS y sin acceso directo para anon/authenticated. Solo authenticated puede ejecutar la función pública; las funciones privadas tienen permisos revocados.
- El alta pública no concede administración de un restaurante existente. La creación administrativa usa una clave en Vault desde el servidor y conserva la sesión del dueño.
- La expiración corre en el servidor con pg_cron cada minuto y también al consultar operaciones. El navegador no decide ni ejecuta una expiración. Los bloqueos vuelven a comprobar las condiciones temporales.
- Cerrar sesión invalida su uso posterior en RPC. No reintentar automáticamente escrituras cuyo resultado sea incierto: consultar primero el estado real.

## Migración

Los cinco archivos supabase/migrations se ejecutaron en orden sobre el proyecto actual. Se respaldó el esquema antes de migrar. Se conservaron las siete cuentas, roles, relaciones e identificadores; se crearon sus vínculos Auth y se renovaron todas sus contraseñas con valores distintos. La sincronización del hash anterior permite compatibilidad del registro, pero Angular ya utiliza Supabase Auth.

El trabajo restopilot-expiracion quedó habilitado y se comprobó una ejecución satisfactoria. La clave administrativa necesaria para crear administradores se guarda en Vault como restopilot_auth_admin_key; nunca se copia al frontend. Para repetir la instalación en otro proyecto hace falta configurar ese secreto por un canal privado.

Los usuarios migrados están confirmados. Las altas públicas nuevas requieren la confirmación de correo habilitada en Auth; configurar dominio y redirecciones al publicar. No se probó la entrega real a un buzón externo.

## Continuar el desarrollo

Reutilizar los servicios existentes, AuthService, API_SESSION y el único interceptor. Ante nuevas operaciones, extender las funciones privadas y el contrato público con permisos explícitos; no habilitar lectura/escritura indiscriminada de tablas ni colocar una clave administrativa en Angular. Las guías antiguas que usan Spring describen el transporte anterior. Consultar primero esta guía y el SPEC de supabase-directo.

Ver [pruebas y límites](QA-SUPABASE-DIRECTO.md) y [publicación](PUBLICACION.md). Esta rama no implica que se haya publicado una URL nueva ni que todas las tareas del backlog estén aceptadas.
