# Voz en dispositivos reales

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
