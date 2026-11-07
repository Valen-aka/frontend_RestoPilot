# Publicación de Angular con Supabase

La landing y la aplicación son una SPA. El frontend ya no depende de una API Spring Boot publicada. La preparación de esta rama no despliega el sitio.

## Construir

```powershell
npm.cmd ci
npm.cmd run build:publish
```

El script usa el proyecto público configurado. Para otro proyecto, definir RP_PUBLIC_SUPABASE_URL (HTTPS, sin rutas ni credenciales) y RP_PUBLIC_SUPABASE_KEY (clave sb_publishable_). RP_PUBLIC_API_URL pertenece a la conexión anterior y ya no se usa. Nunca introducir claves secretas, service_role, contraseñas PostgreSQL ni credenciales de usuarios en Angular.

Se genera temporalmente environment.publish.ts y se restaura o elimina al terminar. Publicar solo dist/restopilot/browser. netlify.toml ejecuta build:publish; public/_redirects permite recargar rutas SPA. En otro proveedor configurar el mismo fallback hacia index.html después de servir archivos existentes.

## Proyecto Supabase

Las migraciones de supabase/migrations ya fueron aplicadas al proyecto actual. En otro proyecto, instalarlas en orden y configurar Vault, Auth y el trabajo programado según la guía. No ejecutar scripts históricos que recrean tablas existentes.

En Supabase Auth configurar Site URL y las URL de redirección del dominio final. El registro público requiere confirmar el correo; verificar entrega y redirección con ese dominio antes de anunciar el alta pública. Las siete cuentas migradas están confirmadas. La base mantiene los permisos y reglas de negocio en funciones del servidor; el navegador usa únicamente la clave publicable y la sesión del usuario.

Después de publicar, verificar HTTPS, inicio de sesión, navegación por rol, recarga de rutas y ausencia de llamadas a localhost. La IA continúa fuera de esta implementación. Ver [guía](GUIA-SUPABASE-DIRECTO.md) y [evidencias](QA-SUPABASE-DIRECTO.md).
