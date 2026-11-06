# US27 — verificación de atención física

Rama: feature/operacion-atencion-fisica. SPEC: [US27](specs/us27/SPEC.md). Tareas S2-TSK-019 y S2-TSK-020.

## Resultado

- Checker y build de producción correctos (NG_BUILD_SASS_EMBEDDED=0 en este equipo). Las 191 pruebas existentes pasaron.
- 24 comprobaciones HTTP controladas aprobadas: consulta propia, contador, confirmación/cancelación y Escape/foco, habilitar/pausar, consulta fallida, 403, identidad incorrecta, resultados inciertos, cambio confirmado con lectura fallida, envío duplicado/salida, permisos del cliente, acceso a reservas y SALÓN. Incluye pausa entre selección y confirmación: no se envía POST del pedido.
- Control, confirmación y estado del cliente comprobados a 320/390/768/1440 px sin desbordamiento global. Se inspeccionaron capturas de módulo a 390 y diálogo a 320 px.
- 10 recorridos de regresión de US11 aprobaron con su simulación Postman versionada (SALÓN, LLEVAR, RECOGER, DELIVERY, doble envío, rechazos, resultados inciertos y sesión).
- 19 recorridos de regresión de US26 aprobaron con su simulación versionada. Se corrigió su harness para dirigir las solicitudes HTTP a RP_MOCK_URL, igual que US11, evitando enviar el login sintético al backend real.
- 13 comprobaciones reales de Angular → backend temporal 8082 → Supabase: estado propio, Escape sin escritura, pausa persistida, reservas previas con idénticos IDs/estados, cliente bloqueado incluso por URL directa al plano, SALÓN deshabilitado sin vaciar carrito, llevar seleccionable, habilitación persistida y recuperación del cliente. La configuración original del local demo quedó restaurada. No se registraron pedidos ni se cancelaron reservas.

Los cambios conservan el restaurante de la sesión en la operación administrativa; PATCH no envía IDs elegidos por el navegador. Después de guardar se consulta el estado real. Los resultados inciertos bloquean reenvío hasta reconsultar. El historial administrativo tiene acceso a Configurar atención física y el historial cliente a Nueva reserva.

## Límites y coordinación

Las entradas de nuevas reservas comprueban atención física y preservan restauranteId entre los pasos existentes. La búsqueda, selección y registro de US05/US06 siguen siendo tareas de integración independientes; superar la entrada no las convierte en operaciones API terminadas. La interfaz de mesas de US16 sigue pendiente; el backend ya rechaza crear mesas al pausar la atención física. Los PR pendientes de US10/US14 no se incorporaron en esta rama.

Las pruebas reales obtuvieron la sesión mediante AuthService en un harness de desarrollo: no implementan el formulario de acceso de US02. La comparación visual usa la copia Figma indicada por el usuario; no certifica paridad exacta de píxeles. El aviso NG0913 del logo de US11 preexistente se observó como advertencia de rendimiento y no es un error funcional nuevo.

## Reproducción

Con Angular en desarrollo y Playwright disponible:

~~~powershell
$env:RP_QA_URL='http://127.0.0.1:4352'
# PLAYWRIGHT_MODULE puede apuntar al módulo instalado fuera del repositorio.
node scripts/us27-api-browser.cjs
~~~

El guion intercepta las rutas /api y no usa credenciales ni modifica la API real. RP_QA_OUTPUT cambia la carpeta predeterminada artifacts/us27. Para US11, iniciar postman/simulations/us11.sim.yaml y ejecutar scripts/us11-api-browser.cjs con RP_MOCK_URL y RP_QA_URL. Evidencias sanitizadas: [resultado](evidencias/us27/resultado.json).
