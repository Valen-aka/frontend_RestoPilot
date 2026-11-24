# Panel reutilizable de chat

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
