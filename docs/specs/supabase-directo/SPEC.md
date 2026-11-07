# Conexión directa con Supabase

Solicitud del 06/11/2026: sustituir la dependencia de Spring Boot local para todas las operaciones implementadas, migrar todas las cuentas registradas a Supabase Auth y renovar sus contraseñas. Rama feature/supabase-directo. Sin cambiar roles, identidades históricas ni relaciones.

## Arquitectura y contrato

- Angular utiliza Supabase Auth para acceso por correo y contraseña. Solo publica URL y clave publishable; ninguna clave administrativa o conexión PostgreSQL se incorpora al frontend.
- Se conserva API_SESSION y la navegación por rol. El UUID de Auth se vincula de forma única con el ID numérico existente de usuarios. Los permisos se consultan en el servidor; los metadatos editables por el usuario no conceden roles ni acceso a restaurantes.
- El resto de servicios conserva sus DTO. Un transporte común convierte sus operaciones en llamadas RPC HTTPS a Supabase. No vuelve a localhost al fallar Supabase.
- Las tablas de negocio permanecen privadas. Funciones transaccionales con identidad auth.uid(), autorización y search_path fijo ejecutan carta/categorías, mesas, pedidos, cocina, pagos, reservas, atención, disponibilidad, historial, notificaciones y reportes.
- Se mantienen precios históricos, cálculo de totales en servidor, aislamiento por cuenta/restaurante, transiciones, restricciones por pago, bloqueos de mesas y conflictos de disponibilidad. La expiración se ejecuta en servidor, incluso sin navegador abierto.
- Registro público crea cliente; registro de dueño crea un restaurante nuevo con su cuenta de forma atómica. La creación de administradores exige dueño del restaurante. Se respetará la confirmación de correo configurada en Supabase para registros públicos y se explicará en la UI cuando sea necesaria.
- Las siete cuentas ya existentes se crean por administración, confirmadas, vinculadas con sus mismos perfiles; cada una recibe una contraseña aleatoria distinta. Se conserva un respaldo privado previo y se verifica el acceso real de cada cuenta. No se anuncian credenciales como activas si no se confirmaron.
- El archivo de contraseñas y el registro de migración quedan fuera de Git; el repositorio contiene únicamente migraciones reproducibles sin secretos y evidencia sanitizada.

## Validación requerida

Compilación, contratos de frontend, autorización anónima/cliente/administrador/dueño, aislamiento de restaurantes/cuentas, rechazo de escalada de rol, operaciones transaccionales, concurrencia, totales y pagos, disponibilidad y expiración. Pruebas reales en Supabase con registros de QA identificados y limpieza de esos registros. Recorridos de navegador sin backend local y sin peticiones a localhost:8081. IA conserva su alcance previo y no recibe claves de proveedor en el navegador.

## Referencias

- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/vault
- https://supabase.com/docs/reference/javascript/auth-admin-createuser

Este SPEC define requisitos; no acredita una implementación o migración terminada.


## Ejecución y evidencia

Implementación y migración aplicadas; consultar [guía](../../GUIA-SUPABASE-DIRECTO.md) y [QA](../../QA-SUPABASE-DIRECTO.md). El alcance final es la conexión común. No incluye completar los formularios administrativos de pagos, ajuste/cancelación ni notificaciones; esas pantallas conservan su implementación previa para futuras ramas. Las altas públicas requieren confirmar correo; no se comprobó entrega a buzones externos. IA y despliegue público quedan fuera de esta ejecución.
