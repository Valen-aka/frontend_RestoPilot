# S3-TSK-014: restaurante activo

El chat administrativo reutiliza WorkspaceContext y API_SESSION. Muestra el nombre del restaurante, envia su ID autenticado y bloquea consultas hasta verificarlo. Hay recuperacion de errores de carga y limpieza por cambio de sesion. El backend conserva la autorizacion definitiva.

La regresion administrativa comprueba nombre/ID y POST autenticado. Registrar solo las pruebas realmente ejecutadas.

Ejecucion terminada: npm run verify aprobado; fixture administrativa compilada y scripts/admin-chat.test.cjs ejecutado con Edge headless. Cinco recorridos aprobados: PLATOS, PAGOS, ATENCIONES, DEMANDA y dictado editable/sin datos. Se comprobo nombre de restaurante, ID 21 y autorizacion enviada. Anchos 1440x900 y 390x844. No se controlo la pantalla del usuario.
