# Correcciones del chat cliente

Rama en frontend y backend: `fix/chat-cliente-contexto`, desde sus respectivos `origin/develop`.

## Contrato

`POST /api/ia/cliente/chat` mantiene `mensaje` y `restauranteId` opcional/nulo. La identidad procede de la sesion autenticada. Las consultas personales no necesitan restaurante; las herramientas del local siguen requiriendolo. No se incorporan herramientas de infraestructura ni cambios de permisos.

El frontend muestra un selector dentro de la conversacion ante una aclaracion que solicita restaurante. Conserva la pregunta y la vuelve a enviar al elegir un local activo. La seleccion por nombre solo se aplica cuando hay una coincidencia unica; los nombres ambiguos se muestran como opciones. Los mensajes anteriores permanecen visibles. Cambiar de cuenta o cerrar sesion sigue limpiando el contexto.

## Interfaz

Panel ampliado en escritorio; contexto compacto en cabecera y selector en la conversacion. En pantallas de hasta 600 px ocupa el viewport completo. Enter envia; Shift+Enter permite saltos de linea y no se envia durante composicion IME.

## Verificacion

- `npm.cmd run verify`: chequeo estructural y compilacion.
- Backend: `AgenteClienteContextoTest` y `AgenteIAHttpIntegrationTest`, con H2 y proveedor IA controlado; no llaman a Gemini ni a Supabase real.
- Se actualiza `scripts/client-chat.test.cjs` para el selector contextual y la consulta sin restaurante. La suite de navegador no se ejecuto en esta revision.
- No se afirma validacion visual en dispositivos reales ni equivalencia con Figma. La captura del usuario es la referencia de esta correccion.

## Recorrido manual pendiente

1. Sin restaurante: saludar y consultar el ultimo pedido y reserva.
2. Pedir carta: elegir local desde el mensaje y comprobar que se retoma la consulta.
3. Repetir escribiendo un nombre completo, uno parcial unico y uno ambiguo.
4. Buscar un nombre inexistente y recuperar la busqueda; volver a Mi cuenta.
5. Revisar bienvenida, teclado y scroll a 1440x900, 390x844 y 320x640.
6. Cambiar de cuenta y verificar que no se conserva historial ni seleccion.

Estos cambios no estan desplegados.

## Barra de texto y voz

Pestanas Chat/Voz con botones Material y estado accesible. Chat muestra el campo compacto con envio al extremo; Voz muestra un control de dictado separado y permite revisar el texto antes de enviarlo. Cambiar de modo detiene microfono y lectura y conserva el borrador. La lectura de respuestas se ofrece en Voz. No hay escucha ni envio automaticos.

Se recuperan flotacion de la mascota, gesto al pasar el puntero y entrada del panel. Las animaciones respetan movimiento reducido. Se adapta la suite de navegador al nuevo acceso al dictado; no se afirma su ejecucion.

Los controles Chat/Voz y restaurante comparten ahora una sola fila compacta. El nombre largo del local se abrevia visualmente; su texto completo permanece en el titulo del boton. Se conservan areas interactivas de 44 px.

Correccion de prueba local: Spring debe activar supabase,supabase-api para aceptar JWT de Supabase, con SUPABASE_AUTH_ISSUER y SUPABASE_PUBLISHABLE_KEY del mismo proyecto. Se comprobo por HTTP con una sesion real de cliente: saludo, ultima reserva y ultimo pedido devolvieron 200/ANSWER sin restaurante. El campo permanece vacio despues de errores y el foco se indica mediante el contorno redondeado de Material, sin un segundo rectangulo interior.

Recomendaciones: el backend presenta hasta tres platos evaluados como compatibles, con precio registrado e ingredientes en parrafos. Se omite el inventario de descartados; si faltan datos se propone revisar un plato concreto o consultar al restaurante. Se conserva la advertencia sobre trazas. Pruebas backend: 38 aprobadas (RecomendacionesAlimentariasTest, RecomendacionesIncompletasTest, EvaluadorAlimentarioTest y AgenteIAHttpIntegrationTest). Este cambio no incorpora memoria conversacional.

Solicitudes explicitas de datos de otros clientes o revelacion de claves se resuelven antes de invocar el proveedor. Se agregan respuestas de privacidad/seguridad con alternativas y directrices de clasificacion. La deteccion de frases mejora la respuesta, no sustituye permisos ni aislamiento por usuario. Pruebas: 16 aprobadas (AgenteClienteContextoTest y AgenteIAHttpIntegrationTest), con verificacion de ausencia de llamadas al modelo/repositorios para los casos rechazados.
