# Corrección de contratos Supabase — 6 de noviembre de 2026

Rama: fix/supabase-contratos. Alcance exclusivo: funciones de Supabase y pruebas de conexión. No se modificaron componentes, estilos, rutas ni tareas funcionales de los integrantes.

## Causa y solución

El estado de atención respondía con reservasActivas y Angular exige reservasActivasPendientes. La disponibilidad respondía con id y Angular exige mesaId. Aunque HTTP devolvía 200, sus validadores rechazaban las respuestas.

La migración 006_contratos_reservas.sql sustituye esos nombres en rp_module y rp_reservations. Se conservaron el cálculo del contador, las reglas temporales, el aislamiento, las operaciones y los permisos privados. Se aplicó al proyecto actual después de contrastar las funciones remotas con la versión conocida y guardar sus definiciones previas fuera del repositorio. Para una nueva instalación ejecutar las migraciones 001–006 en orden; no volver a aplicar 004 después de 006.

## Verificación ejecutada

- 15 consultas reales comparadas con los validadores Angular: todas aprobadas. Antes fallaban estado de cliente, estado de operación y disponibilidad.
- 21 escenarios reales con restaurante y usuarios temporales separados: estados de atención para ambos roles, modalidades, importes, restricciones, reservas, concurrencia y expiración. Incluye disponibilidad de una mesa expirada con el nombre mesaId. Datos QA retirados al terminar.
- 5 comprobaciones en navegador: panel administrativo con contador, cliente con reservas habilitadas, guard que permite entrar a búsqueda, disponibilidad desde reserva expirada y ausencia de errores JavaScript/escrituras de negocio. Capturas desktop/mobile inspeccionadas. La revisión visual no registra reservas, pagos ni cambios de atención.
- npm run check aprobado y 271 pruebas unitarias aprobadas, cero fallos. No se recompiló Angular en esta corrección porque no cambió su código ni configuración.
- Inventario final: siete cuentas originales, siete usuarios Auth, cero cuentas QA pendientes; funciones privadas sin acceso directo para anon/authenticated. Trabajo de expiración con última ejecución satisfactoria.

Resultados sanitizados y capturas en [evidencias/supabase-contratos](evidencias/supabase-contratos).

## Repetir

scripts/supabase-contratos-live.cjs consulta sin escrituras de negocio y valida usando los mismos lectores de Angular. Necesita RP_QA_ACCESS_FILE con un archivo privado de cuentas {correo,password,rol}, CLIENTE y DUENO con datos de prueba; usa URL y clave publicable del environment. RP_QA_OUTPUT permite cambiar el destino artifacts/supabase-contratos. Devuelve error si alguna comprobación falla.

scripts/supabase-live-api.cjs conserva su configuración administrativa privada y los datos aislados de QA. Ahora también valida los contratos de atención y disponibilidad de Angular, evitando aceptar respuestas que solo sean HTTP 200.

## Límites

Esta corrección no completa el registro con correo confirmado, los pendientes de selección/formularios de Cristian ni las pruebas antiguas de navegador que todavía interceptan /api. Tampoco publica la web ni modifica la configuración de correo. El cierre de cada tarea requiere comprobar su recorrido completo; arreglar el contrato compartido no convierte automáticamente otras historias en Done.
