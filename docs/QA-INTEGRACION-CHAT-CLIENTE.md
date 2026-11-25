# Integración del chat del cliente

La rama `feature/integracion-chat-cliente` conecta el panel a `POST {assistantApiUrl}/cliente/chat`. Envía únicamente `{ mensaje, restauranteId }`, con el token vigente de `API_SESSION` en `Authorization: Bearer`. Requiere sesión CLIENTE activa, mensaje de 1 a 2000 caracteres después de recortar espacios y permite restaurante omitido o nulo para consultas personales. Si se proporciona un identificador, debe ser positivo.

El servicio valida `ANSWER`, `CLARIFICATION_REQUIRED` y `NO_DATA`, un mensaje no vacío y `pedidoId` positivo cuando existe. Conserva ese identificador para la tarea de enlace a pedidos; esta entrega no implementa el enlace. Los errores HTTP o respuestas inválidas se muestran sin detalles internos y recuperan el borrador si el usuario no escribió otro texto.

Cambiar de restaurante cancela la consulta pendiente, vacía conversación y borrador y detiene la voz. Cambiar la sesión limpia también la selección y cierra el panel. Cerrar y volver a abrir el panel conserva el contexto actual. Las sugerencias preparan el texto, sin enviarlo automáticamente.

## Verificación reproducible

Ejecutar `npm ci` y `npm run verify` con una versión Node admitida por `package.json`. Para las pruebas de navegador, instalar Playwright en un directorio de herramientas separado y definir `PLAYWRIGHT_MODULE` con su ruta; `BROWSER_EXECUTABLE` permite indicar Chrome o Chromium. No se añade una dependencia de ejecución al producto.

```powershell
node node_modules/@angular/cli/bin/ng.js build --configuration development --browser scripts/fixtures/client-chat.ts --ts-config scripts/fixtures/tsconfig.client-chat.json --output-path artifacts/client-chat-app
node scripts/client-chat.test.cjs
node node_modules/@angular/cli/bin/ng.js build --configuration development --browser scripts/fixtures/chat-panel.ts --ts-config scripts/fixtures/tsconfig.chat-panel.json --output-path artifacts/chat-panel-app
node scripts/chat-panel.test.cjs
```

Resultados del 24 de noviembre de 2026: estructura y compilación de producción correctas; ambas suites correctas. La integración comprueba selección obligatoria, exclusión de restaurantes inactivos, cuerpo y cabecera HTTP, estados del contrato, conservación de pedidoId, siete códigos de error, seis respuestas inválidas, cambio de restaurante, renovación/cierre de sesión y siete solicitudes inválidas sin HTTP. La regresión del panel cubre dictado/lectura simulados, foco, reintento, borrador y cinco tamaños de pantalla.

## Dependencias y límites

Las pruebas usan el backend HTTP de pruebas de Angular y sesiones ficticias, nunca credenciales reales. No prueban conectividad de red con Spring, autenticación real ni respuestas de Gemini. Para la aceptación de extremo a extremo se necesita un backend accesible con IA configurada, un usuario CLIENTE y un catálogo activo. Configurar `assistantApiUrl` para ese entorno; el proxy existente `proxy.assistant.json` dirige `/api/ia/**` a `http://127.0.0.1:18084` cuando se utiliza en el servidor de desarrollo.

El endpoint y contrato están disponibles en `develop` del backend. El PR backend #44 de información alimentaria incompleta mantiene ese contrato: su integración no bloquea este frontend, pero debe incorporarse para validar ese comportamiento alimentario junto con el chat. La integración administrativa y el enlace «Ver pedido» siguen siendo tareas separadas del equipo.
