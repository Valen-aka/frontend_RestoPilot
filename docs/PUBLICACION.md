# Publicación de la aplicación Angular — TEC01 / 061

La landing y las pantallas se construyen como una única SPA. Esta tarea prepara la
configuración y la documentación; no publica un sitio ni conecta los formularios
de demostración a servicios reales.

## Desarrollo y revisión visual

Usar la versión de Node indicada en `.nvmrc` y los requisitos de `package.json`.
Desde la raíz del frontend:

```powershell
npm.cmd ci
npm.cmd run verify
npm.cmd run dev
```

La aplicación estará en `http://localhost:4200`. `environment.development.ts`
conserva la URL de desarrollo de la infraestructura API existente. Las interfaces
de demostración corregidas no envían HTTP ni crean sesiones. No habilitar datos
de muestra en el backend para presentar estas pantallas como integradas.

## Build para un alojamiento público

Configurar solo la URL pública de Spring Boot, nunca JDBC, una clave de Supabase,
una contraseña de base ni `JWT_SECRET`. Todo lo incluido en Angular es público.

```powershell
$env:RP_PUBLIC_API_URL = 'https://api.tu-dominio.example/api'
npm.cmd run build:publish
```

Reemplazar el dominio de ejemplo por el destino acordado para la API. El script
rechaza una variable ausente, HTTP, localhost, credenciales en URL, parámetros y
fragmentos. No realiza solicitudes al backend. Genera temporalmente una variante
de environment, compila con Angular y la elimina o restaura al terminar. Los
environments versionados de desarrollo no se sobrescriben.

El directorio publicable es `dist/restopilot/browser`. No publicar el repositorio,
`node_modules`, `.env` ni la carpeta `dist` superior. El build ordinario sigue
sirviendo para verificación local; para alojamiento público usar `build:publish`
para que no se empaquete accidentalmente la URL local de la API.

## Alojamiento y navegación directa

`netlify.toml` utiliza `npm run build:publish` y el directorio anterior. En el panel
del alojamiento debe existir `RP_PUBLIC_API_URL`; su ausencia hace fallar el build.
La versión Node está fijada en la configuración. `public/_redirects` devuelve
`index.html` para rutas Angular como `/auth/login` o `/operacion/pagos`.

En otro proveedor, configurar el mismo directorio y una regla equivalente de
fallback SPA. Servir primero archivos existentes (`assets`, JS, CSS); el resto
de rutas de la aplicación debe resolver a `index.html`. Esta configuración está
preparada para la raíz del dominio, no para una subcarpeta.

Verificar después de una publicación autorizada: `/`, `/auth/login`, rutas
directas y recargas, recursos locales sin 404, HTTPS y ausencia de localhost en
el bundle. Una respuesta HTML en lugar de JS suele indicar un fallback incorrecto.

## Dependencias y servicios externos

- Angular, Angular Material/CDK, RxJS, TypeScript, Chart.js y ng2-charts se instalan
  desde el lockfile con `npm ci`; no se agregaron dependencias para esta tarea.
- Los assets y las fuentes que ya incluye el proyecto se sirven localmente. No
  se incorpora un CDN, fuente remota ni servicio de IA.
- Cuando se autorice la integración, Spring Boot deberá estar publicado por
  HTTPS y admitir mediante CORS el origen exacto del frontend. Los secretos
  permanecen en el entorno del servidor. Publicar Angular no publica Spring Boot.
- Supabase/PostgreSQL seguirá detrás del backend; la URL del pooler y su password
  no se entregan al navegador.

La publicación se coordina con los responsables de la landing y la configuración
Angular conforme a `AGENTS.md`. Las interfaces visuales y el build aprobado no
equivalen a autenticación, autorización ni persistencia verificadas.
