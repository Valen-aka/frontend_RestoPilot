# QA de Supabase directo — 6 de noviembre de 2026

## Resultado ejecutado

- npm run verify: estructura y build de producción correctos.
- node --test scripts/*.test.cjs/scripts/*.test.mjs: 239 pruebas aprobadas, cero fallos.
- npm run build:publish: compilación publicable correcta con el transporte Supabase.
- Siete cuentas existentes: inicio de sesión real desde formularios de navegador, roles y consultas propias; cero llamadas a la API localhost:8081.
- 20 escenarios reales de API: alta y perfiles atómicos, administrador creado desde Vault, aislamiento de cuentas/restaurantes y rechazo de escalada por metadatos; cuatro modalidades, totales, snapshots, notas, disponibilidad y pausa; cocina, pagos, reservas, finalización, expiración y reportes.
- Las pruebas adicionales de formularios de gestión se realizaron durante la exploración, pero sus cambios se retiraron al acotar esta rama. No constituyen validación de las pantallas vigentes.
- Concurrencia real: mesas y estados, reservas y pagos sin duplicaciones. Una llegada que espera un bloqueo vuelve a comprobar la tolerancia; el rechazo conserva la expiración.
- Cierre de sesión: RPC rechaza la sesión invalidada. Trabajo de expiración: última ejecución succeeded.
- Se eliminaron únicamente las cuentas y registros temporales de QA. Permanecen siete usuarios originales vinculados y siete usuarios Auth, sin cuentas QA pendientes.

## Evidencias

Resultados sin tokens, claves ni contraseñas en [evidencias/supabase-directo](evidencias/supabase-directo). Las horas JSON están en UTC; la ejecución corresponde a la noche del 6 de noviembre en Lima.

## Repetir pruebas reales

El script scripts/supabase-live-api.cjs crea datos separados de QA y los retira al terminar. Requiere PostgreSQL psql, acceso administrativo y red. PSQL_BINARY permite indicar psql.

Configurar RP_QA_ADMIN_CONFIG con la ruta de un archivo privado fuera de Git. Su estructura es {url, publishableKey, secretKey, database:{host,port,database,user,password}}. Los valores administrativos son exclusivos del ejecutor local de QA, nunca de environments ni del navegador. Ejecutar node scripts/supabase-live-api.cjs. Los resultados y capturas se generan en artifacts/, excluido de Git. Si se interrumpe el proceso por completo, revisar los registros QA antes de repetir.

## Límites

No se publicó una nueva web. No se probó la entrega de confirmación a un buzón externo ni el dominio definitivo de redirección. No se implementó IA ni una pasarela de cobro: el pago administrativo registra un cobro ya recibido. Estos resultados no sustituyen la aceptación de cada tarea del sprint ni una revisión exhaustiva de las 120 variantes del inventario.

## Alcance corregido

Se retiraron los cambios de pantallas, guardas de operaciones e inventario añadidos durante esta tarea. Permanecen la conexión, autenticación, configuración, funciones SQL y pruebas de infraestructura. Las historias pendientes se implementarán en sus propias ramas. No declarar toda la aplicación funcionalmente terminada por esta migración.
