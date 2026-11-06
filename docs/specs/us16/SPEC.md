# US16 — Gestión de mesas, ubicación y capacidad

Rama: `feature/operacion-mesas`. Tareas S2-TSK-021 y S2-TSK-022. Base: develop, independiente de los PR pendientes de US10, US14 y US27. Como dueño/administrador quiero registrar y mantener las mesas de mi local para organizar su atención.

## Pantallas y referencia visual

Conservar las rutas hijas e identificadores existentes: op-mesas (plano), op-mesas-lista, op-mesa-nueva, op-mesa-editar, op-mesa-desactivar y op-mesa-bloqueada. Los parámetros `mesaId` (y `id` legado solo cuando mesaId no existe) identifican el registro. Un ID explícito inválido no se sustituye por otra mesa.

Referencia: copia Figma indicada por el usuario, sRxKEwFdrMKfXPosGFvoHc. Se consultaron por MCP los frames de plano 89:22434/89:22625, listado 89:27884, registro 89:22037/89:22256, edición 89:21640, desactivación 89:21455 y bloqueo 89:21224. Adaptar a Angular Material y tokens existentes, reutilizando WorkspaceShell. Conservar composición de plano, formulario con referencia visual y diálogo de confirmación; no usar números, nombres ni reservas de muestra como información real.

## Contratos existentes

Reutilizar CatalogoService, ReservaService, AuthService/API_SESSION e interceptor.

| Operación | Contrato |
|---|---|
| Listado administrativo | GET `/mesas`: todas las mesas del local de la sesión, incluidas inactivas. No confundir con GET `/mesas/restaurante/{id}`, que solo devuelve activas. |
| Consulta individual | GET `/mesas/{id}`; verificar que ID y restaurante coincidan con la consulta autorizada antes de renderizar. |
| Registro | POST `/mesas` → 201. Body: numero, capacidad, coordenadaX, coordenadaY. El servidor elige el restaurante a partir de la sesión. |
| Edición | PUT `/mesas/{id}` → 200. Mismo body; conservar estado activo/inactivo salvo cambio explícito separado. |
| Estado | PATCH `/mesas/{id}/estado` → 200. Body exclusivamente `{activo:boolean}`. No borrar mesa ni historial. |
| Atención física | GET `/restaurantes/{id}` consulta su condición actual. Reconsultar antes de crear; la API vuelve a comprobarla en la escritura. |
| Reservas asociadas | GET `/reservas`, filtrado por mesa para explicar restricciones; no se cancelan ni modifican desde US16. |

Respuesta MesaResponse: id, restauranteId/nombre, numero, capacidad, coordenadaX/Y, activo, creadoEn, actualizadoEn y mensaje opcional. Validar tipos, identidad, IDs únicos, números/capacidades enteros positivos y coordenadas finitas o null en registros históricos. No enviar restauranteId elegido por el navegador en las escrituras.

## Reglas y comportamiento

1. Número y capacidad: enteros positivos hasta el límite técnico Integer.MAX_VALUE del DTO Java. Ubicación: dos números finitos obligatorios para registrar/editar. La API no define rango 0–100 ni unidades: no imponerlos. El número es único incluso si otra mesa está inactiva.
2. El plano representa posiciones relativas del conjunto recibido y permite seleccionar por teclado. No informa ocupación/disponibilidad horaria. Mesas sin coordenadas quedan listadas como sin ubicación. Agrupar coordenadas coincidentes permite acceder a todas sus mesas sin ocultarlas.
3. Registrar requiere atención física habilitada. Pausarla no oculta las mesas previas ni bloquea arbitrariamente operaciones que el backend permite; sus restricciones se consultan al guardar.
4. Edición conserva valores ante rechazo. La API impide reducir capacidad por debajo de los comensales comprometidos y desactivar con reservas vigentes. Mostrar su mensaje y acceso a las reservas asociadas, sin deducir restricciones a partir del reloj del navegador.
5. Desactivar requiere confirmación Material. Escape/cancelar no escribe; devuelve foco. Reactivar usa una acción explícita y conserva el historial. Una URL de confirmación no modifica datos automáticamente.
6. Bloquear envíos repetidos y navegación durante escritura. No simular éxito ni aplicar cambios optimistas. Después de guardar, consultar nuevamente el listado o detalle correspondiente. Si el resultado es incierto, exigir reconsulta antes de reintentar. No repetir automáticamente un POST.
7. La variante op-mesa-bloqueada no inventa un rechazo por `vista`: muestra un rechazo registrado o la consulta de restricciones y reservas asociadas al ID recibido. Sin datos suficientes, explicarlo.
8. Cambiar cuenta/local limpia datos, selección y respuestas anteriores. Un cliente no puede gestionar mesas. Errores 400/409 de negocio conservan datos; 401/403, 404, red/5xx o contrato incoherente tienen tratamiento específico.

## Accesibilidad y verificación

Standalone TS/HTML/CSS, Reactive Forms, MatFormField/MatInput, MatButton, MatTable y MatDialog. Estados con texto, etiquetas/errores asociados, foco visible, área táctil de al menos 44 px y tabla con scroll interno. Revisar 320/390/768/1440 sin desbordamiento global. No modificar el reparto del equipo ni implementar US29 dentro de esta historia.

| Criterio común | Resultado esperado |
|---|---|
| CA01 | Crear mesa válida y activa en el local autenticado. |
| CA02 | Duplicados al crear/renumerar se rechazan y conservan la información. |
| CA03 | Editar número, capacidad y coordenadas mantiene ID/local/estado. |
| CA04 | Reducción incompatible con reserva vigente muestra rechazo sin perder el formulario. |
| CA05 | Desactivar/reactivar cambia condición y refresca consulta sin borrar registro. |
| CA06 | Reserva vigente impide desactivar y tiene acceso a su gestión. |
| CA07 | Campos inválidos o atención física pausada impiden registro. |
| CA08 | Plano/listado incluyen todas las mesas propias, también inactivas. |
| CA09 | ID inexistente/ajeno no se representa como otra mesa ni permite escribir. |

Ejecutar checker/build, regresiones compartidas y navegador con HTTP controlado. Para persistencia y restricciones, usar PostgreSQL local aislado con cuentas y reservas exclusivas de prueba y retirar la base al terminar; las mesas no tienen endpoint de borrado y no deben dejar altas de prueba en Supabase. Las lecturas reales en Supabase pueden complementar la verificación sin alterar sus mesas.
