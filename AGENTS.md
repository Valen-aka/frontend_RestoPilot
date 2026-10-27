# RestoPilot

## Datos
- Figma: https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92
- Angular 22, Angular Material y Reactive Forms.
- Capturas del usuario e inventario original de 120 pantallas.
- Landing y su despliegue: Alexandra Fong.

## Estado de esta entrega
El usuario pidió **solo la estructura completa, sin llenar el código de las pantallas**. Se crean carpetas, archivos, configuración y puntos de extensión. Las plantillas quedan vacías con TODO y los FormGroup no tienen controles.

## Cómo trabajar después
Implementar solo las pantallas que el usuario autorice, respetando los responsables del inventario. Los componentes reutilizables, formularios y modales están permitidos por la indicación actual. No rellenar todas las pantallas automáticamente por existir el inventario.

Utilizar componentes standalone y archivos .ts/.html/.css separados. Reactive Forms para controles y validaciones. Angular Material para botones, inputs, selectores, fechas, tablas, paginación y MatDialog. Usar @if/@for con track; no *ngIf/*ngFor. La lógica de selección de frame en screen-host.ts es infraestructura, no lógica de negocio ni un ejemplo de formulario.

Los estados alternativos pertenecen a la misma página y se reservan mediante ?vista=. Las carpetas por frame separan el trabajo visual; no son APIs independientes.

No introducir HTTP, JWT, Supabase, usuarios ficticios ni operaciones reales sin autorización posterior. Los environments solo reservan configuración pública. No incluir secretos ni credenciales.

## Estructura
- pages/auth, cliente, dueno, operacion y sistema: carpetas de cada frame.
- routes/: rutas por grupo y carga diferida.
- layouts/: marcos por rol; contenido y conexión pendientes.
- components/: reutilizables; contenido pendiente.
- dialogs/: ocho modales; contenido y apertura pendientes.
- home/: landing, sin implementar.
- docs/pantallas-y-responsables.json: inventario y rutas de archivo.

## Verificar
Ejecutar npm.cmd run verify. Una compilación correcta verifica la base, no la implementación de las 120 pantallas. Al implementar una pantalla, comparar Desktop/Mobile, validaciones y navegación. No marcar integración ni tareas como Done sin aceptación real.
