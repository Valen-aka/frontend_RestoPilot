# Frontend conectado al backend con Supabase

05/11/2026. La conexión sigue este recorrido:

`Angular → http://localhost:8081/api → Spring Boot/JWT → PostgreSQL de Supabase`

## Configuración

`src/environments/environment.ts` y `environment.development.ts` ya apuntan a `http://localhost:8081/api`; no requieren una URL de Supabase. AuthService, los servicios HTTP y el interceptor JWT existentes se reutilizan sin duplicarlos.

La conexión a Supabase se configura únicamente en el `.env` local del backend con el perfil `supabase`. Sus tablas están en el esquema `restopilot`. Los detalles de JDBC, SSL y SQL están en `docs/SUPABASE.md` del repositorio del backend. Las claves de Supabase y la contraseña de PostgreSQL no se incorporan a Angular.

Después de cambiar el `.env`, reiniciar RestoPilotApplication en IntelliJ. El frontend se inicia desde su proyecto habitual en Visual Studio Code. La API debe estar funcionando en 8081.

## Evidencia real ejecutada

Se verificó la instancia de IntelliJ en 8081, conectada al PostgreSQL remoto:

- 17 comprobaciones HTTP correctas: acceso por los tres roles, separación entre cuentas, carta, pedidos propios, pago, cocina, reservas, expiración y mesa disponible.
- 22 comprobaciones de navegador a 390 y 1440: carrito con selección real (lecturas), listado, detalle y total histórico, actualización de seguimiento, consulta de pago, historial, expirada/disponibilidad, completada, cola/tablero, reservas administrativas y categorías.
- La ejecución final no simuló respuestas ni cambió el puerto de las solicitudes: Angular utilizó su apiUrl actual de 8081.
- Se usaron exclusivamente cuentas de demostración; las credenciales quedaron fuera de Git. Las pruebas no registraron pedidos ni avanzaron estados.

La sesión del navegador se obtuvo llamando al AuthService real desde el harness de desarrollo. Esto no implementa el formulario de acceso pendiente ni la carta que aún no está integrada en esta rama. Cada mantenedor debe conectar esas interfaces a los servicios compartidos; no crear otro interceptor, sesión o cliente de Supabase para ocultar la dependencia.

La evidencia complementa las pruebas aisladas anteriores. No implica que los formularios de vista previa ni las tareas pendientes del equipo estén terminados. Tampoco publica la API: en un despliegue futuro, apiUrl utilizará la URL pública de Spring Boot.
