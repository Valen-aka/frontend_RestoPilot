# Voz en dispositivos reales

## Incidencia reabierta — 27/11/2026

La usuaria informó nuevamente «sigue sin escucharse la respuesta». La confirmación del 25/11 se conserva como antecedente, pero no acredita que la lectura funcione actualmente. La reproducción audible y su detención vuelven a quedar **pendientes de validación** con la corrección de `fix/lectura-respuestas`.

Se elige una voz instalada (preferencia por español local), se espera `voiceschanged` si la lista aún está vacía y se reanuda el sintetizador si está pausado. La interfaz muestra preparación hasta recibir `onstart`. Si no aparecen voces o no comienza la lectura, muestra un error y permite reintentar. Un evento `onstart` confirma actividad del motor, no sonido audible en los altavoces.

La página de prueba muestra los nombres e idiomas de las voces disponibles. Para diagnosticar el fallo se necesita registrar la URL probada, el mensaje que aparece tras pulsar Escuchar y si se oye audio. No se atribuye todavía el problema a Windows, a Chrome o al despliegue sin esa evidencia.

Pruebas controladas: `npm run qa:speech` cubre voces tardías/ausentes, selección de idioma disponible, estado pausado, inicio real, falta de inicio, cancelación, eventos obsoletos y errores. Referencia de la API: [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

Validación del 27/11: 11 pruebas unitarias aprobadas, suite del panel aprobada (12 grupos, cinco tamaños) y `npm run verify` correcto. Esto demuestra el manejo de estados y errores en pruebas controladas, no audibilidad. La nueva confirmación física sigue pendiente.

Estado: recorrido confirmado por la usuaria el 25/11/2026 en Windows con Chrome. La confirmación proviene de su prueba manual; no de observación automatizada ni de una grabación. No se registraron versiones exactas del sistema/navegador ni modelo de micrófono/altavoz. Los viewports automatizados no representan pruebas con hardware móvil.

## Preparación

Ejecutar `npm run qa:chat:build`, después `python -m http.server 18085 --bind 127.0.0.1 --directory artifacts/chat-panel-app/browser` y abrir `http://127.0.0.1:18085/?manual` en Chrome. Este modo usa las API reales de voz del navegador; no inyecta las simulaciones de Playwright. La respuesta es fija de prueba, sin cuenta real ni Gemini. Usar una frase de prueba sin datos personales.

## Recorrido y evidencia

Registrar fecha, versión de Windows y Chrome, micrófono/altavoz utilizados, resultado y observaciones. Marcar cada caso solo después de ejecutarlo.

| Caso | Resultado esperado | Estado |
| --- | --- | --- |
| Permitir micrófono y dictar «Quiero opciones vegetarianas» | Aparece el texto reconocido y no se envía automáticamente | Confirmado por la usuaria |
| Detener dictado y editar | El campo vuelve a ser editable; permite corregir antes de enviar | Confirmado por la usuaria |
| Enviar el texto editado | Se muestra exactamente lo enviado y una respuesta fija | Confirmado por la usuaria |
| Escuchar respuesta | Se oye la respuesta por el dispositivo seleccionado | Confirmado por la usuaria |
| Detener lectura | El audio se detiene al pulsar el control | Confirmado por la usuaria |
| Cerrar durante dictado y durante lectura | Se detienen micrófono y audio | Confirmado por la usuaria |
| Denegar micrófono y volver a escribir | Error comprensible y envío escrito disponible | Confirmado por la usuaria |
| Cambiar de Voz a Chat durante dictado | Se detiene el micrófono y se conserva el borrador | Confirmado por la usuaria |

Las autorizaciones del micrófono se gestionan en Chrome para la dirección local. Registrar un fallo real y sus pasos antes de cambiar permisos; no sustituirlo por un resultado de la simulación. Los ocho casos de esta tabla fueron confirmados en Windows con Chrome. Esto no certifica hardware móvil, otros navegadores, backend real ni equivalencia visual con Figma.
