# RestoPilot — frontend y landing

Una aplicación Angular para la landing pública y las pantallas de cliente, dueño
y operación. La ruta `/` carga Home; `/estructura` permite consultar el inventario
de 120 escenarios. Las 18 vistas IA están previstas y no forman parte de esta
implementación visual.

## Ejecutar localmente

Usar la versión de Node de `.nvmrc` y los requisitos de `package.json`. Desde la
raíz del repositorio:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abrir `http://localhost:4200`. Repetir `npm ci` cuando cambie el lockfile o al preparar
una instalación limpia. Los recursos de la landing pertenecen a `src/app/home/`
y `public/assets/landing/`; no hay una aplicación de landing separada.

## Alcance y fuentes

Consultar [AGENTS.md](AGENTS.md), [SPEC.md](SPEC.md), la
[asignación del equipo](docs/ASIGNACION-EQUIPO.md) y su
[versión estructurada](docs/asignacion-equipo.json). El inventario está en
`src/app/screen-manifest.json`; sus indicadores describen el avance declarado,
no la aceptación funcional de todas las pantallas.

La solicitud visual vigente permite revisar formularios, carga, éxito, duplicado,
rechazo, navegación y datos ilustrativos. Los avisos de demostración no crean
cuentas, asignan permisos, registran pagos ni modifican pedidos reales. La
infraestructura API ya existente tiene su alcance documentado en las guías de
integración. No confundir el renderizado ni el build con una prueba de backend.

## Verificar

```powershell
npm.cmd run verify
$tests = Get-ChildItem scripts -File | Where-Object Name -match '\.test\.(cjs|mjs)$' | ForEach-Object FullName
node --test $tests
```

El checker conserva identificadores, archivos y los ocho modales. La compilación
verifica compatibilidad del código. Los recorridos de navegador y sus límites
se registran por separado en la documentación de QA.

## Preparar publicación

Consultar [PUBLICACION.md](docs/PUBLICACION.md) para variables públicas, servicios
externos, configuración Netlify, fallback SPA y procedimiento de revisión.
`npm.cmd run build:publish` genera `dist/restopilot/browser` y exige una URL pública
HTTPS de la API. No se incluyen claves privadas en Angular ni se publica un sitio
como parte de esta preparación. La publicación única se coordina con los
responsables definidos en AGENTS.md.
