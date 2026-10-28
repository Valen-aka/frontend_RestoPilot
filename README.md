# RestoPilot — Frontend y Landing Page en una sola aplicación

## Ejecutar por primera vez
```powershell
cd C:\Users\Alex\frontend_RestoPilot
npm.cmd ci
npm.cmd run dev
```

- http://localhost:4200/ → Home / Landing Page, todavía sin contenido.
- http://localhost:4200/estructura → inventario técnico de las 120 pantallas.

Después de modificar código basta guardar con el servidor activo o ejecutar npm.cmd run dev. Repetir npm.cmd ci únicamente cuando cambien las dependencias/lockfile.

## Landing integrada
La landing está en src/app/home/: home.ts, home.html y home.css. La ruta / ya carga Home desde app.routes.ts. No se utiliza un proyecto o servidor de landing separado. Toda la landing, incluido su despliegue, corresponde a Alexandra Fong. Consultar src/app/home/README.md.

## Quién modifica cada archivo
- docs/ASIGNACION-EQUIPO.md: reparto por integrante, carpeta y componente.
- docs/asignacion-equipo.json: inventario completo de archivos con un responsable principal.
- docs/pantallas-y-responsables.json: las 120 pantallas y sus referencias US originales.

Reservas y Pedidos tienen responsables distintos por pantalla; no asignar toda la carpeta de esos dominios a una sola persona. Los componentes compartidos tienen un mantenedor principal para evitar cambios simultáneos.

## Verificar
```powershell
npm.cmd run verify
```

Node recomendado: 24.21.0. La base incluye configuración Angular 22, Material, Reactive Forms vacíos, 120 carpetas de pantalla, ocho modales, layouts y componentes reutilizables.

## Alcance
Las plantillas y componentes siguen sin implementar. No hay operaciones, datos de ejemplo, login, backend, Supabase ni IA funcionando. Una compilación correcta comprueba la estructura, no la aceptación de tareas. Las 18 vistas IA son trabajo futuro y no aumentan los 122 SP del sprint sin IA más landing.

## Publicación pendiente
Un solo build genera dist/restopilot/browser; netlify.toml y public/_redirects preparan una SPA. Alexandra es responsable de la landing y su despliegue; Francesco de preparar el despliegue de Angular. Al estar integradas ambas partes, se coordina una publicación única, sin mantener otra landing por separado. No se ha desplegado nada.
