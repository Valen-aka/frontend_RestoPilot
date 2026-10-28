# Home — Landing Page de RestoPilot

La landing pertenece a esta aplicación Angular. No requiere otro repositorio, servidor o instalación.

- Carpeta: src/app/home/.
- Componente: Home (selector rp-home).
- Ruta pública: /, cargada con loadComponent en src/app/app.routes.ts.
- Responsable única: Alexandra Fong, incluido el despliegue de la landing.
- Tareas: LP01 / S2-TSK-003 y S2-TSK-004. Estado: To Do.

## Archivos a desarrollar
1. home.ts: imports y configuración standalone de la pantalla.
2. home.html: cabecera, secciones, CTA y pie propios.
3. home.css: diseño responsive Desktop/Mobile.

No utilizar un layout de cliente o administración para envolver la landing. No crear otro home, aplicación o proyecto separado.
Los CTA usarán routerLink hacia /auth/login, /auth/registro y /auth/registro-dueno, según el diseño aprobado.

La carpeta se mantiene como estructura inicial. No se han desarrollado sus secciones ni se ha publicado nada.
Como home/ se compila con Angular, hay un solo artefacto dist/restopilot/browser. Alexandra mantiene y verifica la landing y su publicación; Francesco prepara la configuración de despliegue de la aplicación y ambos coordinan la publicación única. Esto no asigna a Francesco desarrollo de la landing.
