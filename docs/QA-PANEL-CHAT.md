# Panel reutilizable de chat

## Corrección de QA — 25/11/2026

Revisión en `fix/qa-panel-chat`, desde `develop` 0c1d52e. Se reprodujo el fallo original en `assert(await send.isDisabled())` después del resultado de dictado (línea 58 en esa revisión). Las lecturas inmediatas del DOM podían adelantarse a la actualización de Angular. Se sustituyeron por aserciones Playwright que esperan valores, disponibilidad, edición, foco y aparición/desaparición de controles. No se introducen pausas fijas ni reintentos que oculten ejecuciones fallidas.

También se actualizan el selector contextual, el título de bienvenida y el modo sin voz para la interfaz vigente. Según `QA-CHAT-CONTEXTO.md`, el campo permanece vacío tras un error HTTP: el recorrido vuelve a escribir antes de reintentar. Esta corrección no cambia código de producción ni el diseño. Las descripciones de la implementación inicial más abajo son históricas y no sustituyen este comportamiento vigente.

La prueba registra errores de página de ambos contextos, comprueba las solicitudes HTTP pendientes, espera que las imágenes carguen y verifica el ancho antes de medir cinco viewports. La fixture usa una sesión ficticia de una hora para evitar expiraciones accidentales en pruebas lentas. El ejecutor repetido crea un navegador nuevo por vuelta, alterna CPU normal/x4 y se detiene al primer fallo; conserva resultados y captura del fallo por ejecución.

Resultado: `npm run verify` correcto y cinco vueltas consecutivas aprobadas, con 12 grupos de comprobaciones por vuelta. CPU: 1, 4, 1, 4 y 1. Evidencia local: `artifacts/chat-panel-repeated/2026-11-26T02-14-03-610Z/summary.json` (marca UTC, correspondiente al 25/11 en Lima). Los fallos de las ejecuciones de diagnóstico anteriores se conservaron en sus carpetas; no se contabilizan como vueltas aprobadas.

```powershell
npm run qa:chat:build
npm run qa:chat
npm run qa:chat:repeat
npm run verify
```

Se requiere Playwright con sus aserciones de `playwright/test`, disponible mediante `PLAYWRIGHT_MODULE`; no se agregan dependencias de producción. `BROWSER_EXECUTABLE` selecciona Chrome/Chromium. `CHAT_PANEL_RUNS` permite de 1 a 20 vueltas (5 por defecto). Para una sola ejecución, `CHAT_PANEL_CPU_RATE` acepta 1 a 8 y `CHAT_PANEL_OUTPUT` selecciona la carpeta de evidencia. El resumen de repeticiones se guarda bajo `artifacts/chat-panel-repeated/<fecha>/summary.json`.

La voz real en Windows con Chrome fue confirmada por la usuaria: dictado, edición, envío manual, reproducción, detención, cierre, cambio de modo y denegación del permiso. Detalles y alcance en [QA de dispositivos](QA-VOZ-DISPOSITIVOS.md). Los cinco tamaños automatizados no constituyen una prueba física en Android/iOS. No se volvió a comparar Figma porque esta entrega corrige QA sin cambios visuales.

Implementación de S3-TSK-005 en `feature/panel-chat`, basada en `develop` (8c26551). Fecha: 23/11/2026, Lima.

## Alcance

`ChatPanel` contiene conversación, composición, estados y voz. No inyecta HTTP, sesión, catálogo ni router. `AssistantChat` reutiliza el panel y conserva su transporte y selección de restaurante existentes. Esta entrega no certifica la integración real de S3-TSK-012 ni implementa recomendaciones o reglas alimentarias.

Se conserva la presentación de datos de reportes que ya tenía el chat. No se incorporan indicadores ni endpoints nuevos.

## Contrato para reutilizar

Importar `ChatPanel` desde `src/app/components/chat-panel/chat-panel.ts` y los tipos `ChatMessage` y `ChatReply` desde `chat-message.model.ts` en esa carpeta.

| Entrada / salida | Uso |
| --- | --- |
| `title`, `greeting` | Título y bienvenida del contexto |
| `welcomeTitle`, `suggestions` | Encabezado de bienvenida y preguntas que se copian al borrador sin enviarse |
| `messages` | Lista inmutable de mensajes del usuario o respuestas del asistente |
| `busy` | Consulta pendiente; impide otro envío y un nuevo dictado |
| `error` | Mensaje de error del contenedor, anunciado como alerta |
| `draft` | `FormControl<string>` opcional; permite conservar/restaurar el borrador desde el contenedor |
| `messageSent` | Emite el texto recortado, entre 1 y 2000 caracteres; el contenedor realiza la consulta |
| `closed` | Solicita al contenedor ocultar el panel |
| `resetRequested` | Solicita limpiar mensajes y errores; el panel limpia voz y borrador. Se bloquea durante una consulta |
| `[chat-context]` | Contenido proyectado para selección o identificación del restaurante |

El contenedor define el ancho, alto y posición. El panel llena ese espacio; no se fija por sí mismo a la ventana. Los títulos y ayudas usan identificadores por instancia.

Al enviar, el panel limpia su borrador. El contenedor puede compartir el control para restaurar el mensaje si falla la consulta. `AssistantChat` ya realiza esa recuperación sin sobrescribir un nuevo borrador. `ANSWER`, `CLARIFICATION_REQUIRED` y `NO_DATA` conservan el contrato existente; los dos últimos incluyen una etiqueta textual visible.

El dictado no envía automáticamente: al terminar permite corregir el texto y pulsar Enviar. Mientras escucha, el campo es de solo lectura para evitar que un resultado tardío reemplace una edición. La lectura ofrece Detener lectura. Cerrar o destruir el panel libera reconocimiento y síntesis. Si el navegador no admite voz, el envío escrito permanece disponible y se explica la limitación.

## Verificación ejecutada

- `npm.cmd run verify`: estructura y compilación de producción.
- Prueba de navegador con el componente Angular real y su contenedor: `scripts/chat-panel.test.cjs`.
- Dictado controlado, edición previa al envío, bloqueo de envío durante carga, estados de aclaración/sin datos/error, rechazo del micrófono, lectura y detención, Escape y liberación del audio.
- Contenedor existente: apertura y foco, posición móvil, respuesta HTTP controlada, restauración del mensaje tras un 503 y conservación del borrador al cerrar/reabrir.
- Navegador sin capacidades de voz: mensaje explicativo y envío escrito funcional.
- Anchos/altos: 1440×900, 768×900, 390×844, 320×640 y 640×320; textos largos sin desbordamiento horizontal. Capturas locales en `artifacts/chat-panel/`; inspección visual de escritorio, móvil de 320 px y contenedor móvil.
- `git diff --check`.

La fixture se compila por separado: no forma parte del punto de entrada de producción. Sus respuestas, reconocimiento y sesión son exclusivamente de prueba; no usa credenciales reales ni se conecta al backend.

Para repetir (Playwright debe estar disponible mediante `PLAYWRIGHT_MODULE` o instalado en el entorno de QA):

```powershell
node node_modules/@angular/cli/bin/ng.js build --configuration development --browser scripts/fixtures/chat-panel.ts --ts-config scripts/fixtures/tsconfig.chat-panel.json --output-path artifacts/chat-panel-app
node scripts/chat-panel.test.cjs
npm.cmd run verify
```

`BROWSER_EXECUTABLE` permite elegir el ejecutable de Chromium/Chrome. La prueba inicia y detiene su servidor HTTP local automáticamente.

## Límites de aceptación

El usuario proporcionó posteriormente [RestoPilot (copia)](https://www.figma.com/design/6dDJNh7MMb3pU1UbL8sb2r/RestoPilot--copia-?node-id=5-124) como referencia para esta tarea. Se consultó mediante el plugin de Figma: el nodo 5:124 corresponde a Style; los paneles de cliente verificados son [escritorio 84:26533](https://www.figma.com/design/6dDJNh7MMb3pU1UbL8sb2r/RestoPilot--copia-?node-id=84-26533) y [móvil 84:26627](https://www.figma.com/design/6dDJNh7MMb3pU1UbL8sb2r/RestoPilot--copia-?node-id=84-26627). Esta autorización se limita a la tarea actual y no redefine la fuente del resto del proyecto.

Se adaptaron cabecera clara, bienvenida central, símbolo textual ✦, consultas sugeridas, Nueva consulta y borde del compositor. El símbolo del diseño es texto, no una imagen descargada; estos nodos no requieren nuevos assets. Se conservan los recursos locales de cierre, voz y envío, los controles Material, los tokens compartidos y tamaños legibles. Los identificadores US03 y los avisos de datos ficticios del prototipo no se trasladan al producto. Las sugerencias actuales reflejan las consultas que admite el backend; las alimentarias se habilitarán con las tareas correspondientes.

El chat continúa como panel flotante reutilizable: la página completa del mockup, su columna lateral y navegación no se implementaron. La voz y el cierre son ampliaciones funcionales del panel que no aparecen en esos frames. No se afirma equivalencia pixel a pixel con la página completa. Se verificaron las capturas de bienvenida en escritorio y el contenedor móvil, además de sugerencias sin envío, reinicio y desplazamiento al inicio.

Falta comprobar reconocimiento y reproducción físicos, permisos reales del micrófono y comportamiento del teclado virtual en los dispositivos objetivo. Las pruebas controladas no certifican Gemini ni autenticación o datos del servidor real.

No se requiere que otro integrante termine para revisar este panel. La aceptación integrada del asistente depende del contrato y servicio de backend, y corresponde a la tarea de conexión.
