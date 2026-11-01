# SPEC — Landing

Estado: primera entrega visual preparada; implementación pendiente.

## Datos

- Funcionalidad LP01. Tareas S2-TSK-003 y S2-TSK-004.
- Rama propuesta: feature/landing. PR hacia develop.
- Ruta existente: `/`; componente Home en src/app/home/.
- Leer [SPEC común](../../../SPEC.md) y AGENTS.md de la raíz.
- Página: [Landing en Figma](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=0-1).
- Frame desktop confirmado por metadatos: [RestoPilot / Landing · Escritorio — 115:144](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=115-144), ancho 1280 px.
- Frame mobile: recuperar y confirmar en la página Landing antes de implementar. No reutilizar su ID histórico sin verificación.
- Estilos: página Style 5:124 del mismo archivo. No confundirla con el frame de landing.

## Objetivo

Presentar RestoPilot y permitir explorar la propuesta de valor y acceder a inicio de sesión o registro. Implementar la landing dentro del frontend existente, sin crear otra aplicación.

## Alcance

S2-TSK-003: construir la landing responsive con identidad, propuesta de valor, funcionalidades y llamadas a registro e inicio de sesión.

S2-TSK-004: conectar sus accesos con las rutas de la aplicación y verificar navegación desktop/mobile. El reporte define esta tarea como navegación; no convierte este cambio en autorización para desplegar.

Incluir contenido, cabecera, pie y estados de navegación según el diseño confirmado. Menú compacto y FAQ interactivos solo según elementos presentes en el frame. Se permite comportamiento local de menú, acordeón y navegación; no realizar operaciones de negocio.

No implementar pantallas de autenticación, carrito, reservas, backend ni asistentes IA. Las menciones a IA conservan carácter de presentación de capacidad prevista; no deben aparentar un asistente operativo. No añadir precios, testimonios, promesas ni políticas comerciales sin fuente aprobada.

## Estructura y archivos

Archivos principales: src/app/home/home.ts, home.html y home.css. Leer home/README.md antes de modificar. Guardar recursos necesarios en public/assets/ reutilizando los adecuados. Eliminar comentarios provisionales de la plantilla al implementar; no trasladar nombres ni identificadores internos a la interfaz.

La ruta `/` ya carga Home en src/app/app.routes.ts; conservarla. Reutilizar botones Material, componentes compartidos y estilos existentes. No modificar app.routes.ts, screen-manifest.json, estilos globales ni dependencias si la landing puede resolverse con sus archivos locales. Justificar previamente cualquier cambio compartido necesario.

## Composición a contrastar con Figma

1. Cabecera y navegación de la página.
2. Hero: texto confirmado «Que fluya el servicio.» y CTA «Empieza con RestoPilot».
3. Secciones de propuesta de valor y funcionamiento para clientes y operación.
4. Presentación de asistencia, pasos de uso y preguntas frecuentes según el frame.
5. CTA final y pie.

El hero y su texto se confirmaron por metadatos del frame actual. El resto de esta lista procede del reporte y del catálogo histórico de mockups; verificar textos, orden y presencia en las capturas vigentes antes de codificar. No usar esta lista como permiso para inventar secciones.

## Contenido y navegación

| Acción | Destino confirmado en Angular | Condición |
| --- | --- | --- |
| Iniciar sesión | /auth/login | Usar routerLink |
| Registrarse como cliente | /auth/registro | Usar routerLink |
| Registrar restaurante/dueño | /auth/registro-dueno | Usar routerLink |
| Navegar a una sección | Ancla existente en la landing | Solo si el diseño presenta ese enlace |
| Empieza con RestoPilot | Pendiente de confirmar | Resolver desde el diseño/prototipo; no elegir un rol por inferencia |

Que una ruta exista no significa que su formulario esté implementado. No anunciar registro o autenticación reales. Si no se puede confirmar el destino del CTA principal, documentar el pendiente antes de habilitar ese enlace.

## Diseño responsive y accesibilidad

Usar la captura desktop de 1280 px y el frame mobile confirmado como referencias. Probar además anchos intermedios; no fijar la página como una imagen ni forzar alturas de captura. Apilar contenido conforme al diseño, ajustar navegación y evitar desbordamiento horizontal.

HTML semántico con header/nav/main/footer, un h1 y jerarquía de títulos. Enlaces y botones con nombre accesible, foco visible, recorrido Tab/Shift+Tab y activación por teclado. Imágenes informativas con texto alternativo; decorativas con alt vacío. Si existe menú móvil, reflejar apertura con aria-expanded y permitir cerrarlo; lo mismo para FAQ según el componente Material usado. Respetar prefers-reduced-motion si hay animaciones.

## Heurísticas aplicadas

| Heurística | Revisión en landing |
| --- | --- |
| H1 Estado visible | Menú o FAQ muestran su estado de apertura cuando existan |
| H2 Lenguaje familiar | Textos de restaurante coherentes con el diseño |
| H3 Control | Poder cerrar menú/FAQ y volver a secciones |
| H4 Consistencia | Mismos CTA, estilos y destinos en desktop/mobile |
| H5 Prevención | Evitar enlaces vacíos o destinos contradictorios |
| H6 Reconocimiento | Navegación y opciones de acceso reconocibles |
| H7 Eficiencia | Anclas y teclado para llegar al contenido |
| H8 Prioridad | Propuesta de valor y CTA legibles sin ruido añadido |
| H9 Recuperación | Evitar navegación rota; registrar limitaciones reales |
| H10 Ayuda | FAQ o ayuda presentes en el diseño, sin inventar políticas |

## Criterios de aceptación de esta entrega

Esta lista es una propuesta de verificación de LP01, no IDs de criterios originales añadidos al reporte.

- [ ] Frame desktop y mobile identificados, capturas y recursos consultados.
- [ ] Composición y textos contrastados con Figma; diferencias justificadas.
- [ ] Ruta `/` muestra la landing en el frontend existente.
- [ ] Enlaces de acceso usan sus rutas confirmadas; CTA principal resuelto con evidencia.
- [ ] Navegación desktop/mobile, menú y FAQ aplicables comprobados.
- [ ] Sin desbordamiento horizontal en móvil ni anchos intermedios probados.
- [ ] Teclado, foco, semántica y nombres accesibles revisados.
- [ ] Sin servicios API, éxitos ficticios ni funcionalidades vecinas implementadas.
- [ ] npm.cmd run check y npm.cmd run build ejecutados con resultados registrados.
- [ ] Evidencia desktop/mobile, limitaciones y revisión de un compañero en el PR.

## Prompt de inicio

«Lee AGENTS.md, SPEC.md y docs/specs/landing/SPEC.md. Implementa únicamente LP01, tareas S2-TSK-003 y S2-TSK-004, como interfaz responsive con navegación local. Primero confirma los frames desktop/mobile y el destino del CTA principal en el Figma indicado. Reutiliza Home y las rutas existentes; explica los archivos que cambiarás. No integres API, no publiques ni implementes otras pantallas. Verifica y registra evidencias y pendientes».

## Entrega

Rama feature/landing desde develop actualizado, previa comprobación de cambios existentes. Commit sugerido: feat(landing): implementa la página pública responsive. PR hacia develop, con S2-TSK-003/004, capturas, rutas comprobadas y resultados. No crear commits ni publicar sin autorización aplicable.

## Nombre y descripción exactos de la primera entrega

- Nombre de la funcionalidad: Landing de RestoPilot.
- Rama: `feature/landing`.
- Título del Pull Request: `feat(landing): implementa la landing responsive de RestoPilot`.
- Mensaje de commit sugerido: `feat(landing): implementa la landing responsive de RestoPilot`.
- Base del Pull Request: `develop`.
- Rama de origen del Pull Request: `feature/landing`.

Descripción para el Pull Request, después de implementar y verificar:

Implementa la landing de RestoPilot en escritorio y móvil según Figma, con Angular Material y navegación a inicio de sesión y registro. Incluye la propuesta de valor, las secciones y las llamadas a la acción del diseño. Corresponde a S2-TSK-003 y S2-TSK-004. Alcance: interfaz y navegación, sin integración con la API.

Añadir a esa descripción únicamente las pruebas realmente ejecutadas y sus resultados, las capturas y los pendientes. Mientras solo existan estos SPEC, no presentar la landing como implementada.
