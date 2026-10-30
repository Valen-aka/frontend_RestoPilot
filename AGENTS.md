# Guía de trabajo del frontend de RestoPilot

## Propósito y alcance

Este archivo establece las reglas compartidas para desarrollar y revisar el frontend. Se aplica a todo este repositorio y debe mantenerse versionado junto con el proyecto.

La base del proyecto incluye la estructura de las pantallas. Cada integrante implementa progresivamente las funcionalidades que tiene asignadas. La existencia de una carpeta o de un frame de Figma no autoriza a implementar el resto de la aplicación.

El alcance de cada tarea lo determina la solicitud del usuario o el acuerdo explícito del equipo. Las excepciones autorizadas se aplican a esa tarea; no cambian automáticamente las reglas generales.

## Fuentes de referencia

Antes de modificar código, consultar:

1. Este archivo y las instrucciones adicionales aplicables a la carpeta.
2. [Asignación del equipo](docs/ASIGNACION-EQUIPO.md) y su [versión estructurada](docs/asignacion-equipo.json), para identificar al mantenedor de las pantallas y archivos compartidos.
3. `src/app/screen-manifest.json`, para consultar los 120 identificadores de pantalla, sus responsables, rutas, estados alternativos y archivos. La landing se mantiene adicionalmente en `src/app/home/`.
4. El diseño de la pantalla solicitada y sus variantes de escritorio y móvil en [Figma](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92).
5. `package.json`, la configuración y el código de la rama actual, para comprobar las herramientas y el estado real de implementación.

Si las fuentes discrepan, señalar la diferencia y resolverla con la solicitud vigente y el reparto acordado. No inventar responsables, rutas, reglas de negocio ni estados de avance. Si una referencia no existe, indicarlo y utilizar las fuentes verificables disponibles.

Figma define la referencia visual. Las correcciones expresamente solicitadas por el usuario prevalecen para la tarea, aunque todavía no estén reflejadas allí. Si no hay acceso al diseño, comunicar la limitación; utilizar capturas o exportaciones alternativas cuando el usuario las proporcione como referencia.

## Responsabilidades y coordinación

- Implementar únicamente las pantallas asignadas y los cambios compartidos necesarios para la tarea autorizada.
- Consultar al mantenedor antes de modificar archivos compartidos fuera de ese alcance. El reparto identifica responsabilidades, no bloquea cambios ya autorizados.
- Coordinar las rutas y la infraestructura de carga con Francesco Meza.
- Coordinar el tema y los recursos visuales compartidos con Valentina Montenegro.
- Alexandra Fong mantiene la landing y su despliegue. Francesco prepara la configuración de despliegue Angular; ambos coordinan una publicación única.
- Las carpetas de pedidos y reservas tienen responsables distintos por pantalla. No atribuir un módulo completo a una persona por el nombre de la carpeta.
- Actualizar los dos documentos de asignación en el mismo cambio cuando el equipo acuerde una reasignación.

## Flujo colaborativo con Git

1. Comprobar la rama y los cambios existentes antes de empezar. Conservar el trabajo ajeno y evitar cambios de rama con trabajo pendiente sin resolver.
2. Crear las ramas de funcionalidad desde una versión actualizada de `develop`. Utilizar nombres descriptivos, por ejemplo `feature/auth` o `docs/asignacion-equipo`.
3. Mantener los cambios acotados a la tarea. Evitar reformateos masivos, cambios de dependencias o modificaciones de otros módulos sin necesidad.
4. Verificar el resultado antes de crear commits. Usar mensajes que describan el cambio concreto.
5. Entregar las funcionalidades mediante un Pull Request desde su rama hacia `develop`. La descripción debe indicar alcance, pruebas realizadas y limitaciones.
6. Integrar de `develop` a `main` después de revisar el conjunto y obtener la aprobación del equipo.

Crear commits, hacer push, abrir o fusionar Pull Requests y desplegar requieren una solicitud o autorización aplicable. Una autorización previa sigue vigente para su alcance; no pedirla de nuevo. No usar force push ni descartar cambios ajenos sin autorización explícita.

## Tecnologías y convenciones

- Angular 22, Angular Material y Reactive Forms. Consultar las versiones exactas y los requisitos de Node en `package.json` y `.nvmrc`.
- Componentes standalone con archivos `.ts`, `.html` y `.css` separados.
- Reactive Forms para controles y validaciones. Cada componente importa los módulos y directivas que utiliza.
- Angular Material para botones, entradas, selectores, fechas, tablas, paginación y diálogos. Adaptar su apariencia al diseño con estilos locales.
- Control de flujo `@if` y `@for`; usar `track` en los bucles. No introducir `*ngIf` ni `*ngFor` en nuevas plantillas.
- `routerLink` para navegación interna y carga diferida conforme a las rutas existentes.
- Reutilizar layouts, componentes, variables CSS y assets adecuados antes de crear alternativas. Mantener los estilos específicos en su componente; reservar los globales para reglas compartidas.
- Evitar dependencias nuevas cuando las herramientas existentes resuelvan la tarea.

## Organización del código

| Ruta | Responsabilidad |
| --- | --- |
| `src/app/pages/` | Pantallas agrupadas en auth, cliente, dueno, operacion y sistema |
| `src/app/routes/` | Rutas y carga diferida por grupo |
| `src/app/layouts/` | Composición compartida por contexto o rol |
| `src/app/components/` | Componentes reutilizables |
| `src/app/dialogs/` | Ocho modales definidos en la estructura base |
| `src/app/home/` | Landing pública de esta aplicación |
| `src/app/screen-host.ts` | Selección del frame que corresponde a la ruta y su estado |
| `src/app/screen-loaders.ts` | Carga de componentes del inventario |
| `src/app/screen-manifest.json` | Inventario y metadatos de las 120 pantallas |
| `public/assets/` | Recursos visuales locales |
| `docs/` | Acuerdos compartidos y evidencia de verificación |

Los estados alternativos de una página se seleccionan mediante `?vista=` conforme al inventario. Sus carpetas separan el trabajo visual; no representan endpoints ni funcionalidades de backend independientes. `screen-host.ts` es infraestructura de navegación, no lógica de negocio.

Conservar los identificadores, responsables, rutas y archivos del inventario salvo un cambio explícitamente acordado. Los campos de estado pueden actualizarse para reflejar avance comprobado, distinguiendo implementación visual de integración y aceptación funcional. Ajustar los chequeos si todavía asumen que todas las pantallas están vacías; no desactivar verificaciones ni declarar trabajo pendiente como terminado para hacerlas pasar.

La landing pertenece a esta aplicación: la ruta `/` carga `Home`. No crear otra aplicación, repositorio o servidor de landing dentro de este trabajo. Sus accesos deben utilizar las rutas de autenticación acordadas.

## Interfaz y accesibilidad

- Comparar escritorio y móvil con la referencia aprobada. Corregir desbordamientos, recortes, alineación y espaciado.
- Mantener textos y navegación coherentes; no trasladar identificadores de referencia del diseño a la interfaz final.
- Asociar etiquetas y mensajes de validación a los controles. Mantener navegación por teclado, foco visible y mensajes de estado accesibles.
- Usar imágenes locales con dimensiones y peso adecuados. No incrustar capturas completas como sustituto de una interfaz ni depender de enlaces temporales de assets.
- Aplicar animaciones sutiles sin desplazar la distribución del contenido y respetar `prefers-reduced-motion`.

## Formularios e integración

El alcance inicial es la implementación visual y de navegación. No introducir HTTP, JWT, Supabase, sesiones, creación real de cuentas, pagos u otras operaciones sin que la tarea autorice esa integración. Las vistas IA previstas tampoco autorizan servicios reales.

Los formularios pueden validar datos y permitir el recorrido visual, pero no deben anunciar operaciones reales exitosas si el servicio no está conectado. Mostrar esa limitación de forma clara cuando corresponda. No crear usuarios ficticios ni simular permisos para aparentar una integración.

No incluir secretos ni credenciales en código, documentación, URLs, logs o almacenamiento del navegador. Los archivos de entorno del frontend solo contienen configuración pública. Al autorizar una integración, comprobar los contratos existentes del backend y los permisos antes de implementarla.

## Verificación y entrega

Ejecutar desde la raíz del frontend:

```powershell
npm.cmd run check
npm.cmd run build
```

`npm.cmd run verify` ejecuta ambos pasos. Para cambios solo documentales, comprobar referencias, consistencia del reparto y el chequeo de estructura; no es necesario compilar si el código y la configuración no cambian.

Al implementar una pantalla, comprobar además:

- Diseño en escritorio y móvil, sin desbordamiento horizontal.
- URLs directas, enlaces y estados alternativos incluidos en el alcance.
- Campos vacíos, datos inválidos y recuperación de errores cuando existan formularios.
- Acceso por teclado, foco y asociación de mensajes.
- Ausencia de regresiones en los componentes compartidos afectados.

Una compilación correcta no demuestra que las 120 pantallas estén implementadas ni que la integración funcione. Registrar únicamente pruebas realmente ejecutadas. Al entregar, resumir cambios, verificaciones, limitaciones y trabajo pendiente; no marcar tareas como Done sin aceptación real.

El estado de una rama puede diferir de otra. Consultar el código y el inventario de la rama actual; no asumir que una implementación de otra rama ya está integrada en `develop`.
