# Publicación de Angular con Supabase

La landing y la aplicación son una SPA. Los flujos de negocio usan Supabase directamente y los chats usan la API Spring de asistentes.

## Construir

```powershell
npm.cmd ci
npm.cmd run build:publish
```

El script usa el proyecto público configurado. Para otro proyecto, definir RP_PUBLIC_SUPABASE_URL (HTTPS, sin rutas ni credenciales) y RP_PUBLIC_SUPABASE_KEY (clave sb_publishable_). RP_PUBLIC_API_URL pertenece a la conexión anterior y ya no se usa. Nunca introducir claves secretas, service_role, contraseñas PostgreSQL ni credenciales de usuarios en Angular.

Se genera temporalmente environment.publish.ts y se restaura o elimina al terminar. Publicar solo dist/restopilot/browser. netlify.toml ejecuta build:publish; public/_redirects permite recargar rutas SPA. En otro proveedor configurar el mismo fallback hacia index.html después de servir archivos existentes.

## API de asistentes

Configura `RP_PUBLIC_ASSISTANT_API_URL` en las variables de build de Netlify para el contexto de producción. Usa la URL pública HTTPS de Spring terminada en `/api/ia`. Angular añade `/cliente/chat` y `/admin/chat` y envía el token del usuario autenticado. Si omites la variable, el build emite un aviso y el asistente queda deshabilitado.

En Spring, incluye el origen HTTPS de la Web Application en `RESTOPILOT_CORS_ALLOWED_ORIGINS` y configura la autenticación Supabase para el mismo proyecto que Angular. Activa Gemini en el servidor. Cada cambio de la URL requiere recompilar y volver a publicar la SPA.

## Proyecto Supabase

Las migraciones de supabase/migrations ya fueron aplicadas al proyecto actual. En otro proyecto, instalarlas en orden y configurar Vault, Auth y el trabajo programado según la guía. No ejecutar scripts históricos que recrean tablas existentes.

En Supabase Auth configurar Site URL y las URL de redirección del dominio final. El registro público requiere confirmar el correo; verificar entrega y redirección con ese dominio antes de anunciar el alta pública. Las siete cuentas migradas están confirmadas. La base mantiene los permisos y reglas de negocio en funciones del servidor; el navegador usa únicamente la clave publicable y la sesión del usuario.

Después de publicar, verifica HTTPS, inicio de sesión, navegación por rol, recarga de rutas y ausencia de llamadas a localhost. Prueba una consulta con una sesión de cliente y un reporte con una sesión de dueño o administrador. Comprueba que ambos POST llegan a la URL Spring configurada y devuelven una respuesta. Consulta la [guía de Supabase](GUIA-SUPABASE-DIRECTO.md) y sus [evidencias](QA-SUPABASE-DIRECTO.md).


## Vercel y publicacion desde develop

Proyecto existente: sesko1/restopilot-vercel-ready. URL: https://restopilot-vercel-ready.vercel.app.

vercel.json declara npm ci, verificacion estructural y build:publish; se publica dist/restopilot/browser con fallback SPA y compatibilidad con las rutas API del despliegue anterior.

Configurar RP_PUBLIC_ASSISTANT_API_URL=https://backend-restopilot.onrender.com/api/ia en Production y Preview. El build deriva springApiUrl del mismo servidor para que el perfil cliente use /api/auth/me. Estas variables son publicas; no introducir credenciales administrativas ni claves Gemini en Vercel.

Para despliegues automaticos, conectar Valen-aka/frontend_RestoPilot en Settings > Git y seleccionar develop como Production Branch. Los cambios fusionados en develop publicaran produccion; otras ramas pueden generar Preview. La conexion solo funciona si la integracion GitHub de Vercel ya tiene acceso al repositorio; cualquier autorizacion adicional la debe completar su propietario.

La vinculacion Git desde CLI requiere primero una Login Connection de GitHub en la cuenta Vercel. Si no existe, completar Account Settings > Authentication > GitHub y luego Settings > Git del proyecto. El deploy manual sigue disponible mientras se configura esa conexion.
