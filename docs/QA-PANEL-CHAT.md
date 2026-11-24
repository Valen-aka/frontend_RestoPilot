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

