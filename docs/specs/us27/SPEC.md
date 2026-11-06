# US27 — Configuración de atención física y reservas

Rama: `feature/operacion-atencion-fisica`. Alcance: S2-TSK-019 y S2-TSK-020. No incorpora los PR pendientes de US10 o US14. Como dueño/administrador, quiero habilitar o pausar la atención física de mi local para controlar nuevas reservas, mesas y pedidos SALÓN sin cancelar las reservas previas.

## Contrato existente

Reutilizar ReservaService, AuthService/API_SESSION e interceptor. GET `/reservas/modulo/estado` consulta el local del gestor. PATCH al mismo endpoint recibe exclusivamente `{habilitado:boolean}`; no acepta un restaurante elegido por el navegador. GET `/reservas/modulo/estado/restaurante/{id}` permite consultar el estado de un local específico desde el cliente.

Respuesta: `restauranteId`, `restauranteNombre`, `habilitado`, `reservasActivasPendientes`, `mensaje`. Validar identidad, tipos y contador entero no negativo. La cuenta corresponde a la definición del servidor; no sumar ni inferir estados en el navegador. Campos de transporte y autorización permanecen en el backend.

## Operación

- Mantener `/operacion/atencion` y `/operacion/atencion/confirmar`, sus componentes y el diálogo existente. Mostrar estado real, nombre del restaurante y reservas vigentes informadas, carga, errores y actualización.
- Habilitar mediante acción explícita. Deshabilitar abre confirmación Material con sus consecuencias y cantidad de reservas previas. Cancelar/Escape no envía PATCH y devuelve el foco al control pertinente. Entrar directamente a confirmar nunca ejecuta una escritura automáticamente.
- Bloquear envíos repetidos y salida durante una escritura. No actualizar el estado antes de la respuesta. Tras PATCH, consultar de nuevo para mostrar el estado actual y su contador.
- Si el resultado de una escritura es incierto (red/5xx/contrato), bloquear reenvío hasta consultar al servidor. Si el cambio se confirmó pero falla la lectura posterior, explicarlo y pedir reconsulta; no repetir PATCH.
- Cambiar sesión/local limpia los datos y descarta respuestas anteriores. Un cliente no puede consultar ni modificar la configuración propia de gestión.

## Efectos en cliente y otras tareas

La vista `cliente-reservas-deshabilitadas` consulta la API: no fuerza una pausa por `vista`. Permite elegir local, reconsultar, volver al historial o a su carta. Si está habilitado, ofrece continuar a disponibilidad.

Proteger las entradas de nuevas reservas (`/cliente/reservar`, `/cliente/plano`, `/cliente/reserva/revisar`) mediante consulta del local explícito en la URL. Sin selección, ofrecer selección real; si existe un carrito real de la sesión, se puede reutilizar su restaurante haciendo el ID explícito en la URL; un ID inválido no se sustituye por muestras. Conservar restauranteId entre los pasos ya existentes. No bloquear detalle/historial ni llegada/finalización de reservas previas. Esto no implementa la búsqueda ni el registro API pendientes de US05/US06.

US11 reconsulta las condiciones del restaurante al entrar a modalidades y antes de confirmar SALÓN. Deshabilitar su opción si la atención física está pausada o no se puede verificar; conservar LLEVAR/RECOGER y DELIVERY según las reglas existentes. No vaciar el carrito ni enviar un pedido automáticamente. La API valida definitivamente mesas, reservas y pedidos.

La creación administrativa de mesas corresponde a US16 y todavía no tiene interfaz; el backend ya bloquea esa operación cuando la atención física está deshabilitada. No implementar US16 dentro de esta rama.

## Diseño y accesibilidad

Figma de la copia indicada por el usuario: `sRxKEwFdrMKfXPosGFvoHc`. Consultados por MCP: módulo 91:51572/91:51687, confirmación 91:51387 y cliente pausado 84:47986/84:48054. Adaptar la composición con WorkspaceShell, Angular Material y tokens existentes. Evitar textos de implementación en la interfaz; explicar efectos en términos de reservas, mesas y salón. Los nombres, fechas y estados de muestra del diseño no se usan como datos reales.

Standalone TS/HTML/CSS, rutas hijas existentes, diálogo Material con foco y cierre con Escape, acciones de al menos 44 px, estados con texto y regiones accesibles. Verificar 320/390/768/1440 sin desbordamiento global.

## Aceptación

| Criterio común | Evidencia esperada |
|---|---|
| CA01 | Consultar local propio muestra estado y contador retornados por la API. |
| CA02 | Habilitar persiste y desbloquea los accesos cuando las demás reglas lo permiten. |
| CA03 | Confirmar pausa persiste y bloquea reservas nuevas, creación de mesas en backend y SALÓN. |
| CA04 | Reservas anteriores conservan ID, estado e historial; no se envía cancelación. |
| CA05 | UI y respuestas coherentes con el local autenticado; no se permite cambiar otro restaurante. |

Ejecutar checker, build, regresiones compartidas y pruebas de navegador con HTTP controlado (cancelación, duplicados, permisos, contrato incorrecto, concurrencia y fallos inciertos). Verificar además lectura/persistencia real y restaurar la configuración original tras las pruebas autorizadas. Documentar límites, especialmente las integraciones de US05/US06 y US16 que siguen en sus tareas.
