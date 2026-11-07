# Registro público US01-008 y US21-006

Rama: `feature/public-registration-confirmation`, desde `develop` en `e50a04c`.
Se interpreta la solicitud como las dos tareas pendientes del registro de cliente
y de dueño/restaurante; no como una reasignación de historias o criterios.

## Correcciones

- El signup indica como retorno `/auth/login` del origen actual, sujeto a la lista
  permitida de Supabase. No acepta una redirección arbitraria del formulario.
- La respuesta REST pendiente devuelve el usuario en la raíz. Se admite ese
  formato y el envoltorio del SDK, validando identidad y correo cuando se informa.
  Una respuesta incompleta no se presenta como registro pendiente ni éxito.
- Sin token no se crea sesión ni se consulta el perfil autenticado. Se pide
  confirmar y después iniciar sesión. Se limpia el borrador sensible del dueño.
- El retorno elimina inmediatamente los tokens del fragmento sin almacenarlos
  ni aceptarlos como sesión. El acceso con contraseña verifica el estado real.
- Los enlaces con error/vencimiento tienen un mensaje y recuperación explícitos.
- Se puede solicitar el reenvío con correo y `type:signup`, sin contraseña ni rol,
  con bloqueo durante envío y espera local de un minuto. El mensaje no confirma
  la existencia de una cuenta ni la entrega al buzón.
- Los duplicados explícitos conservan 409. Una respuesta opaca de Supabase no se
  interpreta como cuenta nueva ni se añade una consulta pública de existencia.
- Los errores de proveedor de correo y correo no confirmado se explican sin
  confundirlos con creación exitosa ni credenciales incorrectas.

No se cambia la configuración SMTP, se omite la confirmación ni se incorpora una
clave administrativa al frontend. No se añaden dependencias o sesiones paralelas.

## Verificaciones ejecutadas

- `npm.cmd run check`: aprobado; 120 escenarios y rutas sin duplicados.
- `node --test --test-concurrency=2 scripts/*.test.cjs scripts/*.test.mjs`:
  **280 aprobadas**, 0 fallidas. Nueve regresiones nuevas de registro y retorno.
- `npm.cmd run build`: aprobado.
- `scripts/public-registration-browser.cjs`: **12 escenarios aprobados**, Edge
  headless con HTTP controlado. Cliente, dueño/restaurante en dos pasos,
  confirmación, login posterior por rol, reenvío, duplicados, respuesta incompleta,
  correo rechazado, limpieza del fragmento y enlace vencido. Responsive
  320/390/768/1440, sin desbordamiento horizontal en esos escenarios.

## Prueba real y estado pendiente

El usuario proporcionó un buzón y se utilizaron dos alias de prueba para no
modificar sus cuentas existentes. Las direcciones y contraseñas no se guardan
en este repositorio. Se enviaron los formularios reales del cliente y del dueño
desde `http://localhost:4367`, sin interceptar HTTP.

- Supabase público: email habilitado, altas habilitadas, autoconfirmación desactivada.
- Cliente: signup HTTP 200, usuario pendiente, sin token de sesión.
- Dueño/restaurante: signup HTTP 200 y navegación al acceso con aviso de confirmar.
- Antes de confirmar, ambos accesos respondieron HTTP 400 con
  `email_not_confirmed`; la interfaz mostró el mensaje correcto.
- **Pendiente del usuario:** recepción efectiva en Gmail y clic en ambos enlaces.
- Tras ese paso falta comprobar login real por rol, perfil/local y duplicados
  confirmados sin crear perfiles o restaurantes adicionales.

Se conservan solo en memoria las contraseñas aleatorias de estas dos cuentas QA
para terminar la verificación después del clic del usuario. No se deben pegar
enlaces, tokens ni credenciales en el chat o en evidencias versionadas.

Configurar en Supabase Auth el origen de pruebas y `/auth/login` dentro de las
redirecciones permitidas. El servidor puede usar Site URL como retorno si el
destino solicitado no está permitido; el cliente no puede ampliar esa lista.
No se acredita entrega de correo ni aceptación completa hasta finalizar el
paso manual. No se hicieron commits, push o despliegues con estas correcciones.

## Referencias

- https://supabase.com/docs/reference/javascript/auth-signup
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/debugging/error-codes
