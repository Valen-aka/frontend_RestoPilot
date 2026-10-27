# RestoPilot — Estructura completa, sin pantallas desarrolladas

```powershell
cd RestoPilot-Estructura-Completa
npm.cmd ci
npm.cmd run dev
```

Abrir http://localhost:4200/estructura para comprobar el inventario. La ruta / y las rutas de pantalla están vacías intencionalmente.

```powershell
npm.cmd run verify
```

Requiere Node 24.21.0 o compatible con el package.json. Extraer en una carpeta nueva, sin mezclar con versiones anteriores.

## Preparado
- Configuración Angular 22, Angular Material, TypeScript y lockfile.
- 120 carpetas con archivos .ts, .html y .css, una por frame.
- Grupos de rutas y carga diferida. Variantes mediante ?vista=; no se crean endpoints de negocio.
- FormGroup vacío donde corresponde; sin campos ni validaciones implementadas.
- 8 carpetas de diálogo con MatDialog preparado y contenido vacío.
- 5 layouts y 13 componentes reutilizables, sin diseño desarrollado.
- Assets originales y variables visuales base.
- home/ vacío para la landing de Alexandra.
- Inventario, responsables, rutas y archivos en docs/pantallas-y-responsables.json.

## Por hacer
Implementar el contenido de cada pantalla, completar campos/validaciones, completar el dise?o de layouts y conectar componentes reutilizables, abrir los modales desde las acciones y revisar Desktop/Mobile con las capturas.

No hay formularios completos, datos de ejemplo, operaciones, login, backend, Supabase, guardias de acceso ni IA funcionando. Las interfaces IA tienen su carpeta como alcance visual futuro. Ninguna tarea queda Done por entregar esta estructura.

La base incluye únicamente un índice técnico en /estructura. No confundirlo con el dashboard del producto.

La landing y su despliegue pertenecen a Alexandra. Francesco conserva la preparación de despliegue de Angular; al compilarse home/ junto con el resto, la publicación del artefacto debe coordinarse. No se ha publicado nada.
