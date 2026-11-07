# RestoPilot — frontend y landing

Aplicación Angular con Angular Material, rutas hijas y conexión directa a Supabase Auth y funciones PostgreSQL. La landing está en /; /estructura conserva el inventario de escenarios. Las vistas IA siguen previstas.

## Ejecutar

Usar Node según .nvmrc. Ejecutar desde este repositorio:

```powershell
npm.cmd ci
npm.cmd start
```

Abrir http://localhost:4200. No es necesario iniciar IntelliJ, Spring Boot ni pgAdmin. Se necesita conexión a Internet para acceder al proyecto Supabase configurado en environments. Los siete usuarios existentes fueron migrados a Supabase Auth conservando sus roles e identificadores.

Consultar [la guía vigente](docs/GUIA-SUPABASE-DIRECTO.md), [las pruebas realizadas](docs/QA-SUPABASE-DIRECTO.md), [AGENTS.md](AGENTS.md) y [SPEC.md](SPEC.md). No guardar contraseñas ni claves administrativas en el repositorio.

## Verificar

```powershell
npm.cmd run verify
$tests = Get-ChildItem scripts -File | Where-Object Name -match '\.test\.(cjs|mjs)$' | ForEach-Object FullName
node --test $tests
```

El inventario conserva identificadores, responsables y archivos; sus estados no sustituyen la aceptación del sprint. Las pruebas reales se documentan por separado.

## Preparar publicación

`npm.cmd run build:publish` genera dist/restopilot/browser con Supabase. Consultar [PUBLICACION.md](docs/PUBLICACION.md). Preparar el build no publica automáticamente la web.
