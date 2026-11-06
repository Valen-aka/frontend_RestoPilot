# SPEC común — RestoPilot

Guía funcional y visual compartida para todo el equipo. Revisión documental: 02/11/2026. Define requisitos, historias, criterios y procedimientos comunes; no establece prioridad entre integrantes ni acredita aceptación por documentar una funcionalidad.

## Índice

1. [Fuentes y alcance](#fuentes-y-alcance)
2. [Producto y permisos](#producto-y-permisos)
3. [Reglas de negocio](#reglas-de-negocio)
4. [Estados y flujos](#estados-y-flujos)
5. [Sistema visual](#sistema-visual)
6. [Arquitectura](#arquitectura)
7. [Historias y criterios completos](#historias-y-criterios-completos)
8. [Inventario de pantallas](#inventario-de-pantallas)
9. [Backlog del Sprint 2](#backlog-del-sprint-2)
10. [Interacción y heurísticas](#interacción-y-heurísticas)
11. [Verificación y entrega](#verificación-y-entrega)
12. [Pendientes](#pendientes)

## Fuentes y alcance

Leer [AGENTS.md](AGENTS.md) antes de modificar el proyecto. El alcance se determina con la tarea solicitada y los documentos de asignación del equipo; el reporte define el negocio y Figma su apariencia. Ante discrepancias, documentarlas y resolverlas con las instrucciones aplicables; no inventar reglas ni responsables.

| Fuente | Uso |
| --- | --- |
| report_1ACC0236-20262.pdf | Historias, criterios, mockups y backlog §4.3.2, páginas físicas 215–221 |
| Laboratorio_Generando_Interfaces_FIgma_Angular.pdf | Referencia metodológica para especificaciones, base, ramas, PR y cierre |
| Laboratorio_Configuracion-MCP_Figma.pdf | Referencia de conexión MCP; adaptar los comandos al entorno y agente utilizados |
| [Figma original — única referencia autorizada](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot?node-id=5-92) | Consultar pantallas y variantes desktop/mobile; verificar los IDs dentro de este archivo |
| [Inventario de pantallas](src/app/screen-manifest.json) | 120 escenarios, URLs y componentes; no prueba funcional |
| [Asignación del equipo](docs/ASIGNACION-EQUIPO.md) y [versión estructurada](docs/asignacion-equipo.json) | Responsables y coordinación de pantallas y archivos compartidos |
| Código, package.json y configuración de la rama actual | Herramientas y estado real antes de editar |

Los nombres de los PDF identifican documentos de referencia, no rutas de instalación. Su ubicación compartida y versión deben acordarse y registrarse por el equipo; no depender de carpetas personales. Si una fuente no está disponible, comunicar la limitación y trabajar con las fuentes verificables. Los IDs USxx-CAxx conservan la numeración del catálogo: CA corresponde al escenario numerado del reporte. La transcripción de un criterio no demuestra su ejecución ni aceptación.

Usar únicamente el Figma original enlazado arriba. Las referencias de frames y capturas ya documentadas deben comprobarse en ese archivo antes de implementar; no trasladar IDs entre archivos por suposición. Los valores visuales documentados constituyen el contrato de implementación, pero no sustituyen la comparación de cada pantalla con su referencia aprobada.

### Alcance y estado de las tareas

- Cada integrante trabaja en las pantallas y cambios compartidos necesarios para su tarea asignada. Consultar el reparto vigente; ninguna tarea tiene prioridad por aparecer primero en este documento.
- Distinguir implementación visual, navegación, integración con API y aceptación funcional. Confirmar qué etapas están autorizadas para la tarea; describir una funcionalidad no autoriza conectarla a servicios reales.
- Consultar el código, el inventario y la evidencia de la rama actual para determinar avances. Este SPEC define requisitos; no es una lista de tareas terminadas ni acredita el funcionamiento del backend.
- Antes de integrar HTTP, sesión u operaciones, verificar contratos, permisos, errores y validaciones del servidor. La UI no sustituye esas validaciones.
- US03/US04 describen IA prevista. Verificar la disponibilidad real del servicio antes de integrarlo; no inventar respuestas ni presentar muestras como operaciones reales.

### Complementos disponibles

El SPEC común contiene las 29 historias y sus criterios. No se requiere un archivo separado por cada US. Consultar un complemento solo si existe y corresponde a la tarea; su ausencia no impide trabajar con los requisitos comunes. Crear o ampliar complementos cuando la tarea lo requiera para detallar decisiones necesarias, sin duplicar ni contradecir el contrato común. Un complemento puede cubrir varias historias relacionadas.

| Complemento | Alcance |
| --- | --- |
| [Landing](docs/specs/landing/SPEC.md) | LP01: presentación del producto y accesos |
| [US10](docs/specs/us10/SPEC.md) | Carta del cliente, filtro por categoría, detalle real y selección hacia el carrito |
| [US11](docs/specs/us11/SPEC.md) | Carrito y registro del pedido por modalidad |
| [US12](docs/specs/us12/SPEC.md) | Detalle del pedido y consulta de pago |
| [US13](docs/specs/us13/SPEC.md) | Seguimiento del pedido |
| [Integración API de pedidos](docs/specs/cliente-pedido-api/SPEC.md) | US11, US12 y US13: contratos, sesión, identidad, errores y aceptación integrada |
| [Mis pedidos](docs/specs/cliente-pedidos/SPEC.md) | Listado y continuidad de selección entre detalle, seguimiento y pago |
| [US15](docs/specs/us15/SPEC.md) | Tablero y cola priorizada de cocina |
| [US19](docs/specs/us19/SPEC.md) | Preparación, pedido listo y entrega |
| [Integración API de cocina](docs/specs/operacion-cocina-api/SPEC.md) | US15 y US19: cola autorizada, prioridad, preparación y entrega reales |
| [US23](docs/specs/us23/SPEC.md) | Categorías: API y estado preparados; interfaces y aceptación pendientes |
| [US16](docs/specs/us16/SPEC.md) | Gestión de mesas: plano, listado, registro, edición, estado y restricciones de reservas |
| [US25](docs/specs/us25/SPEC.md) | Llegada y finalización de reservas |
| [Integración API de atención de reservas](docs/specs/operacion-reserva-atencion-api/SPEC.md) | US25: llegada, finalización, fechas, reglas temporales y recuperación |
| [US27](docs/specs/us27/SPEC.md) | Atención física, confirmación de pausa y efectos en reservas nuevas y salón |
| [US26](docs/specs/us26/SPEC.md) | Consulta de reservas expiradas en detalle e historial |
| [Integración API de reservas expiradas](docs/specs/reserva-expirada-api/SPEC.md) | US26: detalle, historial, fecha de expiración y disponibilidad autoritativa |

Los detalles de rama, entrega y evidencia particulares se documentan en el complemento correspondiente; no establecen el flujo ni el avance de las demás tareas.

## Producto y permisos

Aplicación SaaS por restaurante para carta, pedidos, reservas, cocina, registro de pagos recibidos externamente, notificaciones y reportes. La landing presenta el producto y lleva a acceso/registro. No añadir contabilidad, nómina, cobros en pasarela ni logística de repartidores por inferencia.

| Actor/contexto | Alcance | Restricción |
| --- | --- | --- |
| Visitante | Landing, registro cliente, alta de dueño/restaurante, acceso | No obtiene privilegios desde una selección visual |
| Cliente | Carta, pedidos/reservas propios, historial y avisos personales | No consulta ni modifica operaciones ajenas |
| Dueño | Gestión del local e incorporación de administradores | Cuenta habilitada y restaurante asociado |
| Administrador | Gestión del restaurante vinculado | No incorpora administradores ni gestiona otro local |
| Cocina/personal | Contexto de cola y acciones permitidas | No deducir un rol técnico adicional por el nombre de pantalla |
| Sistema | Expiración y avisos por eventos | El navegador no es autoridad de expiración |

El restaurante asociado determina el alcance de gestión. Cambiar un identificador de URL no otorga permisos. Ocultar controles no reemplaza autorización del servidor. Las cuentas deshabilitadas no acceden aunque sus credenciales sean correctas.

## Reglas de negocio

Resumen de consulta; los 198 criterios completos de abajo conservan precondiciones, fronteras y excepciones. No reemplazarlos por este resumen.

### Identidad — US01, US02, US21, US22

- Registro cliente: nombre, correo válido y contraseña de al menos 8 caracteres con letras, números y un carácter especial permitido. Verificar el conjunto exacto de caracteres especiales antes de escribir una expresión regular.
- Correo reconocido sin distinguir mayúsculas. Duplicado no crea cuenta ni transforma perfil.
- Registro público cliente no concede gestión. Restaurante indicado inexistente rechaza el alta conforme US01-CA06.
- Alta de dueño/restaurante conjunta, sin registros parciales ante error. Datos del local: nombre, dirección, teléfono, horarios, opciones de atención física y delivery.
- Apertura anterior al cierre dentro del mismo día; no introducir horarios nocturnos cruzando días sin requisito.
- Alta dueño no permite elegir otro perfil ni vincularse arbitrariamente a un restaurante existente.
- Solo dueño habilitado incorpora administradores al local asociado. No mostrar contraseña en resultado ni anunciar invitaciones no enviadas.

### Carta y mesas — US10, US14, US16, US23

- Categorías y platos del mismo restaurante; conservar aislamiento. Mostrar ingredientes, alérgenos e imagen registrados, sin inventar datos alimentarios.
- Plato: precio positivo, complejidad Baja/Media/Alta y preparación entre 5 y 15 minutos.
- Mesa: número positivo único por restaurante, capacidad mínima una persona, ubicación y atención física habilitada.
- No reducir capacidad por debajo de reservas vigentes ni desactivar mesas con reservas que impidan hacerlo. Inactivas no se ofrecen para reservas.

### Reservas — US05–US09, US17, US25–US27, US29

- Disponibilidad exige restaurante activo, atención física habilitada, mesa activa y suficiente capacidad; comensales positivos, intervalo válido dentro del horario y sin fecha/hora pasada.
- Pendientes y confirmadas bloquean horario conforme US06-CA02. Intervalos consecutivos, cuyo inicio coincide exactamente con el fin anterior, no se solapan (US05-CA07).
- Solicitud válida crea reserva Pendiente sin pedido ni cobro automático. Volver a comprobar disponibilidad al registrarla para resolver concurrencia.
- Reprogramación conserva restaurante, exige disponibilidad/capacidad y ausencia de llegada; vuelve a Pendiente para nueva evaluación. Error conserva datos anteriores.
- Cliente cancela reserva propia pendiente/confirmada sin llegada solo cuando faltan más de 2 horas. Exactamente 2 horas o menos: rechazo e indicación de llamar a recepción.
- No aplicar por inferencia esa frontera a reprogramación o cancelación administrativa. Motivo cliente opcional hasta 300 caracteres; notas resultantes hasta 500 (US09-CA07).
- Confirmar/rechazar corresponde a personal autorizado. Rechazar exige motivo no vacío; comunicar decisión y liberar horario cuando corresponda.
- Llegada: reserva Confirmada antes de vencer tolerancia. Finalizar: llegada registrada y hora de inicio alcanzada.
- Pendiente expira al alcanzar inicio. Confirmada sin llegada expira al cumplirse 15 minutos desde inicio, no antes. Llegada a tiempo evita expiración por inasistencia.
- Expirada no se reactiva mediante intentos de confirmación, modificación, cancelación o finalización. El servidor conserva historial y libera horario.
- Deshabilitar atención física bloquea nuevas reservas, creación de mesas y pedidos SALON; conserva reservas previas sin cancelarlas.
- Dueño/administrador cancela reserva del local pendiente/confirmada sin llegada sin la frontera de más de 2 horas del cliente (US29-CA07).

### Pedidos y cocina — US11–US15, US19, US24

- Modalidades SALON, LLEVAR, RECOGER, DELIVERY; campos condicionales según US11, sin exigir datos de otra modalidad.
- Cliente autenticado, restaurante activo/abierto, platos disponibles y cantidades positivas. No aceptar pedido en la hora exacta de cierre.
- Pedido y pago inicialmente Pendiente. Total de integración confirmado por el servidor; no mezclar platos de otro local.
- Flujo Pendiente → En preparación → Listo → Entregado. Rechazar transiciones inválidas; Entregado/Cancelado no vuelven a preparación.
- Cola de cocina solo Pendientes/En preparación. Prioridad por máxima complejidad (Alta > Media > Baja), mayor tiempo de preparación, antigüedad y finalmente identificador estable. Conservar orden de API al integrar.
- Ajuste/cancelación administrativa solo Pendiente, no pagado y del restaurante autorizado. Ajuste recalcula total e importe pendiente; error conserva datos.
- Cancelar conserva historial y registro de pago. No trasladar restaurante ni equiparar esta regla con cancelación futura por IA.

### Pagos y reportes — US07, US12, US18, US20, US28

- Registrar dinero recibido externamente no genera otro cargo ni implementa pasarela.
- Métodos Yape, Plin, Tarjeta, Efectivo; monto exacto. Para confirmar Yape/Plin/Tarjeta exigir referencia; Efectivo no la exige. Referencia hasta 100 caracteres.
- Pagado es inamovible, sin confirmación duplicada ni cambio de datos. Pedido Cancelado no admite un pago nuevo.
- Pendiente no muestra fecha de confirmación inexistente. US18-CA12 permite guardar importe exacto/método válido manteniendo Pendiente sin fecha de pago confirmado.
- Historial y notificaciones personales no mezclan cuentas; lista vacía no es un fallo ni autoriza datos ficticios.
- Reportes del local/período válido: ventas, demanda, atenciones, ocupación reservada y pagos.
- Platos vendidos: pedidos Entregados. Demanda: excluye Cancelados.
- Ocupación: tiempo reservado por mesas confirmadas/completadas respecto de tiempo disponible; no ocupación en vivo.
- Período de pedidos/pagos se delimita por creación del pedido, no por confirmación del pago (US20-CA10).

### IA prevista — US03, US04

Usar datos del restaurante, respetar permisos y reconocer información insuficiente. No garantizar compatibilidad alimentaria sin evidencia. US03 condiciona cancelación a ventana temporal y estado; mockup menciona 5 minutos, pero verificar contrato y frontera inclusiva/exclusiva antes de integrar. Servicios IA no implementados.

## Estados y flujos

| Entidad | Estados documentados |
| --- | --- |
| Reserva | Pendiente, Confirmada, Rechazada, Cancelada, Expirada, Completada |
| Pedido | Pendiente, En preparación, Listo, Entregado, Cancelado |
| Pago | Pendiente, Pagado |
| Mesa/plato | Actividad/disponibilidad según entidad y contrato |

Son etiquetas de negocio; verificar enum y campos API antes de formar payloads. No confundir mesa reservada para un intervalo con ocupación instantánea.

Flujos: acceso → carta → carrito/modalidad → pedido → seguimiento/pago; disponibilidad → plano → revisión → solicitud → decisión → llegada → finalización/expiración; gestión → operación → reportes. El orden de una lista no acredita conexión de prototipo; confirmar destinos.

En UI distinguir normal, carga, vacío, error, éxito y operación bloqueada cuando correspondan. Estados de demostración solo acreditan apariencia. No crear estados de negocio adicionales para resolver un detalle visual.

## Sistema visual

Los IDs de Style 5:124 y la guía 125:3 se comprobaron en el Figma original el 02/11/2026; ver [registro de referencias](docs/REFERENCIAS-FIGMA.md). Esta comprobación de identidad y dimensiones no revalida todos sus estilos. Los valores siguientes se conservan como contrato de implementación; falta comprobación visual/contraste de combinaciones reales y no se afirma una nueva verificación contra el original.

| Rol | Valor |
| --- | --- |
| Azul / secondary | #15324E |
| Verde de identidad | #219567 |
| Primary / on-primary | #1B7954 / #FFFFFF |
| Primary container / texto | #D8F2E3 / #073A24 |
| Surface / on-surface | #FFFBF7 / #172D3B |
| Error | #BA1A1A |

Tipografía Roboto Regular/Medium/Bold; Arial de respaldo. Tamaño/interlineado px: Display 45/52, Headline 32/40, Title 22/28, Body 16/24, Label 14/20. Espacio base 4: 4, 8, 12, 16, 24, 32. Radios: inputs 4, cards 12, diálogos 28. Iconos de retícula 24. Botón visual de 44 px; completar área táctil accesible sin atribuir al diseño el texto truncado de sus etiquetas.

Botones default/hover/focus/disabled. Formularios con etiqueta persistente, ayuda, activo, error y solo lectura. Checkbox/radio/switch/chips según acción, tabs contextuales, tablas con encabezados y badges con texto además de color.

### Contrato de estilos

src/material-theme.scss genera Material y src/styles.css aporta tokens/base compartida; CSS locales resuelven composición. Evitar selectores internos de Material e !important para layouts; usar variables del sistema y componentes públicos. La regla global de movimiento reducido usa !important únicamente para respetar la preferencia de accesibilidad.

La base global declara Roboto con Arial de respaldo. Existe el recurso local public/assets/pedido/fonts/roboto.ttf, utilizado por pedidos y cocina con nombres de familia propios; su existencia no implica que la base global lo cargue. Verificar las declaraciones de fuente y el alcance antes de reutilizar recursos. No añadir dependencia de fuente remota.

Colores auxiliares, sombras, anchos de contenedor y breakpoints son decisiones CSS de implementación, no valores Figma confirmados. La base usa ancho de contenido 75rem y breakpoint auxiliar 37.5rem; cada pantalla debe verificar su adaptación. Utilidades optativas: rp-container, rp-page, rp-section, rp-stack, rp-cluster, rp-grid, rp-card, rp-actions, rp-field, rp-help, rp-field-error, rp-feedback, rp-badge, rp-table, rp-sr-only y rp-skip-link. Estas clases no sustituyen semántica, roles ni mensajes accesibles. No activar oscuro sin diseño. Probar zoom, textos largos, contraste, foco y reduced-motion. No usar capturas completas como interfaz.

## Arquitectura

Versiones inspeccionadas: @angular/common 22.2.0, @angular/compiler 22.2.0, @angular/core 22.2.0, @angular/forms 22.2.0, @angular/platform-browser 22.2.0, @angular/router 22.2.0, @angular/material 22.2.3, @angular/cdk 22.2.3, rxjs 7.8.2, tslib 2.8.1, ng2-charts 11.0.0, chart.js 4.6.1, @angular/build 22.2.3, @angular/cli 22.2.3, @angular/compiler-cli 22.2.0, typescript 6.0.2.

.nvmrc: Node 24.21.0; comprobar engines de package.json. No reinstalar Material ni actualizar dependencias para una pantalla.

| Ruta | Uso |
| --- | --- |
| src/app/home/ | Landing, ruta /, Home |
| src/app/pages/ | Pantallas auth, cliente, dueno, operacion y sistema |
| src/app/routes/ | Grupos y carga diferida |
| src/app/layouts/ | Contextos compartidos |
| src/app/components/ | Reutilizables |
| src/app/dialogs/ | Ocho modales |
| src/app/screen-manifest.json | Escenarios y URLs |
| src/app/screen-host.ts | Selección por base y ?vista= |
| src/app/screen-loaders.ts | Cargadores |
| src/material-theme.scss, src/styles.css | Material y base global |
| public/assets/ | Recursos locales |

Standalone con .ts/.html/.css separados, Reactive Forms, imports explícitos, routerLink y @if/@for con track. Reutilizar base y no crear otra aplicación para landing.

Rutas raíz: /, /estructura, /auth, /dueno, /cliente, /operacion y /estado; wildcard a estructura. Carpeta pages/sistema y URL /estado no son lo mismo. ScreenHost selecciona ?vista= solo si coincide con base; si no, usa canónico. No deducir URL del nombre de carpeta.

**Componentes:** auth-story, brand, chat-panel, client-footer, client-header, data-table, empty-state, floor-plan, form-errors, loading-state, page-heading, sidebar, status-badge.

**Layouts:** admin-layout, auth-layout, cliente-layout, cuenta-layout, dueno-layout.

**Diálogos:** cliente-reserva-cancelar, op-categoria-eliminar, op-mesa-desactivar, op-pedido-cancelar, op-plato-disponibilidad, op-plato-eliminar, op-reserva-cancelar, op-reservas-modulo-confirmar.

### Integración futura

Verificar URL/método, autenticación, DTO, permisos, estados, validaciones, errores y paginación con contrato real; no inventar endpoints. Separar presentación/DTO y manejar rechazo sin anunciar éxito. No incluir secretos en frontend. Confirmar almacenamiento JWT/renovación antes de implementar. Servidor decide importes, concurrencia y expiración.

## Historias y criterios completos

29 historias, 198 criterios completos cotejados con reporte. Se normalizan espacios, no significado. Páginas físicas por historia. IA prevista se conserva como requisito, no como entrega.

| Historia | Título | Criterios |
| --- | --- | ---: |
| US01 | Registro de cliente | 6 |
| US02 | Inicio de sesión | 5 |
| US03 | Consulta y recomendación mediante asistente de IA | 7 |
| US04 | Consulta de reportes mediante asistente de IA | 7 |
| US05 | Consulta de disponibilidad de mesas | 7 |
| US06 | Registro de reserva de mesa | 7 |
| US07 | Consulta de historial de reservas y pedidos | 5 |
| US08 | Modificación de reserva | 7 |
| US09 | Cancelación de reserva | 8 |
| US10 | Consulta de carta por restaurante y categoría | 6 |
| US11 | Registro de pedido según modalidad de atención | 9 |
| US12 | Consulta del detalle del pedido y su pago | 6 |
| US13 | Consulta del estado del pedido | 5 |
| US14 | Gestión de platos y disponibilidad de la carta | 9 |
| US15 | Consulta priorizada de pedidos de cocina | 7 |
| US16 | Gestión de mesas, ubicación y capacidad | 9 |
| US17 | Evaluación de solicitudes de reserva | 6 |
| US18 | Registro y consulta del pago de un pedido | 12 |
| US19 | Actualización del estado del pedido | 6 |
| US20 | Consulta de reportes operativos | 10 |
| US21 | Alta de dueño y restaurante | 7 |
| US22 | Incorporación de administradores | 7 |
| US23 | Gestión de categorías de la carta | 5 |
| US24 | Ajuste y cancelación administrativa de pedidos | 6 |
| US25 | Registro de llegada y finalización de reservas | 7 |
| US26 | Vencimiento de reservas sin atención | 5 |
| US27 | Configuración de atención física y reservas | 5 |
| US28 | Consulta de notificaciones personales | 5 |
| US29 | Consulta y gestión administrativa de reservas | 7 |

### US01 — Registro de cliente

Actor documentado: usuario. Páginas físicas: 35, 36.

Como usuario, quiero registrarme como cliente para realizar pedidos, gestionar mis reservas y consultar mis operaciones.

#### US01-CA01 — Registro exitoso

Escenario 1: Registro exitoso Dado que el usuario no tiene una cuenta asociada a su correo electrónico. Cuando ingresa su nombre completo, un correo válido y una contraseña válida, y confirma el registro. Entonces el sistema crea una cuenta de cliente e informa que el registro fue exitoso.

#### US01-CA02 — Datos obligatorios incompletos

Escenario 2: Datos obligatorios incompletos Dado que el usuario está registrando su cuenta. Cuando omite el nombre, el correo o la contraseña. Entonces el sistema informa qué datos debe completar y no crea la cuenta.

#### US01-CA03 — Correo o contraseña no válidos

Escenario 3: Correo o contraseña no válidos Dado que el usuario está registrando su cuenta. Cuando ingresa un correo con formato incorrecto o una contraseña de menos de ocho caracteres, sin letras, sin números o sin un carácter especial permitido. Entonces el sistema informa que debe corregir los datos y no crea la cuenta.

#### US01-CA04 — Correo ya registrado

Escenario 4: Correo ya registrado Dado que existe una cuenta con el correo ingresado, aunque utilice diferencias de mayúsculas. Cuando el usuario intenta registrar otra cuenta con ese correo. Entonces el sistema informa que el correo ya está registrado y mantiene la cuenta existente sin cambios.

#### US01-CA05 — Registro sin privilegios de gestión

Escenario 5: Registro sin privilegios de gestión Dado que el usuario utiliza el registro de clientes. Cuando intenta obtener permisos de dueño o administrador al crear su cuenta. Entonces el sistema rechaza esa solicitud y no concede permisos de gestión.

#### US01-CA06 — Restaurante indicado inexistente

Escenario 6: Restaurante indicado inexistente Dado que el usuario incluye un restaurante en su registro de cliente. Cuando el restaurante indicado no existe. Entonces el sistema informa que no se encontró el restaurante y no crea la cuenta.

### US02 — Inicio de sesión

Actor documentado: usuario registrado. Páginas físicas: 36, 37.

Como usuario registrado, quiero iniciar sesión con mi correo y contraseña para acceder a las funciones permitidas para mi cuenta.

#### US02-CA01 — Acceso exitoso

Escenario 1: Acceso exitoso Dado que el usuario tiene una cuenta habilitada. Cuando ingresa correctamente su correo y contraseña. Entonces el sistema permite el acceso y reconoce su perfil y, cuando corresponda, el restaurante que puede gestionar.

#### US02-CA02 — Credenciales incorrectas

Escenario 2: Credenciales incorrectas Dado que el usuario intenta acceder a su cuenta. Cuando ingresa un correo no registrado o una contraseña incorrecta. Entonces el sistema rechaza el acceso e informa que el correo o la contraseña son incorrectos.

#### US02-CA03 — Datos incompletos

Escenario 3: Datos incompletos Dado que el usuario está iniciando sesión. Cuando omite el correo, la contraseña o ambos. Entonces el sistema solicita completar los datos obligatorios y no permite el acceso.

#### US02-CA04 — Cuenta deshabilitada

Escenario 4: Cuenta deshabilitada Dado que la cuenta del usuario está deshabilitada. Cuando el usuario ingresa sus credenciales correctas. Entonces el sistema rechaza el acceso e informa que la cuenta está inactiva o deshabilitada.

#### US02-CA05 — Reconocimiento del correo

Escenario 5: Reconocimiento del correo Dado que el usuario posee una cuenta registrada. Cuando ingresa su correo con diferencias de mayúsculas y una contraseña correcta. Entonces el sistema reconoce la misma cuenta y permite el acceso si está habilitada.

### US03 — Consulta y recomendación mediante asistente de IA

Actor documentado: cliente. Páginas físicas: 37, 38, 39.

Como cliente, quiero consultar la carta en lenguaje natural y solicitar operaciones permitidas sobre mis pedidos para elegir platos adecuados y gestionar mis solicitudes con ayuda del asistente.

**IA prevista; servicio no implementado.**

#### US03-CA01 — Recomendación por restricción alimentaria

Escenario 1: Recomendación por restricción alimentaria Dado que el cliente indica una preferencia vegetariana o vegana, o una restricción por alergia. Cuando solicita recomendaciones al asistente. Entonces el sistema presenta opciones compatibles según los ingredientes y alérgenos registrados en la carta del restaurante.

#### US03-CA02 — Ingredientes y alérgenos

Escenario 2: Ingredientes y alérgenos Dado que el cliente desea conocer un plato específico. Cuando consulta sus ingredientes o alérgenos al asistente. Entonces el sistema muestra la información registrada para ese plato.

#### US03-CA03 — Consulta de carta

Escenario 3: Consulta de carta Dado que el cliente está consultando al asistente de su restaurante. Cuando pregunta por platos, ingredientes, precios o disponibilidad de la carta. Entonces el sistema responde usando la información de ese restaurante.

#### US03-CA04 — Información insuficiente

Escenario 4: Información insuficiente Dado que el registro del plato no permite confirmar una restricción alimentaria. Cuando el cliente pide una recomendación o confirmación de ingredientes o alérgenos. Entonces el sistema comunica que la información es insuficiente y no garantiza una compatibilidad que no puede verificar.

#### US03-CA05 — Cancelación permitida

Escenario 5: Cancelación permitida Dado que el cliente posee un pedido dentro de la ventana de cancelación y con un estado que permite la operación. Cuando solicita su cancelación mediante el asistente. Entonces el sistema cancela el pedido, conserva el historial y notifica al cliente el resultado.

#### US03-CA06 — Cancelación fuera de condiciones

Escenario 6: Cancelación fuera de condiciones Dado que el pedido superó la ventana de cancelación o está en un estado que no permite cancelarlo. Cuando el cliente solicita su cancelación mediante el asistente. Entonces el sistema rechaza la operación, explica el motivo y conserva el pedido.

#### US03-CA07 — Pedido de otra persona

Escenario 7: Pedido de otra persona Dado que el pedido pertenece a otro cliente. Cuando el usuario pide al asistente consultarlo o cancelarlo. Entonces el sistema no revela la información ni realiza cambios sobre ese pedido.

### US04 — Consulta de reportes mediante asistente de IA

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 39, 40, 41.

Como dueño o administrador del restaurante, quiero consultar mis resultados operativos en lenguaje natural para obtener resúmenes que apoyen las decisiones de mi establecimiento.

**IA prevista; servicio no implementado.**

#### US04-CA01 — Platos más vendidos

Escenario 1: Platos más vendidos Dado que existen pedidos históricos del restaurante para un período definido. Cuando el usuario pregunta por los platos más vendidos de ese período. Entonces el sistema muestra el reporte correspondiente a los platos y sus cantidades vendidas.

#### US04-CA02 — Volumen de atención

Escenario 2: Volumen de atención Dado que existen operaciones históricas del restaurante. Cuando el usuario pregunta cuántos pedidos fueron atendidos durante un período. Entonces el sistema muestra los pedidos atendidos y, si incluye reservas completadas, las presenta por separado.

#### US04-CA03 — Mayor demanda

Escenario 3: Mayor demanda Dado que existen pedidos registrados en el período solicitado. Cuando el usuario pregunta por las horas de mayor actividad. Entonces el sistema presenta los horarios con mayor demanda de pedidos y sus resultados.

#### US04-CA04 — Resumen de pagos

Escenario 4: Resumen de pagos Dado que existen pedidos y pagos del restaurante para un período. Cuando el usuario pide un resumen de pagos confirmados y pendientes. Entonces el sistema muestra el monto confirmado, la cantidad de pedidos pagados, los pendientes y los métodos de pago utilizados.

#### US04-CA05 — Período no definido

Escenario 5: Período no definido Dado que la consulta no indica qué fechas se deben analizar. Cuando el usuario solicita un reporte ambiguo. Entonces el sistema solicita precisar el período antes de presentar resultados.

#### US04-CA06 — Sin datos

Escenario 6: Sin datos Dado que no existen operaciones del restaurante para las fechas solicitadas. Cuando el usuario consulta un reporte. Entonces el sistema informa que no hay datos suficientes y no inventa resultados.

#### US04-CA07 — Resultados de otro restaurante

Escenario 7: Resultados de otro restaurante Dado que el usuario tiene permiso de gestión sobre un restaurante. Cuando intenta obtener resultados de otro local. Entonces el sistema impide mostrar información de un restaurante que no está autorizado a gestionar.

### US05 — Consulta de disponibilidad de mesas

Actor documentado: cliente. Páginas físicas: 41, 42.

Como cliente, quiero consultar las mesas disponibles por fecha, horario y número de comensales para elegir una mesa adecuada para mi visita.

#### US05-CA01 — Mesas disponibles

Escenario 1: Mesas disponibles Dado que el restaurante está activo, tiene atención física habilitada y dispone de mesas activas. Cuando el cliente consulta una fecha y un intervalo horario válidos para un número positivo de comensales. Entonces el sistema muestra las mesas cuya capacidad permite atender al grupo e indica cuáles están disponibles para ese horario.

#### US05-CA02 — Sin disponibilidad

Escenario 2: Sin disponibilidad Dado que no hay mesas con capacidad suficiente o todas las mesas adecuadas tienen reservas vigentes que coinciden con el horario. Cuando el cliente consulta la disponibilidad. Entonces el sistema informa que no hay disponibilidad para el horario y número de comensales seleccionados.

#### US05-CA03 — Horario fuera de atención

Escenario 3: Horario fuera de atención Dado que el restaurante tiene un horario de apertura y cierre. Cuando el cliente consulta un intervalo que comienza antes de la apertura o termina después del cierre. Entonces el sistema informa que el horario solicitado está fuera de la atención del restaurante.

#### US05-CA04 — Fecha u hora pasada

Escenario 4: Fecha u hora pasada Dado que el cliente está consultando disponibilidad. Cuando elige una fecha pasada o una hora de inicio anterior a la actual para el mismo día. Entonces el sistema rechaza la consulta e informa que debe seleccionar una fecha y hora válidas.

#### US05-CA05 — Intervalo o comensales no válidos

Escenario 5: Intervalo o comensales no válidos Dado que el cliente está consultando disponibilidad. Cuando omite datos obligatorios, indica un inicio igual o posterior al fin o un número de comensales menor que uno. Entonces el sistema informa los datos que debe corregir y no presenta una disponibilidad válida para esa consulta.

#### US05-CA06 — Servicio no disponible

Escenario 6: Servicio no disponible Dado que el restaurante está inactivo o no tiene habilitada la atención física. Cuando el cliente intenta consultar disponibilidad. Entonces el sistema informa que no es posible realizar la consulta de reservas en esas condiciones.

#### US05-CA07 — Horarios consecutivos

Escenario 7: Horarios consecutivos Dado que una mesa tiene una reserva vigente que termina a una hora determinada. Cuando el cliente consulta una nueva reserva que empieza exactamente a esa hora y cumple las demás condiciones. Entonces el sistema no considera ambos horarios como coincidentes y puede mostrar la mesa disponible.

### US06 — Registro de reserva de mesa

Actor documentado: cliente. Páginas físicas: 42, 43, 44.

Como cliente, quiero seleccionar una mesa disponible y solicitar una reserva para contar con un espacio adecuado en la fecha y horario de mi visita.

#### US06-CA01 — Solicitud registrada

Escenario 1: Solicitud registrada Dado que el cliente ha iniciado sesión y la mesa está activa, pertenece al restaurante y tiene capacidad suficiente. Cuando selecciona la mesa, indica fecha, hora de inicio, hora de fin y comensales válidos, y confirma la solicitud. Entonces el sistema registra la reserva como Pendiente y muestra sus datos.

#### US06-CA02 — Mesa ya no disponible

Escenario 2: Mesa ya no disponible Dado que el cliente consultó previamente una mesa disponible. Cuando otra reserva pendiente o confirmada ocupa parte del mismo horario antes de que complete su solicitud. Entonces el sistema no registra la nueva reserva e informa que la mesa ya está reservada en ese horario.

#### US06-CA03 — Capacidad insuficiente

Escenario 3: Capacidad insuficiente Dado que la mesa seleccionada tiene una capacidad determinada. Cuando el cliente solicita una reserva para más comensales de los que admite. Entonces el sistema rechaza la solicitud e informa que la capacidad es insuficiente.

#### US06-CA04 — Mesa no válida

Escenario 4: Mesa no válida Dado que el cliente está solicitando una reserva. Cuando selecciona una mesa inactiva, inexistente o de otro restaurante. Entonces el sistema no registra la reserva e informa que la mesa seleccionada no es válida para esa solicitud.

#### US06-CA05 — Datos o horario no válidos

Escenario 5: Datos o horario no válidos Dado que el cliente está solicitando una reserva. Cuando omite datos obligatorios, utiliza fechas pasadas, un intervalo no válido o un horario fuera de atención. Entonces el sistema informa los datos que debe corregir y no registra la reserva.

#### US06-CA06 — Notas de la visita

Escenario 6: Notas de la visita Dado que el cliente desea agregar información a su reserva. Cuando incluye notas de hasta 500 caracteres y confirma una solicitud válida. Entonces el sistema conserva las notas junto con la reserva; si supera el límite, solicita corregirlas.

#### US06-CA07 — Reserva independiente del pedido

Escenario 7: Reserva independiente del pedido Dado que el cliente completa una solicitud válida de reserva. Cuando el sistema registra la reserva. Entonces no se genera automáticamente un pedido ni un cobro por esa reserva.

### US07 — Consulta de historial de reservas y pedidos

Actor documentado: cliente. Páginas físicas: 44, 45.

Como cliente, quiero consultar mis reservas y pedidos registrados para revisar mis operaciones y sus estados.

#### US07-CA01 — Historial con operaciones

Escenario 1: Historial con operaciones Dado que el cliente ha iniciado sesión y posee reservas o pedidos registrados. Cuando consulta su historial. Entonces el sistema muestra únicamente sus operaciones, con identificador, fecha, información principal y estado.

#### US07-CA02 — Reservas sin registros

Escenario 2: Reservas sin registros Dado que el cliente no posee reservas registradas. Cuando consulta su historial de reservas. Entonces el sistema informa que no se encontraron reservas, sin impedir la consulta de sus pedidos.

#### US07-CA03 — Pedidos sin registros

Escenario 3: Pedidos sin registros Dado que el cliente no posee pedidos registrados. Cuando consulta su historial de pedidos. Entonces el sistema informa que no se encontraron pedidos, sin impedir la consulta de sus reservas.

#### US07-CA04 — Historial de pedidos extenso

Escenario 4: Historial de pedidos extenso Dado que el cliente posee más pedidos de los que se muestran en una sola consulta. Cuando solicita otra página de su historial. Entonces el sistema muestra la página solicitada y la información necesaria para recorrer sus pedidos.

#### US07-CA05 — Información no disponible

Escenario 5: Información no disponible Dado que el cliente está consultando su historial. Cuando ocurre un error que impide recuperar la información. Entonces el sistema informa que no pudo completar la consulta y no presenta datos ajenos o inexistentes como si fueran su historial.

### US08 — Modificación de reserva

Actor documentado: cliente. Páginas físicas: 45, 46, 47.

Como cliente, quiero reprogramar los datos de una reserva que permite cambios para ajustar mi visita sin crear otra solicitud innecesaria.

#### US08-CA01 — Reprogramación válida

Escenario 1: Reprogramación válida Dado que el cliente posee una reserva pendiente o confirmada, sin llegada registrada y con posibilidad de modificación. Cuando cambia fecha, horario, comensales, notas o mesa dentro del mismo restaurante y cumple disponibilidad y capacidad. Entonces el sistema actualiza la reserva y la deja en Pendiente para una nueva evaluación del restaurante.

#### US08-CA02 — Sin disponibilidad para el cambio

Escenario 2: Sin disponibilidad para el cambio Dado que el cliente está reprogramando una reserva. Cuando la mesa elegida coincide con otra reserva vigente en el nuevo horario. Entonces el sistema informa la indisponibilidad y conserva los datos anteriores de la reserva.

#### US08-CA03 — Estado definitivo

Escenario 3: Estado definitivo Dado que la reserva está Cancelada, Rechazada, Expirada o Completada. Cuando el cliente intenta modificarla. Entonces el sistema rechaza la modificación y conserva su estado y datos.

#### US08-CA04 — Llegada registrada

Escenario 4: Llegada registrada Dado que la reserva ya tiene registrada la llegada de los comensales. Cuando el cliente intenta reprogramarla. Entonces el sistema informa que una reserva con llegada registrada no puede reprogramarse.

#### US08-CA05 — Cambio de restaurante

Escenario 5: Cambio de restaurante Dado que la reserva pertenece a un restaurante determinado. Cuando el cliente intenta trasladarla a otro restaurante. Entonces el sistema rechaza el cambio y conserva el restaurante de la reserva.

#### US08-CA06 — Nuevos datos no válidos

Escenario 6: Nuevos datos no válidos Dado que el cliente modifica su reserva. Cuando elige una mesa inactiva, de capacidad insuficiente, un horario no válido o notas que exceden el límite permitido. Entonces el sistema solicita corregir los datos y conserva la reserva anterior.

#### US08-CA07 — Reserva de otra persona

Escenario 7: Reserva de otra persona Dado que la reserva pertenece a otro cliente. Cuando el cliente intenta modificarla. Entonces el sistema impide la operación y mantiene la reserva sin cambios.

### US09 — Cancelación de reserva

Actor documentado: cliente. Páginas físicas: 47, 48, 49.

Como cliente, quiero cancelar una reserva propia dentro de las condiciones permitidas para liberar la mesa cuando no pueda asistir.

#### US09-CA01 — Cancelación dentro del plazo

Escenario 1: Cancelación dentro del plazo Dado que el cliente posee una reserva pendiente o confirmada, sin llegada registrada, cuyo inicio es dentro de más de dos horas. Cuando solicita su cancelación. Entonces el sistema la cambia a Cancelada, conserva el historial y libera la mesa para ese horario.

#### US09-CA02 — Límite exacto de dos horas

Escenario 2: Límite exacto de dos horas Dado que faltan exactamente dos horas para el inicio de la reserva. Cuando el cliente intenta cancelarla. Entonces el sistema rechaza la cancelación e indica que debe comunicarse por teléfono con recepción.

#### US09-CA03 — Menos de dos horas

Escenario 3: Menos de dos horas Dado que faltan menos de dos horas para el inicio de una reserva que sigue vigente. Cuando el cliente intenta cancelarla. Entonces el sistema rechaza la cancelación e indica que debe comunicarse por teléfono con recepción.

#### US09-CA04 — Reserva ya cancelada

Escenario 4: Reserva ya cancelada Dado que la reserva está Cancelada. Cuando el cliente intenta cancelarla nuevamente. Entonces el sistema informa que ya está cancelada y no realiza cambios.

#### US09-CA05 — Reserva en estado final

Escenario 5: Reserva en estado final Dado que la reserva está Rechazada, Expirada o Completada. Cuando el cliente intenta cancelarla. Entonces el sistema impide la operación y conserva el estado que corresponde a la reserva.

#### US09-CA06 — Llegada registrada

Escenario 6: Llegada registrada Dado que la reserva ya tiene registrada la llegada de los comensales. Cuando el cliente solicita cancelarla. Entonces el sistema impide la cancelación y mantiene la atención registrada.

#### US09-CA07 — Motivo opcional

Escenario 7: Motivo opcional Dado que el cliente cumple las condiciones para cancelar su reserva. Cuando incluye un motivo de hasta 300 caracteres y las notas resultantes no superan 500 caracteres. Entonces el sistema cancela la reserva y conserva el motivo; si se supera alguno de los límites, informa el error y no completa la cancelación.

#### US09-CA08 — Reserva ajena

Escenario 8: Reserva ajena Dado que la reserva pertenece a otro cliente. Cuando el cliente intenta cancelarla. Entonces el sistema rechaza la operación y conserva la reserva.

### US10 — Consulta de carta por restaurante y categoría

Actor documentado: cliente. Páginas físicas: 49, 50.

Como cliente, quiero consultar los platos de un restaurante y filtrarlos por categoría para conocer su oferta antes de realizar un pedido.

#### US10-CA01 — Consulta de toda la carta

Escenario 1: Consulta de toda la carta Dado que el cliente ha iniciado sesión y existen platos registrados en el restaurante consultado. Cuando consulta la carta sin elegir una categoría. Entonces el sistema muestra los platos de ese restaurante con sus datos y disponibilidad.

#### US10-CA02 — Filtro por categoría

Escenario 2: Filtro por categoría Dado que existen platos de distintas categorías en el restaurante. Cuando el cliente selecciona una categoría. Entonces el sistema muestra únicamente los platos que corresponden al restaurante y categoría consultados.

#### US10-CA03 — Detalle del plato

Escenario 3: Detalle del plato Dado que el cliente desea conocer un plato registrado. Cuando consulta su detalle. Entonces el sistema muestra el nombre, descripción, precio, ingredientes, alérgenos y demás información registrada para el plato.

#### US10-CA04 — Plato no disponible

Escenario 4: Plato no disponible Dado que un plato está marcado como no disponible. Cuando el cliente consulta la carta o el detalle del plato. Entonces el sistema informa su indisponibilidad y no admite su inclusión en un nuevo pedido.

#### US10-CA05 — Categoría sin platos

Escenario 5: Categoría sin platos Dado que no existen platos registrados para la combinación de restaurante y categoría consultada. Cuando el cliente aplica ese filtro. Entonces el sistema informa que no se encontraron platos para esa consulta.

#### US10-CA06 — Plato inexistente

Escenario 6: Plato inexistente Dado que el plato consultado no existe. Cuando el cliente intenta consultar su detalle. Entonces el sistema informa que no se encontró el plato.

### US11 — Registro de pedido según modalidad de atención

Actor documentado: cliente. Páginas físicas: 50, 51, 52.

Como cliente, quiero registrar un pedido para salón, para llevar, para recoger o por delivery para solicitar los platos que deseo consumir mediante la modalidad disponible.

#### US11-CA01 — Pedido válido

Escenario 1: Pedido válido Dado que el cliente ha iniciado sesión, el restaurante está activo y abierto y los platos están disponibles. Cuando confirma una modalidad válida y uno o más platos con cantidades positivas. Entonces el sistema registra el pedido como Pendiente, calcula el total y deja su pago como Pendiente.

#### US11-CA02 — Consumo en salón

Escenario 2: Consumo en salón Dado que el restaurante tiene habilitada la atención física. Cuando el cliente elige consumo en salón e indica una mesa activa del mismo restaurante. Entonces el sistema registra el pedido asociado a esa mesa.

#### US11-CA03 — Delivery habilitado

Escenario 3: Delivery habilitado Dado que el restaurante acepta delivery. Cuando el cliente elige delivery e indica una dirección no vacía de hasta 255 caracteres. Entonces el sistema registra el pedido y conserva la dirección de entrega.

#### US11-CA04 — Pedido para llevar o recoger

Escenario 4: Pedido para llevar o recoger Dado que el restaurante está activo y abierto. Cuando el cliente elige Para llevar o Recoger y confirma una selección válida. Entonces el sistema conserva la modalidad elegida sin exigir una mesa ni una dirección de delivery.

#### US11-CA05 — Modalidad sin condiciones requeridas

Escenario 5: Modalidad sin condiciones requeridas Dado que el cliente está confirmando un pedido. Cuando elige salón sin atención física o mesa válida, o delivery no habilitado o sin dirección válida. Entonces el sistema rechaza el registro e informa qué condición no se cumple.

#### US11-CA06 — Restaurante cerrado o inactivo

Escenario 6: Restaurante cerrado o inactivo Dado que el restaurante está inactivo o la hora actual está fuera de su atención, incluida la hora de cierre. Cuando el cliente intenta registrar un pedido. Entonces el sistema informa que no puede recibir el pedido y no lo registra.

#### US11-CA07 — Plato agotado o de otro restaurante

Escenario 7: Plato agotado o de otro restaurante Dado que algún plato seleccionado ya no está disponible o pertenece a otro restaurante. Cuando el cliente confirma el pedido. Entonces el sistema rechaza el registro y solicita revisar la selección.

#### US11-CA08 — Pedido vacío o cantidad inválida

Escenario 8: Pedido vacío o cantidad inválida Dado que el cliente no seleccionó platos o indicó una cantidad menor que uno. Cuando intenta confirmar el pedido. Entonces el sistema solicita al menos un plato con una cantidad válida y no registra la orden.

#### US11-CA09 — Cálculo del importe

Escenario 9: Cálculo del importe Dado que el cliente confirma un pedido válido. Cuando el sistema registra los platos y sus cantidades. Entonces el total corresponde a la suma de sus subtotales y se conservan los nombres y precios utilizados en esa compra.

### US12 — Consulta del detalle del pedido y su pago

Actor documentado: cliente. Páginas físicas: 52, 53, 54.

Como cliente, quiero consultar la información de un pedido propio y su registro de pago para revisar lo solicitado y el importe asociado a mi compra.

#### US12-CA01 — Detalle de pedido propio

Escenario 1: Detalle de pedido propio Dado que el cliente posee un pedido asociado a su cuenta. Cuando consulta su detalle. Entonces el sistema muestra platos, cantidades, precios unitarios, subtotales, total, modalidad, fecha y estado; incluye mesa o dirección cuando corresponde.

#### US12-CA02 — Consulta del pago

Escenario 2: Consulta del pago Dado que el pedido del cliente tiene un pago registrado. Cuando el cliente consulta ese pago. Entonces el sistema muestra el monto y estado, y el método, referencia y fecha cuando ya se hayan registrado.

#### US12-CA03 — Pago todavía pendiente

Escenario 3: Pago todavía pendiente Dado que el pedido tiene pago Pendiente y aún no se eligió un método. Cuando el cliente consulta el pago. Entonces el sistema informa que está pendiente sin presentar un método o una confirmación de pago inexistentes.

#### US12-CA04 — Sin registro de pago disponible

Escenario 4: Sin registro de pago disponible Dado que un pedido propio no tiene un registro de pago disponible. Cuando el cliente solicita consultarlo. Entonces el sistema informa que no existe un registro de pago para ese pedido, sin mostrar un pago de otra operación.

#### US12-CA05 — Pedido inexistente o ajeno

Escenario 5: Pedido inexistente o ajeno Dado que el pedido no existe o pertenece a otro cliente. Cuando el cliente intenta consultar su detalle o pago. Entonces el sistema no muestra la información y comunica que no se encontró el pedido.

#### US12-CA06 — Conservación del precio de compra

Escenario 6: Conservación del precio de compra Dado que un pedido fue registrado con nombres y precios determinados y la carta cambió después. Cuando el cliente consulta su pedido. Entonces el sistema conserva los nombres y precios registrados para esa compra, sin reemplazarlos por los actuales.

### US13 — Consulta del estado del pedido

Actor documentado: cliente. Páginas físicas: 54, 55.

Como cliente, quiero consultar el estado actualizado de mi pedido para conocer el avance de su preparación y entrega.

#### US13-CA01 — Estado actual

Escenario 1: Estado actual Dado que el cliente posee un pedido asociado a su cuenta. Cuando consulta su estado. Entonces el sistema muestra si está Pendiente, En preparación, Listo, Entregado o Cancelado.

#### US13-CA02 — Avance de preparación

Escenario 2: Avance de preparación Dado que el restaurante cambió válidamente el estado del pedido. Cuando el cliente vuelve a consultar su pedido. Entonces el sistema muestra el nuevo estado y permite consultar la notificación correspondiente en su cuenta.

#### US13-CA03 — Pedido entregado

Escenario 3: Pedido entregado Dado que el pedido está Entregado. Cuando el cliente consulta su estado. Entonces el sistema muestra que la entrega fue completada y no presenta una etapa posterior de preparación.

#### US13-CA04 — Pedido cancelado

Escenario 4: Pedido cancelado Dado que el pedido fue cancelado. Cuando el cliente consulta su estado. Entonces el sistema muestra Cancelado y conserva los datos de la operación.

#### US13-CA05 — Pedido ajeno o inexistente

Escenario 5: Pedido ajeno o inexistente Dado que el pedido no existe o no pertenece al cliente. Cuando el cliente consulta su estado. Entonces el sistema informa que no se encontró el pedido y no revela datos de otra cuenta.

### US14 — Gestión de platos y disponibilidad de la carta

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 55, 56, 57.

Como dueño o administrador del restaurante, quiero registrar y mantener los platos de mi carta y su disponibilidad para ofrecer a los clientes información actualizada de mis productos.

#### US14-CA01 — Registro de plato

Escenario 1: Registro de plato Dado que el usuario gestiona su restaurante y dispone de una categoría del mismo local. Cuando registra un nombre, categoría, precio positivo, complejidad y tiempo de preparación válidos. Entonces el sistema incorpora el plato a la carta de ese restaurante.

#### US14-CA02 — Información complementaria

Escenario 2: Información complementaria Dado que el usuario está registrando o editando un plato de su restaurante. Cuando incluye descripción, ingredientes, alérgenos o la dirección de una imagen. Entonces el sistema conserva la información proporcionada para su consulta en la carta.

#### US14-CA03 — Actualización de plato

Escenario 3: Actualización de plato Dado que el plato pertenece al restaurante del usuario. Cuando el usuario modifica sus datos con valores válidos. Entonces el sistema actualiza el plato sin trasladarlo a otro restaurante.

#### US14-CA04 — Disponibilidad del plato

Escenario 4: Disponibilidad del plato Dado que el plato pertenece al restaurante del usuario. Cuando el usuario lo marca como Disponible o No disponible. Entonces el sistema actualiza su disponibilidad para futuras selecciones y pedidos.

#### US14-CA05 — Precio o datos obligatorios inválidos

Escenario 5: Precio o datos obligatorios inválidos Dado que el usuario registra un plato nuevo o modifica datos que requieren validación. Cuando omite datos requeridos, deja el nombre vacío o indica un precio igual o menor que cero. Entonces el sistema informa los errores y no completa el cambio.

#### US14-CA06 — Complejidad o preparación inválidas

Escenario 6: Complejidad o preparación inválidas Dado que el usuario está definiendo un plato. Cuando indica una complejidad distinta de Baja, Media o Alta, o una preparación fuera de cinco a quince minutos. Entonces el sistema rechaza esos valores y solicita corregirlos.

#### US14-CA07 — Categoría de otro restaurante

Escenario 7: Categoría de otro restaurante Dado que el usuario está creando o editando un plato. Cuando intenta asignarle una categoría de otro restaurante. Entonces el sistema rechaza la asociación y conserva la información anterior cuando corresponda.

#### US14-CA08 — Eliminación de plato

Escenario 8: Eliminación de plato Dado que el plato pertenece al restaurante del usuario y no tiene relaciones que impidan su eliminación. Cuando el usuario solicita eliminarlo. Entonces el sistema lo retira de la carta; si su eliminación está impedida por registros relacionados, informa que no pudo completarse y lo conserva.

#### US14-CA09 — Gestión de un plato ajeno

Escenario 9: Gestión de un plato ajeno Dado que el plato pertenece a otro restaurante. Cuando el usuario intenta modificarlo, eliminarlo o cambiar su disponibilidad. Entonces el sistema impide la operación y mantiene el plato sin cambios.

### US15 — Consulta priorizada de pedidos de cocina

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 57, 58, 59.

Como dueño o administrador del restaurante, quiero consultar los pedidos pendientes y en preparación ordenados por prioridad para coordinar el trabajo de cocina según su complejidad y tiempo requerido.

#### US15-CA01 — Cola de trabajo

Escenario 1: Cola de trabajo Dado que el restaurante tiene pedidos Pendientes o En preparación. Cuando el usuario consulta la cola de cocina. Entonces el sistema muestra únicamente esos pedidos del restaurante que gestiona, junto con sus datos relevantes.

#### US15-CA02 — Prioridad por complejidad

Escenario 2: Prioridad por complejidad Dado que existen pedidos con platos de distintas complejidades. Cuando el usuario consulta la cola. Entonces el sistema prioriza Alta sobre Media y Media sobre Baja, considerando la mayor complejidad presente en cada pedido.

#### US15-CA03 — Desempate por preparación

Escenario 3: Desempate por preparación Dado que dos pedidos tienen la misma complejidad máxima. Cuando el usuario consulta su orden de atención. Entonces el sistema prioriza el pedido cuyo plato requiere el mayor tiempo de preparación.

#### US15-CA04 — Desempate por antigüedad

Escenario 4: Desempate por antigüedad Dado que dos pedidos tienen igual complejidad máxima y tiempo máximo de preparación. Cuando el usuario consulta la cola. Entonces el sistema muestra primero el pedido creado antes; si también coinciden, conserva un orden estable por su identificador.

#### US15-CA05 — Nueva consulta de prioridades

Escenario 5: Nueva consulta de prioridades Dado que se registró un nuevo pedido válido. Cuando el usuario vuelve a consultar la cola. Entonces el sistema lo incluye en el lugar que corresponde a las reglas de prioridad.

#### US15-CA06 — Pedido que sale de cocina

Escenario 6: Pedido que sale de cocina Dado que un pedido pasó a Listo, Entregado o Cancelado. Cuando el usuario vuelve a consultar la cola. Entonces el sistema deja de incluirlo entre los pedidos pendientes y en preparación.

#### US15-CA07 — Cola sin pedidos

Escenario 7: Cola sin pedidos Dado que el restaurante no tiene pedidos Pendientes ni En preparación. Cuando el usuario consulta la cola. Entonces el sistema informa que no hay pedidos para preparar.

### US16 — Gestión de mesas, ubicación y capacidad

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 59, 60, 61.

Como dueño o administrador del restaurante, quiero registrar y mantener las mesas de mi restaurante con su ubicación y capacidad para organizar la atención y la disponibilidad del salón.

#### US16-CA01 — Registro de mesa

Escenario 1: Registro de mesa Dado que el restaurante tiene atención física habilitada y no utiliza el número de mesa elegido. Cuando el usuario indica un número positivo, capacidad de al menos una persona y su ubicación. Entonces el sistema registra la mesa como activa en ese restaurante.

#### US16-CA02 — Número de mesa repetido

Escenario 2: Número de mesa repetido Dado que el restaurante ya tiene una mesa con un número determinado. Cuando el usuario intenta crear o renumerar otra mesa con ese mismo número. Entonces el sistema informa que el número ya se encuentra utilizado y no completa el cambio.

#### US16-CA03 — Modificación de datos

Escenario 3: Modificación de datos Dado que la mesa pertenece al restaurante del usuario. Cuando el usuario cambia su número, capacidad o ubicación con datos válidos. Entonces el sistema actualiza la información de esa mesa.

#### US16-CA04 — Capacidad inferior a una reserva vigente

Escenario 4: Capacidad inferior a una reserva vigente Dado que una mesa tiene una reserva vigente para un número de comensales determinado. Cuando el usuario intenta reducir la capacidad por debajo de ese número. Entonces el sistema rechaza el cambio y conserva la capacidad anterior.

#### US16-CA05 — Activación o desactivación

Escenario 5: Activación o desactivación Dado que la mesa pertenece al restaurante del usuario y no tiene reservas vigentes que impidan desactivarla. Cuando el usuario cambia su condición de activa o inactiva. Entonces el sistema actualiza esa condición; las mesas inactivas no se ofrecen para nuevas reservas.

#### US16-CA06 — Desactivación con reservas vigentes

Escenario 6: Desactivación con reservas vigentes Dado que la mesa tiene reservas vigentes. Cuando el usuario intenta desactivarla. Entonces el sistema rechaza la acción e indica que primero debe gestionar esas reservas.

#### US16-CA07 — Datos inválidos o atención física deshabilitada

Escenario 7: Datos inválidos o atención física deshabilitada Dado que el usuario desea crear una mesa. Cuando omite número, capacidad o ubicación, introduce valores inválidos o el restaurante no tiene atención física habilitada. Entonces el sistema informa el motivo y no registra la mesa.

#### US16-CA08 — Consulta de mesas propias

Escenario 8: Consulta de mesas propias Dado que el usuario gestiona un restaurante. Cuando consulta sus mesas. Entonces el sistema muestra las mesas de ese local, incluidas las inactivas, con número, capacidad y ubicación.

#### US16-CA09 — Mesa inexistente o ajena

Escenario 9: Mesa inexistente o ajena Dado que la mesa no existe o pertenece a otro restaurante. Cuando el usuario intenta gestionarla. Entonces el sistema impide la operación e informa que no se encontró la mesa o que no tiene permiso.

### US17 — Evaluación de solicitudes de reserva

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 61, 62.

Como dueño o administrador del restaurante, quiero confirmar o rechazar las solicitudes de reserva de mi local para decidir cuáles pueden ser atendidas y comunicar el resultado al cliente.

#### US17-CA01 — Confirmación de solicitud

Escenario 1: Confirmación de solicitud Dado que la reserva está Pendiente, es futura y su restaurante, horario, mesa y capacidad permiten atenderla. Cuando el usuario confirma la solicitud. Entonces el sistema la cambia a Confirmada y genera una notificación para el cliente.

#### US17-CA02 — Rechazo con motivo

Escenario 2: Rechazo con motivo Dado que la reserva está Pendiente. Cuando el usuario la rechaza e indica un motivo. Entonces el sistema la cambia a Rechazada, conserva el motivo, libera el horario y notifica la decisión al cliente.

#### US17-CA03 — Motivo de rechazo vacío

Escenario 3: Motivo de rechazo vacío Dado que el usuario está rechazando una solicitud pendiente. Cuando omite el motivo o lo deja en blanco. Entonces el sistema solicita un motivo y mantiene la solicitud sin rechazar.

#### US17-CA04 — Solicitud ya gestionada

Escenario 4: Solicitud ya gestionada Dado que la reserva ya no está Pendiente. Cuando el usuario intenta confirmarla o rechazarla nuevamente. Entonces el sistema impide la decisión e informa que la reserva ya fue gestionada.

#### US17-CA05 — Condiciones de confirmación incumplidas

Escenario 5: Condiciones de confirmación incumplidas Dado que la solicitud está pendiente pero la mesa está inactiva, su capacidad es insuficiente o el horario ya no es válido. Cuando el usuario intenta confirmarla. Entonces el sistema rechaza la confirmación e informa la condición que impide atenderla.

#### US17-CA06 — Decisión sobre otro restaurante

Escenario 6: Decisión sobre otro restaurante Dado que la solicitud pertenece a un restaurante distinto al que gestiona el usuario. Cuando intenta confirmarla o rechazarla. Entonces el sistema impide la operación y conserva la solicitud.

### US18 — Registro y consulta del pago de un pedido

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 62, 63, 64, 65.

Como dueño o administrador del restaurante, quiero registrar los pagos recibidos y consultar los pendientes de mis pedidos para llevar un control confiable de los importes y medios utilizados.

#### US18-CA01 — Pago pendiente de un nuevo pedido

Escenario 1: Pago pendiente de un nuevo pedido Dado que un cliente registra un pedido válido. Cuando se completa el registro del pedido. Entonces el sistema deja su pago Pendiente por el importe total, sin exigir que ya se haya elegido un método de pago.

#### US18-CA02 — Registro de pago recibido

Escenario 2: Registro de pago recibido Dado que el pedido no está cancelado, no tiene un pago confirmado y el dinero ya se recibió. Cuando el usuario registra el importe exacto del pedido y un método válido. Entonces el sistema deja el pago como Pagado y conserva el método y la fecha de pago.

#### US18-CA03 — Métodos de pago admitidos

Escenario 3: Métodos de pago admitidos Dado que el usuario está registrando un pago. Cuando selecciona Yape, Plin, Tarjeta o Efectivo. Entonces el sistema conserva el método elegido junto con el registro del pago.

#### US18-CA04 — Referencia de pago electrónico

Escenario 4: Referencia de pago electrónico Dado que el usuario confirma un pago con Yape, Plin o Tarjeta. Cuando incluye el código de referencia de la operación. Entonces el sistema conserva esa referencia; si la omite, solicita completarla y no confirma el pago.

#### US18-CA05 — Pago en efectivo

Escenario 5: Pago en efectivo Dado que el usuario registra un pago recibido en efectivo. Cuando indica el importe exacto y elige Efectivo. Entonces el sistema permite confirmar el pago sin exigir un código de referencia.

#### US18-CA06 — Importe que no coincide

Escenario 6: Importe que no coincide Dado que el pedido tiene un total determinado. Cuando el usuario intenta registrar un importe diferente. Entonces el sistema informa que el monto debe coincidir con el total y no completa el registro.

#### US18-CA07 — Pago confirmado inamovible

Escenario 7: Pago confirmado inamovible Dado que el pedido ya tiene un pago Pagado. Cuando el usuario intenta volver a confirmarlo o cambiar sus datos. Entonces el sistema rechaza la operación y conserva un único pago confirmado con su información original.

#### US18-CA08 — Pedido cancelado

Escenario 8: Pedido cancelado Dado que el pedido está Cancelado. Cuando el usuario intenta registrar su pago. Entonces el sistema rechaza la operación y no registra un pago nuevo.

#### US18-CA09 — Consulta por pedido

Escenario 9: Consulta por pedido Dado que el usuario gestiona el restaurante al que pertenece el pedido. Cuando consulta su pago. Entonces el sistema muestra monto y estado, y el método, referencia y fecha cuando correspondan.

#### US18-CA10 — Registro sin cobro en la aplicación

Escenario 10: Registro sin cobro en la aplicación Dado que el usuario registra un pago recibido por un medio externo. Cuando el sistema confirma el registro. Entonces se conserva la información del pago sin realizar un nuevo cargo al cliente.

#### US18-CA11 — Referencia demasiado extensa

Escenario 11: Referencia demasiado extensa Dado que el usuario está registrando un pago. Cuando indica un código de referencia de más de cien caracteres. Entonces el sistema solicita corregir la referencia y no completa el registro.

#### US18-CA12 — Actualización de pago todavía pendiente

Escenario 12: Actualización de pago todavía pendiente Dado que el pedido no está cancelado y aún no tiene un pago confirmado. Cuando el usuario registra el importe exacto y un método válido, manteniendo el pago como Pendiente. Entonces el sistema conserva ese estado sin registrar una fecha de pago confirmado.

### US19 — Actualización del estado del pedido

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 65, 66.

Como dueño o administrador del restaurante, quiero registrar el avance de los pedidos de mi local para comunicar su preparación y entrega de manera ordenada.

#### US19-CA01 — Inicio de preparación

Escenario 1: Inicio de preparación Dado que el pedido está Pendiente y pertenece al restaurante del usuario. Cuando el usuario inicia su preparación. Entonces el sistema lo cambia a En preparación y genera una notificación para el cliente.

#### US19-CA02 — Pedido listo

Escenario 2: Pedido listo Dado que el pedido está En preparación. Cuando el usuario informa que terminó su preparación. Entonces el sistema lo cambia a Listo y genera una notificación para el cliente.

#### US19-CA03 — Entrega del pedido

Escenario 3: Entrega del pedido Dado que el pedido está Listo. Cuando el usuario registra su entrega. Entonces el sistema lo cambia a Entregado y genera una notificación para el cliente.

#### US19-CA04 — Etapa omitida o retroceso

Escenario 4: Etapa omitida o retroceso Dado que el pedido tiene un estado determinado. Cuando el usuario intenta omitir una etapa, retroceder o repetir el mismo estado. Entonces el sistema rechaza el cambio y conserva el estado anterior.

#### US19-CA05 — Pedido finalizado

Escenario 5: Pedido finalizado Dado que el pedido está Entregado o Cancelado. Cuando el usuario intenta asignarle otra etapa de preparación. Entonces el sistema impide el cambio y conserva su estado final.

#### US19-CA06 — Pedido inexistente o ajeno

Escenario 6: Pedido inexistente o ajeno Dado que el pedido no existe o pertenece a otro restaurante. Cuando el usuario intenta actualizarlo. Entonces el sistema impide la operación y no modifica pedidos ajenos.

### US20 — Consulta de reportes operativos

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 66, 67, 68, 69.

Como dueño o administrador del restaurante, quiero consultar resultados de platos, demanda, atenciones, ocupación y pagos por período para analizar el desempeño de mi establecimiento.

#### US20-CA01 — Reporte consolidado

Escenario 1: Reporte consolidado Dado que el usuario tiene acceso a la gestión de su restaurante y existen operaciones registradas. Cuando consulta un rango válido de fechas. Entonces el sistema presenta los resultados de ese local para platos más vendidos, horas de demanda, atenciones, ocupación reservada y estado de pagos.

#### US20-CA02 — Reporte específico

Escenario 2: Reporte específico Dado que el usuario conoce el período que desea analizar. Cuando selecciona únicamente platos, demanda, atenciones, ocupación o pagos. Entonces el sistema muestra la información correspondiente al tipo seleccionado y al período solicitado.

#### US20-CA03 — Atenciones diferenciadas

Escenario 3: Atenciones diferenciadas Dado que existen pedidos entregados y reservas completadas en el período. Cuando el usuario consulta las atenciones. Entonces el sistema muestra por separado los pedidos atendidos y las reservas completadas; cualquier total de operaciones no se presenta como cantidad de clientes únicos.

#### US20-CA04 — Estado de pagos

Escenario 4: Estado de pagos Dado que el período contiene pedidos y pagos del restaurante. Cuando el usuario consulta pagos. Entonces el sistema muestra el monto confirmado, la cantidad de pedidos pagados, los pendientes y la cantidad de pagos confirmados por método utilizado.

#### US20-CA05 — Ocupación del salón

Escenario 5: Ocupación del salón Dado que el restaurante tiene mesas activas y un horario de atención válido. Cuando el usuario consulta la ocupación. Entonces el sistema muestra el porcentaje de tiempo reservado por mesas confirmadas o completadas respecto del tiempo disponible en el período, no una ocupación en vivo.

#### US20-CA06 — Período sin operaciones

Escenario 6: Período sin operaciones Dado que no existen pedidos ni reservas del restaurante para el período solicitado. Cuando el usuario consulta el reporte. Entonces el sistema informa que no hay datos registrados y no inventa indicadores.

#### US20-CA07 — Rango de fechas inválido

Escenario 7: Rango de fechas inválido Dado que el usuario está definiendo el período. Cuando omite una fecha o elige un inicio posterior al fin. Entonces el sistema solicita corregir el rango y no genera el reporte.

#### US20-CA08 — Alcance del restaurante

Escenario 8: Alcance del restaurante Dado que el usuario gestiona un restaurante determinado. Cuando consulta cualquier reporte. Entonces el sistema utiliza únicamente operaciones de ese restaurante y no muestra resultados de otros locales.

#### US20-CA09 — Platos vendidos y demanda

Escenario 9: Platos vendidos y demanda Dado que el período incluye pedidos en distintos estados. Cuando el usuario consulta platos más vendidos y horarios de demanda. Entonces el sistema cuenta como platos vendidos los de pedidos Entregados y excluye los pedidos Cancelados del cálculo de demanda.

#### US20-CA10 — Período de los resultados de pedidos y pagos

Escenario 10: Período de los resultados de pedidos y pagos Dado que un pedido se creó en una fecha y su pago pudo registrarse en otra. Cuando el usuario consulta un período de pedidos o pagos. Entonces el sistema delimita esos resultados por la fecha de creación del pedido, no por la fecha en que se confirmó el pago, y mantiene el alcance del restaurante.

### US21 — Alta de dueño y restaurante

Actor documentado: dueño de un restaurante. Páginas físicas: 69, 70.

Como dueño de un restaurante, quiero registrar mi cuenta y un nuevo establecimiento para comenzar a gestionar su operación con RestoPilot.

#### US21-CA01 — Alta completa

Escenario 1: Alta completa Dado que el correo del solicitante está disponible. Cuando ingresa datos válidos de su cuenta y de un restaurante nuevo y confirma el alta. Entonces el sistema crea el restaurante y su cuenta de dueño, los vincula y permite iniciar la gestión con ese perfil.

#### US21-CA02 — Correo ya registrado

Escenario 2: Correo ya registrado Dado que el correo está asociado a cualquier cuenta existente. Cuando el solicitante intenta crear su cuenta de dueño. Entonces el sistema informa que el correo ya está registrado, no cambia el perfil existente y no crea un restaurante nuevo.

#### US21-CA03 — Datos de cuenta inválidos

Escenario 3: Datos de cuenta inválidos Dado que el solicitante está registrando su cuenta. Cuando omite nombre, correo o contraseña, ingresa un correo inválido o una contraseña que no cumple las condiciones. Entonces el sistema informa los errores y no crea la cuenta ni el restaurante.

#### US21-CA04 — Datos del restaurante incompletos

Escenario 4: Datos del restaurante incompletos Dado que el solicitante está registrando su establecimiento. Cuando omite nombre, dirección, teléfono, horarios o las opciones de atención física y delivery. Entonces el sistema solicita completar los datos y no realiza un alta parcial.

#### US21-CA05 — Horario inválido

Escenario 5: Horario inválido Dado que el restaurante tendrá un horario de atención dentro del mismo día. Cuando el solicitante indica una apertura igual o posterior al cierre. Entonces el sistema solicita corregir el horario y no crea el establecimiento ni su cuenta.

#### US21-CA06 — Fallo durante el alta

Escenario 6: Fallo durante el alta Dado que el solicitante proporcionó datos válidos. Cuando ocurre un problema que impide completar la creación de la cuenta y el restaurante. Entonces el sistema informa que el alta no se completó y no conserva una cuenta o establecimiento creado solo parcialmente.

#### US21-CA07 — Restaurante existente o perfil elegido por el solicitante

Escenario 7: Restaurante existente o perfil elegido por el solicitante Dado que la persona utiliza el alta de dueño para un nuevo establecimiento. Cuando intenta vincularse a un restaurante existente o elegir otro perfil dentro de ese registro. Entonces el sistema rechaza la solicitud y mantiene las cuentas y restaurantes existentes sin cambios.

### US22 — Incorporación de administradores

Actor documentado: dueño. Páginas físicas: 70, 71, 72.

Como dueño, quiero crear cuentas de administrador para mi restaurante para delegar su gestión a personal autorizado con accesos individuales.

#### US22-CA01 — Administrador incorporado

Escenario 1: Administrador incorporado Dado que el dueño tiene una cuenta habilitada, un restaurante asociado y el correo del nuevo administrador está disponible. Cuando registra nombre, correo y una contraseña inicial válidos. Entonces el sistema crea una cuenta de administrador y la vincula al restaurante del dueño.

#### US22-CA02 — Solicitante sin permisos

Escenario 2: Solicitante sin permisos Dado que un cliente o administrador intenta incorporar personal. Cuando solicita crear una cuenta de administrador. Entonces el sistema rechaza la operación porque esa acción corresponde al dueño.

#### US22-CA03 — Correo duplicado

Escenario 3: Correo duplicado Dado que el correo está asociado a una cuenta de cualquier perfil. Cuando el dueño intenta incorporar un administrador con ese correo. Entonces el sistema informa que el correo ya está registrado y no crea ni transforma la cuenta existente.

#### US22-CA04 — Datos inválidos

Escenario 4: Datos inválidos Dado que el dueño está incorporando un administrador. Cuando omite nombre, correo o contraseña o proporciona datos que no cumplen las condiciones. Entonces el sistema informa los errores y no crea la cuenta.

#### US22-CA05 — Asignación de perfil o restaurante distinta

Escenario 5: Asignación de perfil o restaurante distinta Dado que el dueño está creando una cuenta administrativa. Cuando intenta elegir otro perfil o un restaurante diferente en lugar de la asignación que corresponde a su cuenta. Entonces el sistema rechaza la solicitud y no incorpora al administrador.

#### US22-CA06 — Acceso del nuevo administrador

Escenario 6: Acceso del nuevo administrador Dado que el administrador tiene una cuenta habilitada y vinculada al restaurante. Cuando inicia sesión con sus propias credenciales. Entonces el sistema le permite gestionar únicamente el restaurante asignado.

#### US22-CA07 — Entrega de acceso inicial

Escenario 7: Entrega de acceso inicial Dado que el dueño completó la incorporación de un administrador. Cuando consulta el resultado del registro. Entonces el sistema confirma los datos de la cuenta sin mostrar la contraseña; no informa un envío de invitación que no se haya realizado.

### US23 — Gestión de categorías de la carta

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 72, 73.

Como dueño o administrador del restaurante, quiero organizar los platos mediante categorías de mi local para mantener una carta ordenada para su consulta y gestión.

#### US23-CA01 — Creación de categoría

Escenario 1: Creación de categoría Dado que el usuario gestiona su restaurante. Cuando registra una categoría nueva con nombre y, si lo desea, descripción. Entonces el sistema crea la categoría para ese restaurante.

#### US23-CA02 — Nombre vacío

Escenario 2: Nombre vacío Dado que el usuario está creando una categoría. Cuando omite el nombre o lo deja en blanco. Entonces el sistema solicita un nombre y no crea la categoría.

#### US23-CA03 — Edición de categoría

Escenario 3: Edición de categoría Dado que la categoría pertenece al restaurante del usuario. Cuando el usuario actualiza su nombre o descripción con valores válidos. Entonces el sistema conserva los nuevos datos.

#### US23-CA04 — Eliminación permitida

Escenario 4: Eliminación permitida Dado que la categoría pertenece al restaurante y no tiene asociaciones que impidan eliminarla. Cuando el usuario solicita eliminarla. Entonces el sistema la elimina; si existen asociaciones que impiden la operación, informa que no pudo completarse y la conserva.

#### US23-CA05 — Categoría ajena

Escenario 5: Categoría ajena Dado que la categoría pertenece a otro restaurante. Cuando el usuario intenta editarla o eliminarla. Entonces el sistema impide la operación y mantiene la categoría sin cambios.

### US24 — Ajuste y cancelación administrativa de pedidos

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 73, 74, 75.

Como dueño o administrador del restaurante, quiero corregir o cancelar pedidos pendientes no pagados de mi local para atender cambios operativos sin alterar compras ya confirmadas.

#### US24-CA01 — Ajuste permitido

Escenario 1: Ajuste permitido Dado que el pedido está Pendiente, no está pagado y pertenece al restaurante del usuario. Cuando el usuario modifica los platos, cantidades o modalidad cumpliendo sus condiciones. Entonces el sistema actualiza el pedido, recalcula su total y ajusta el importe de su pago pendiente.

#### US24-CA02 — Cambio de restaurante no permitido

Escenario 2: Cambio de restaurante no permitido Dado que el pedido pertenece a un restaurante determinado. Cuando el usuario intenta trasladarlo a otro restaurante. Entonces el sistema rechaza el cambio y conserva el pedido.

#### US24-CA03 — Pedido ya pagado o en otra etapa

Escenario 3: Pedido ya pagado o en otra etapa Dado que el pedido está pagado o ya no está Pendiente. Cuando el usuario intenta cambiar su contenido o cancelarlo. Entonces el sistema rechaza la operación y conserva el pedido y su pago.

#### US24-CA04 — Cancelación administrativa válida

Escenario 4: Cancelación administrativa válida Dado que el pedido está Pendiente, no está pagado y pertenece al restaurante del usuario. Cuando el usuario solicita cancelarlo. Entonces el sistema lo cambia a Cancelado, conserva su historial y registro de pago, y genera una notificación para el cliente.

#### US24-CA05 — Nuevos datos inválidos

Escenario 5: Nuevos datos inválidos Dado que el usuario está ajustando un pedido permitido. Cuando deja la selección vacía, indica cantidades no positivas, platos agotados o una modalidad sin las condiciones necesarias. Entonces el sistema informa el error y conserva el pedido anterior.

#### US24-CA06 — Pedido ajeno

Escenario 6: Pedido ajeno Dado que el pedido pertenece a otro restaurante. Cuando el usuario intenta ajustarlo o cancelarlo. Entonces el sistema rechaza la operación y no modifica la información.

### US25 — Registro de llegada y finalización de reservas

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 75, 76.

Como dueño o administrador del restaurante, quiero registrar la llegada de los comensales y completar sus reservas para llevar el control de las visitas efectivamente atendidas.

#### US25-CA01 — Llegada registrada

Escenario 1: Llegada registrada Dado que la reserva está Confirmada y aún no venció la tolerancia de llegada. Cuando el usuario registra la llegada de los comensales. Entonces el sistema conserva la fecha y hora de llegada y genera una notificación para el cliente.

#### US25-CA02 — Llegada repetida

Escenario 2: Llegada repetida Dado que la reserva ya tiene una llegada registrada. Cuando el usuario intenta registrarla otra vez. Entonces el sistema informa que la llegada ya fue registrada y conserva el registro original.

#### US25-CA03 — Reserva no confirmada o vencida

Escenario 3: Reserva no confirmada o vencida Dado que la reserva no está Confirmada o ya venció la tolerancia sin llegada. Cuando el usuario intenta registrar la llegada. Entonces el sistema rechaza el registro y conserva el estado que corresponde a la reserva.

#### US25-CA04 — Atención completada

Escenario 4: Atención completada Dado que la reserva está Confirmada, tiene llegada registrada y ya llegó su hora de inicio. Cuando el usuario completa la atención. Entonces el sistema cambia la reserva a Completada, conserva la fecha y hora de finalización y genera una notificación para el cliente.

#### US25-CA05 — Finalización sin llegada

Escenario 5: Finalización sin llegada Dado que la reserva no tiene llegada registrada. Cuando el usuario intenta completarla. Entonces el sistema solicita registrar la llegada antes de completar la atención.

#### US25-CA06 — Finalización anticipada

Escenario 6: Finalización anticipada Dado que la reserva tiene llegada registrada pero aún no llega su hora de inicio. Cuando el usuario intenta completarla. Entonces el sistema rechaza la finalización anticipada y mantiene la reserva.

#### US25-CA07 — Reserva de otro local

Escenario 7: Reserva de otro local Dado que la reserva pertenece a otro restaurante. Cuando el usuario intenta registrar su llegada o completarla. Entonces el sistema impide la operación y conserva la reserva.

### US26 — Vencimiento de reservas sin atención

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 76, 77, 78.

Como dueño o administrador del restaurante, quiero que las reservas vencidas liberen su horario automáticamente para evitar mantener mesas bloqueadas por solicitudes o visitas que no se concretaron.

#### US26-CA01 — Solicitud pendiente que alcanza su inicio

Escenario 1: Solicitud pendiente que alcanza su inicio Dado que una reserva sigue Pendiente y no fue confirmada. Cuando se alcanza su fecha y hora de inicio. Entonces el sistema la cambia a Expirada, conserva el historial, libera la mesa para ese horario y genera una notificación para el cliente.

#### US26-CA02 — Reserva confirmada sin llegada

Escenario 2: Reserva confirmada sin llegada Dado que una reserva está Confirmada y no tiene llegada registrada. Cuando se cumplen quince minutos desde su hora de inicio. Entonces el sistema la cambia a Expirada, conserva el historial, libera la mesa para ese horario y notifica al cliente.

#### US26-CA03 — Tolerancia todavía vigente

Escenario 3: Tolerancia todavía vigente Dado que una reserva está Confirmada y no tiene llegada registrada. Cuando todavía no se cumplen quince minutos desde su inicio. Entonces el sistema no la vence por inasistencia y permite registrar la llegada mientras continúe dentro del plazo.

#### US26-CA04 — Llegada registrada a tiempo

Escenario 4: Llegada registrada a tiempo Dado que la reserva tiene registrada la llegada antes de vencer la tolerancia. Cuando transcurren quince minutos desde su hora de inicio. Entonces el sistema no la cambia a Expirada por falta de llegada.

#### US26-CA05 — Solicitud tardía sobre una reserva expirada

Escenario 5: Solicitud tardía sobre una reserva expirada Dado que la reserva ya cumplió las condiciones de vencimiento. Cuando se intenta confirmarla, reprogramarla, cancelarla o completar su atención. Entonces el sistema conserva la condición Expirada y no restablece el bloqueo de la mesa por esa solicitud.

### US27 — Configuración de atención física y reservas

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 78, 79.

Como dueño o administrador del restaurante, quiero habilitar o deshabilitar la atención física asociada a las reservas para adecuar la recepción de nuevas visitas y el servicio en salón a mi operación.

#### US27-CA01 — Consulta de la configuración

Escenario 1: Consulta de la configuración Dado que el usuario gestiona su restaurante. Cuando consulta el estado de atención física y reservas. Entonces el sistema informa si la atención física y las reservas están habilitadas y la cantidad de reservas vigentes considerada para la consulta.

#### US27-CA02 — Habilitación

Escenario 2: Habilitación Dado que el usuario tiene permiso de gestión sobre el restaurante. Cuando habilita la atención física. Entonces el sistema permite recibir nuevas reservas y crear mesas conforme a las demás condiciones del servicio.

#### US27-CA03 — Deshabilitación

Escenario 3: Deshabilitación Dado que el usuario gestiona un restaurante con atención física habilitada. Cuando deshabilita esa atención. Entonces el sistema deja de admitir nuevas reservas, la creación de mesas y nuevos pedidos en salón mientras esa condición continúe deshabilitada.

#### US27-CA04 — Reservas previas conservadas

Escenario 4: Reservas previas conservadas Dado que el restaurante tiene reservas registradas. Cuando el usuario deshabilita la atención física. Entonces el sistema conserva las reservas previas y su historial; no las cancela automáticamente.

#### US27-CA05 — Alcance del cambio

Escenario 5: Alcance del cambio Dado que el usuario está cambiando la configuración de su restaurante. Cuando intenta aplicar el cambio a otro establecimiento. Entonces el sistema impide modificar la configuración de un restaurante ajeno.

### US28 — Consulta de notificaciones personales

Actor documentado: usuario con una cuenta. Páginas físicas: 79, 80.

Como usuario con una cuenta, quiero consultar las notificaciones dirigidas a mi cuenta para conocer las decisiones y cambios relacionados con mis operaciones.

#### US28-CA01 — Notificaciones disponibles

Escenario 1: Notificaciones disponibles Dado que el usuario tiene notificaciones registradas para su cuenta. Cuando las consulta. Entonces el sistema muestra sus mensajes ordenados del más reciente al más antiguo, con fecha e identificador.

#### US28-CA02 — Decisiones y avances notificados

Escenario 2: Decisiones y avances notificados Dado que se confirmó o rechazó una reserva, se registró su llegada, finalización o vencimiento, o se cambió o canceló un pedido del cliente. Cuando el cliente consulta sus notificaciones. Entonces el sistema muestra los mensajes correspondientes a las acciones realizadas sobre sus operaciones.

#### US28-CA03 — Sin notificaciones

Escenario 3: Sin notificaciones Dado que el usuario no tiene mensajes registrados. Cuando consulta sus notificaciones. Entonces el sistema informa que no hay notificaciones disponibles.

#### US28-CA04 — Notificaciones de otra cuenta

Escenario 4: Notificaciones de otra cuenta Dado que existen mensajes destinados a otras personas. Cuando el usuario consulta sus notificaciones. Entonces el sistema no incluye mensajes de otras cuentas.

#### US28-CA05 — Recorrido de mensajes

Escenario 5: Recorrido de mensajes Dado que el usuario tiene más notificaciones de las mostradas en una sola consulta. Cuando solicita la siguiente página. Entonces el sistema presenta los mensajes de la página solicitada manteniendo el orden por fecha.

### US29 — Consulta y gestión administrativa de reservas

Actor documentado: dueño o administrador del restaurante. Páginas físicas: 80, 81.

Como dueño o administrador del restaurante, quiero consultar y filtrar las reservas de mi local y gestionar cambios permitidos para organizar la agenda y revisar cada visita antes de gestionarla.

#### US29-CA01 — Agenda del restaurante

Escenario 1: Agenda del restaurante Dado que el usuario gestiona un restaurante con reservas registradas. Cuando consulta su agenda. Entonces el sistema muestra las reservas de ese local con su información principal y estado.

#### US29-CA02 — Filtro por fecha y estado

Escenario 2: Filtro por fecha y estado Dado que el usuario desea revisar una parte de la agenda. Cuando indica una fecha, un estado o ambos. Entonces el sistema muestra únicamente las reservas que cumplen los filtros seleccionados.

#### US29-CA03 — Detalle de reserva

Escenario 3: Detalle de reserva Dado que la reserva pertenece al restaurante del usuario. Cuando el usuario consulta su detalle. Entonces el sistema muestra fecha, horario, mesa, comensales, estado, notas y motivo de rechazo o datos de atención cuando existan.

#### US29-CA04 — Consulta sin coincidencias

Escenario 4: Consulta sin coincidencias Dado que ninguna reserva del restaurante cumple los filtros elegidos. Cuando el usuario consulta la agenda. Entonces el sistema informa que no se encontraron reservas para esa consulta.

#### US29-CA05 — Reserva de otro restaurante

Escenario 5: Reserva de otro restaurante Dado que la reserva consultada pertenece a un establecimiento ajeno. Cuando el usuario intenta acceder a su detalle. Entonces el sistema impide mostrar sus datos.

#### US29-CA06 — Reprogramación por personal autorizado

Escenario 6: Reprogramación por personal autorizado Dado que la reserva es de su restaurante, no tiene llegada registrada y está en un estado que permite cambios. Cuando el dueño o administrador cambia fecha, horario, mesa o comensales con disponibilidad y capacidad suficientes. Entonces el sistema actualiza la reserva y la deja Pendiente para una nueva evaluación; si no se cumplen las condiciones, conserva la reserva anterior.

#### US29-CA07 — Cancelación por el restaurante

Escenario 7: Cancelación por el restaurante Dado que la reserva pendiente o confirmada es del restaurante y no tiene llegada registrada. Cuando el dueño o administrador solicita cancelarla. Entonces el sistema la cambia a Cancelada y libera el horario; el límite de más de dos horas exigido al cliente no restringe esta gestión autorizada.

## Inventario de pantallas

120 escenarios actuales más landing. URLs/archivos no acreditan implementación. Asociaciones conservadas del manifiesto, sin nombres personales. Descripciones proceden de fichas del reporte, no de ejecución. No se trasladan IDs de Figma antiguos como verificados actuales.

### Landing adicional

LP01, ruta /, src/app/home/home.ts, home.html, home.css. Frame desktop confirmado 115:144 (1280 px); mobile confirmado 115:781 (390 px); CTA principal a /auth/registro-dueno aprobado por el usuario. Tareas 003/004; consultar SPEC de landing.

### Pantalla: acceso

- Contexto: Acceso; referencia del manifiesto: US02.
- URL: /auth/login; base: /auth/login; canónica.
- Componente: src/app/pages/auth/acceso/acceso.ts.
- Archivos: src/app/pages/auth/acceso/acceso.ts, src/app/pages/auth/acceso/acceso.html, src/app/pages/auth/acceso/acceso.css.
- Ficha: PDF-UI-002, páginas 101; relación original: US02.

Permite a los usuarios (clientes, administradores y dueños) ingresar sus credenciales (correo electrónico y contraseña) para autenticarse en la plataforma. Como resultado, si los datos son correctos, el sistema valida la identidad, genera un token JWT y redirige al usuario a su panel correspondiente según su rol.

### Pantalla: acceso-error

- Contexto: Acceso; referencia del manifiesto: US02.
- URL: /auth/login?vista=acceso-error; base: /auth/login; estado alternativo.
- Componente: src/app/pages/auth/acceso-error/acceso-error.ts.
- Archivos: src/app/pages/auth/acceso-error/acceso-error.ts, src/app/pages/auth/acceso-error/acceso-error.html, src/app/pages/auth/acceso-error/acceso-error.css.
- Ficha: PDF-UI-003, páginas 101, 102; relación original: US02.

Se muestra tras un intento fallido de inicio de sesión por credenciales incorrectas. Presenta un mensaje de alerta en rojo destacando que no se pudo iniciar sesión y un botón "Volver a intentar". Como resultado, permite al usuario corregir su correo o contraseña sin perder el contexto de acceso.

### Pantalla: registro-cliente

- Contexto: Acceso; referencia del manifiesto: US01.
- URL: /auth/registro; base: /auth/registro; canónica.
- Componente: src/app/pages/auth/registro-cliente/registro-cliente.ts.
- Archivos: src/app/pages/auth/registro-cliente/registro-cliente.ts, src/app/pages/auth/registro-cliente/registro-cliente.html, src/app/pages/auth/registro-cliente/registro-cliente.css.
- Ficha: PDF-UI-004, páginas 102; relación original: US01.

Permite a un comensal crear su cuenta completando su nombre completo, correo y contraseña. Como resultado, registra al usuario con el rol CLIENTE, inicia sesión de inmediato y le permite acceder a la carta para pedir y reservar.

### Pantalla: registro-dueno

- Contexto: Acceso; referencia del manifiesto: US21.
- URL: /auth/registro-dueno; base: /auth/registro-dueno; canónica.
- Componente: src/app/pages/auth/registro-dueno/registro-dueno.ts.
- Archivos: src/app/pages/auth/registro-dueno/registro-dueno.ts, src/app/pages/auth/registro-dueno/registro-dueno.html, src/app/pages/auth/registro-dueno/registro-dueno.css.
- Ficha: PDF-UI-005, páginas 102, 103; relación original: US21.

Permite al propietario ingresar sus datos personales (nombre, correo y contraseña segura). Como resultado, valida que el correo esté disponible y habilita el botón "Continuar" para avanzar a registrar los datos del local.

### Pantalla: registro-restaurante

- Contexto: Acceso; referencia del manifiesto: US21.
- URL: /auth/restaurante; base: /auth/restaurante; canónica.
- Componente: src/app/pages/auth/registro-restaurante/registro-restaurante.ts.
- Archivos: src/app/pages/auth/registro-restaurante/registro-restaurante.ts, src/app/pages/auth/registro-restaurante/registro-restaurante.html, src/app/pages/auth/registro-restaurante/registro-restaurante.css.
- Ficha: PDF-UI-006, páginas 103; relación original: US21.

Permite configurar nombre, dirección, teléfono, horarios de apertura/cierre y habilitar salón o delivery. Como resultado, ejecuta una transacción conjunta que crea el restaurante y asigna el rol DUENO al solicitante.

### Pantalla: registro-duplicado

- Contexto: Acceso; referencia del manifiesto: US21.
- URL: /auth/registro-dueno?vista=registro-duplicado; base: /auth/registro-dueno; estado alternativo.
- Componente: src/app/pages/auth/registro-duplicado/registro-duplicado.ts.
- Archivos: src/app/pages/auth/registro-duplicado/registro-duplicado.ts, src/app/pages/auth/registro-duplicado/registro-duplicado.html, src/app/pages/auth/registro-duplicado/registro-duplicado.css.
- Ficha: PDF-UI-007, páginas 103, 104; relación original: US21.

Informa al usuario que el correo ingresado ya pertenece a una cuenta existente en el sistema, evitando crear cuentas o restaurantes duplicados. Como resultado, bloquea el registro duplicado y ofrece el botón "Ir a iniciar sesión" para ingresar con dicha cuenta.

### Pantalla: dueno-bienvenida

- Contexto: Dueño; referencia del manifiesto: US21.
- URL: /dueno/bienvenida; base: /dueno/bienvenida; canónica.
- Componente: src/app/pages/dueno/dueno-bienvenida/dueno-bienvenida.ts.
- Archivos: src/app/pages/dueno/dueno-bienvenida/dueno-bienvenida.ts, src/app/pages/dueno/dueno-bienvenida/dueno-bienvenida.html, src/app/pages/dueno/dueno-bienvenida/dueno-bienvenida.css.
- Ficha: PDF-UI-008, páginas 104, 105; relación original: US21.

Pantalla de confirmación inmediata tras completar el registro conjunto de dueño y restaurante. Muestra un mensaje de bienvenida con el nombre del local ("Bienvenido a La Mesa Verde") e indica los siguientes pasos operativos. Como resultado, el botón "Entrar a mi restaurante" inicia la sesión y redirige al panel de control.

### Pantalla: cliente-inicio

- Contexto: Cliente; referencia del manifiesto: US10.
- URL: /cliente; base: /cliente; canónica.
- Componente: src/app/pages/cliente/cliente-inicio/cliente-inicio.ts.
- Archivos: src/app/pages/cliente/cliente-inicio/cliente-inicio.ts, src/app/pages/cliente/cliente-inicio/cliente-inicio.html, src/app/pages/cliente/cliente-inicio/cliente-inicio.css.
- Ficha: PDF-UI-013, páginas 108; relación original: US10.

Permite al cliente visualizar el portal de bienvenida tras iniciar sesión, ofreciéndole accesos directos para explorar el menú o reservar una mesa, junto con una selección de platos destacados. Como resultado, facilita la navegación inmediata del comensal hacia la carta gastronómica o hacia el sistema de reservas del local.

### Pantalla: cliente-carta

- Contexto: Cliente; referencia del manifiesto: US10.
- URL: /cliente/carta; base: /cliente/carta; canónica.
- Componente: src/app/pages/cliente/cliente-carta/cliente-carta.ts.
- Archivos: src/app/pages/cliente/cliente-carta/cliente-carta.ts, src/app/pages/cliente/cliente-carta/cliente-carta.html, src/app/pages/cliente/cliente-carta/cliente-carta.css.
- Ficha: PDF-UI-014, páginas 108, 109; relación original: US10.

Permite al cliente consultar la lista completa de platos activos del restaurante y filtrar la oferta mediante botones de categorías. Como resultado, despliega las tarjetas de los productos con su precio, tiempo de preparación y botón de adición rápida para empezar a armar el pedido.

### Pantalla: cliente-carta-categoria

- Contexto: Cliente; referencia del manifiesto: US10.
- URL: /cliente/carta?vista=cliente-carta-categoria; base: /cliente/carta; estado alternativo.
- Componente: src/app/pages/cliente/cliente-carta-categoria/cliente-carta-categoria.ts.
- Archivos: src/app/pages/cliente/cliente-carta-categoria/cliente-carta-categoria.ts, src/app/pages/cliente/cliente-carta-categoria/cliente-carta-categoria.html, src/app/pages/cliente/cliente-carta-categoria/cliente-carta-categoria.css.
- Ficha: PDF-UI-015, páginas 109; relación original: US10.

Permite al cliente filtrar los productos del menú seleccionando una categoría en específico como "Platos de fondo". Como resultado, actualiza dinámicamente la vista mostrando únicamente los platos que pertenecen a dicha categoría seleccionada.

### Pantalla: cliente-carta-vacia

- Contexto: Cliente; referencia del manifiesto: US10.
- URL: /cliente/carta?vista=cliente-carta-vacia; base: /cliente/carta; estado alternativo.
- Componente: src/app/pages/cliente/cliente-carta-vacia/cliente-carta-vacia.ts.
- Archivos: src/app/pages/cliente/cliente-carta-vacia/cliente-carta-vacia.ts, src/app/pages/cliente/cliente-carta-vacia/cliente-carta-vacia.html, src/app/pages/cliente/cliente-carta-vacia/cliente-carta-vacia.css.
- Ficha: PDF-UI-016, páginas 109, 110; relación original: US10.

Permite al sistema gestionar el escenario en el que una categoría seleccionada por el cliente no cuenta con platos disponibles en ese momento. Como resultado, muestra un mensaje amigable indicando que se está preparando la categoría y ofrece un botón para retornar a la carta completa, evitando pantallas vacías.

### Pantalla: cliente-plato

- Contexto: Cliente; referencia del manifiesto: US10.
- URL: /cliente/plato; base: /cliente/plato; canónica.
- Componente: src/app/pages/cliente/cliente-plato/cliente-plato.ts.
- Archivos: src/app/pages/cliente/cliente-plato/cliente-plato.ts, src/app/pages/cliente/cliente-plato/cliente-plato.html, src/app/pages/cliente/cliente-plato/cliente-plato.css.
- Ficha: PDF-UI-017, páginas 110, 111; relación original: US10.

Permite al cliente consultar la información completa de un plato específico (ingredientes, alérgenos, tiempo de cocina y precio) y seleccionar la cantidad deseada. Como resultado, añade el plato con las unidades indicadas al carrito de compras del usuario y actualiza el subtotal del pedido.

### Pantalla: cliente-plato-agotado

- Contexto: Cliente; referencia del manifiesto: US10.
- URL: /cliente/plato?vista=cliente-plato-agotado; base: /cliente/plato; estado alternativo.
- Componente: src/app/pages/cliente/cliente-plato-agotado/cliente-plato-agotado.ts.
- Archivos: src/app/pages/cliente/cliente-plato-agotado/cliente-plato-agotado.ts, src/app/pages/cliente/cliente-plato-agotado/cliente-plato-agotado.html, src/app/pages/cliente/cliente-plato-agotado/cliente-plato-agotado.css.
- Ficha: PDF-UI-018, páginas 111, 112; relación original: US10.

Permite al cliente consultar la ficha de un plato que se encuentra temporalmente fuera de stock, informándole sobre su estado de indisponibilidad e inhabilitando su orden directa. Como resultado, el usuario comprende que el producto no puede ser solicitado en el momento y cuenta con un enlace directo para regresar a explorar otras alternativas disponibles en la carta.

### Pantalla: cliente-carrito

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/carrito; base: /cliente/carrito; canónica.
- Componente: src/app/pages/cliente/cliente-carrito/cliente-carrito.ts.
- Archivos: src/app/pages/cliente/cliente-carrito/cliente-carrito.ts, src/app/pages/cliente/cliente-carrito/cliente-carrito.html, src/app/pages/cliente/cliente-carrito/cliente-carrito.css.
- Ficha: PDF-UI-020, páginas 112, 113; relación original: US11.

Permite al cliente revisar la lista de platos agregados a su orden, visualizar cantidades, precios unitarios y el subtotal calculado, así como vaciar el pedido o retornar a la carta. Como resultado, el usuario confirma los productos seleccionados y avanza hacia la selección de la modalidad de entrega mediante el botón «Elegir cómo disfrutarlo».

### Pantalla: cliente-carrito-vacio

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/carrito?vista=cliente-carrito-vacio; base: /cliente/carrito; estado alternativo.
- Componente: src/app/pages/cliente/cliente-carrito-vacio/cliente-carrito-vacio.ts.
- Archivos: src/app/pages/cliente/cliente-carrito-vacio/cliente-carrito-vacio.ts, src/app/pages/cliente/cliente-carrito-vacio/cliente-carrito-vacio.html, src/app/pages/cliente/cliente-carrito-vacio/cliente-carrito-vacio.css.
- Ficha: PDF-UI-021, páginas 113; relación original: US11.

Permite al cliente visualizar el estado inicial de su bandeja de compras cuando todavía no ha incorporado ningún plato a su selección. Como resultado, el usuario recibe una confirmación visual amigable que lo orienta a explorar la carta del restaurante a través del botón «Explorar la carta».

### Pantalla: cliente-entrega-salon

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/entrega; base: /cliente/entrega; canónica.
- Componente: src/app/pages/cliente/cliente-entrega-salon/cliente-entrega-salon.ts.
- Archivos: src/app/pages/cliente/cliente-entrega-salon/cliente-entrega-salon.ts, src/app/pages/cliente/cliente-entrega-salon/cliente-entrega-salon.html, src/app/pages/cliente/cliente-entrega-salon/cliente-entrega-salon.css.
- Ficha: PDF-UI-022, páginas 113, 114; relación original: US11.

Permite al cliente seleccionar la atención presencial en salón, verificar o ingresar el número de mesa asignada y revisar el resumen consolidado de platos y monto total. Como resultado, el usuario formaliza y envía su pedido directamente a la cocina para ser atendido en la mesa indicada del restaurante.

### Pantalla: cliente-entrega-delivery

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/entrega?vista=cliente-entrega-delivery; base: /cliente/entrega; estado alternativo.
- Componente: src/app/pages/cliente/cliente-entrega-delivery/cliente-entrega-delivery.ts.
- Archivos: src/app/pages/cliente/cliente-entrega-delivery/cliente-entrega-delivery.ts, src/app/pages/cliente/cliente-entrega-delivery/cliente-entrega-delivery.html, src/app/pages/cliente/cliente-entrega-delivery/cliente-entrega-delivery.css.
- Ficha: PDF-UI-023, páginas 114, 115; relación original: US11.

Permite al cliente optar por la entrega a domicilio, ingresar la dirección exacta de despacho y verificar el resumen del pedido junto con la aclaración sobre los métodos de cobro. Como resultado, el usuario tramita su solicitud para que el restaurante prepare y despache los platos al destino especificado.

### Pantalla: cliente-entrega-llevar

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/entrega?vista=cliente-entrega-llevar; base: /cliente/entrega; estado alternativo.
- Componente: src/app/pages/cliente/cliente-entrega-llevar/cliente-entrega-llevar.ts.
- Archivos: src/app/pages/cliente/cliente-entrega-llevar/cliente-entrega-llevar.ts, src/app/pages/cliente/cliente-entrega-llevar/cliente-entrega-llevar.html, src/app/pages/cliente/cliente-entrega-llevar/cliente-entrega-llevar.css.
- Ficha: PDF-UI-024, páginas 115, 116; relación original: US11.

Permite al cliente elegir la modalidad de retiro en el local para llevar y corroborar el desglose de productos junto con el costo total antes de la emisión final. Como resultado, el pedido queda registrado en el sistema bajo la modalidad de recojo y se envía a la cola de preparación del restaurante.

### Pantalla: cliente-entrega-recoger

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/entrega?vista=cliente-entrega-recoger; base: /cliente/entrega; estado alternativo.
- Componente: src/app/pages/cliente/cliente-entrega-recoger/cliente-entrega-recoger.ts.
- Archivos: src/app/pages/cliente/cliente-entrega-recoger/cliente-entrega-recoger.ts, src/app/pages/cliente/cliente-entrega-recoger/cliente-entrega-recoger.html, src/app/pages/cliente/cliente-entrega-recoger/cliente-entrega-recoger.css.
- Ficha: PDF-UI-025, páginas 116; relación original: US11.

Permite al cliente seleccionar la modalidad de retiro presencial en el local y revisar el desglose final de los platos solicitados con su precio consolidado. Como resultado, el pedido se procesa bajo la modalidad de recojo en mostrador y el usuario es informado de que el sistema le notificará apenas la cocina termine la preparación.

### Pantalla: cliente-restaurante-cerrado

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/entrega?vista=cliente-restaurante-cerrado; base: /cliente/entrega; estado alternativo.
- Componente: src/app/pages/cliente/cliente-restaurante-cerrado/cliente-restaurante-cerrado.ts.
- Archivos: src/app/pages/cliente/cliente-restaurante-cerrado/cliente-restaurante-cerrado.ts, src/app/pages/cliente/cliente-restaurante-cerrado/cliente-restaurante-cerrado.html, src/app/pages/cliente/cliente-restaurante-cerrado/cliente-restaurante-cerrado.css.
- Ficha: PDF-UI-026, páginas 116, 117; relación original: US11.

Permite al cliente conocer que el restaurante se encuentra fuera de su jornada operativa y no está recibiendo órdenes, informándole el horario regular de atención establecido (09:00 a 22:00). Como resultado, el sistema restringe el envío de pedidos no permitidos y ofrece un botón de retorno a la carta para consultar los platos disponibles para el siguiente turno.

### Pantalla: cliente-pedido-creado

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/pedido?vista=cliente-pedido-creado; base: /cliente/pedido; estado alternativo.
- Componente: src/app/pages/cliente/cliente-pedido-creado/cliente-pedido-creado.ts.
- Archivos: src/app/pages/cliente/cliente-pedido-creado/cliente-pedido-creado.ts, src/app/pages/cliente/cliente-pedido-creado/cliente-pedido-creado.html, src/app/pages/cliente/cliente-pedido-creado/cliente-pedido-creado.css.
- Ficha: PDF-UI-027, páginas 117; relación original: US11.

Permite al cliente visualizar el mensaje de éxito tras el registro de su compra, mostrando el número de orden asignado (#1042), la modalidad seleccionada y el aviso de pago pendiente. Como resultado, el usuario obtiene la validación formal de que su pedido ingresó a la cola de atención y cuenta con el botón «Seguir mi pedido» para pasar al monitoreo en directo.

### Pantalla: cliente-pedidos

- Contexto: Pedidos cliente; referencia del manifiesto: US12, US13.
- URL: /cliente/pedidos; base: /cliente/pedidos; canónica.
- Componente: src/app/pages/cliente/cliente-pedidos/cliente-pedidos.ts.
- Archivos: src/app/pages/cliente/cliente-pedidos/cliente-pedidos.ts, src/app/pages/cliente/cliente-pedidos/cliente-pedidos.html, src/app/pages/cliente/cliente-pedidos/cliente-pedidos.css.
- Ficha: PDF-UI-028, páginas 117, 118; relación original: US12, US13.

Permite al cliente examinar la lista cronológica de todos los pedidos tramitados en la plataforma, visualizando el identificador, fecha, modalidad, estado actual (En preparación, Entregado, Cancelado) e importe total de cada uno. Como resultado, el usuario fiscaliza sus consumos históricos y puede acceder a la ficha pormenorizada de cualquier orden mediante el enlace «Ver pedido».

### Pantalla: cliente-pedido-detalle

- Contexto: Pedidos cliente; referencia del manifiesto: US12, US13.
- URL: /cliente/pedido; base: /cliente/pedido; canónica.
- Componente: src/app/pages/cliente/cliente-pedido-detalle/cliente-pedido-detalle.ts.
- Archivos: src/app/pages/cliente/cliente-pedido-detalle/cliente-pedido-detalle.ts, src/app/pages/cliente/cliente-pedido-detalle/cliente-pedido-detalle.html, src/app/pages/cliente/cliente-pedido-detalle/cliente-pedido-detalle.css.
- Ficha: PDF-UI-029, páginas 118, 119; relación original: US12, US13.

Permite al cliente monitorear el progreso de elaboración de su orden mediante una línea de tiempo por fases (Recibido, En preparación, Listo y Entregado), visualizando los platos elegidos y la información del restaurante. Como resultado, el usuario comprueba el estado operativo de su comida en cocina en tiempo real y dispone de un acceso directo para consultar su registro de pago.

### Pantalla: cliente-pedido-listo

- Contexto: Pedidos cliente; referencia del manifiesto: US12, US13.
- URL: /cliente/pedido?vista=cliente-pedido-listo; base: /cliente/pedido; estado alternativo.
- Componente: src/app/pages/cliente/cliente-pedido-listo/cliente-pedido-listo.ts.
- Archivos: src/app/pages/cliente/cliente-pedido-listo/cliente-pedido-listo.ts, src/app/pages/cliente/cliente-pedido-listo/cliente-pedido-listo.html, src/app/pages/cliente/cliente-pedido-listo/cliente-pedido-listo.css.
- Ficha: PDF-UI-030, páginas 119, 120; relación original: US12, US13.

Permite al cliente verificar que su orden ha culminado la fase de preparación en cocina y se encuentra lista para ser retirada en el mostrador o enviada a reparto. Como resultado, el usuario es notificado oportunamente para acercarse a recoger sus alimentos o esperar al repartidor con la certeza de que su pedido está terminado.

### Pantalla: cliente-pedido-entregado

- Contexto: Pedidos cliente; referencia del manifiesto: US11.
- URL: /cliente/pedido?vista=cliente-pedido-entregado; base: /cliente/pedido; estado alternativo.
- Componente: src/app/pages/cliente/cliente-pedido-entregado/cliente-pedido-entregado.ts.
- Archivos: src/app/pages/cliente/cliente-pedido-entregado/cliente-pedido-entregado.ts, src/app/pages/cliente/cliente-pedido-entregado/cliente-pedido-entregado.html, src/app/pages/cliente/cliente-pedido-entregado/cliente-pedido-entregado.css.
- Ficha: PDF-UI-031, páginas 120, 121; relación original: US11.

Permite al cliente corroborar el cierre exitoso del ciclo de atención de su orden al registrarse como entregada en el establecimiento. Como resultado, el usuario constata la recepción final de sus productos y mantiene disponible la información de los platos consumidos junto con el acceso a su comprobante de pago.

### Pantalla: cliente-pedido-cancelado

- Contexto: Pedidos cliente; referencia del manifiesto: US12, US13.
- URL: /cliente/pedido?vista=cliente-pedido-cancelado; base: /cliente/pedido; estado alternativo.
- Componente: src/app/pages/cliente/cliente-pedido-cancelado/cliente-pedido-cancelado.ts.
- Archivos: src/app/pages/cliente/cliente-pedido-cancelado/cliente-pedido-cancelado.ts, src/app/pages/cliente/cliente-pedido-cancelado/cliente-pedido-cancelado.html, src/app/pages/cliente/cliente-pedido-cancelado/cliente-pedido-cancelado.css.
- Ficha: PDF-UI-032, páginas 121, 122; relación original: US12, US13.

Permite al cliente consultar el estado de una orden que fue anulada por el establecimiento o por solicitud del usuario, mostrando la insignia destacada de cancelación junto al desglose de los platos solicitados. Como resultado, el cliente dispone del registro formal de la anulación del servicio y puede verificar la información del local o los registros de pago correspondientes.

### Pantalla: cliente-pago

- Contexto: Pagos; referencia del manifiesto: US12, US18.
- URL: /cliente/pago; base: /cliente/pago; canónica.
- Componente: src/app/pages/cliente/cliente-pago/cliente-pago.ts.
- Archivos: src/app/pages/cliente/cliente-pago/cliente-pago.ts, src/app/pages/cliente/cliente-pago/cliente-pago.html, src/app/pages/cliente/cliente-pago/cliente-pago.css.
- Ficha: PDF-UI-033, páginas 122, 123; relación original: US12, US18.

Permite al cliente consultar la constancia del pago registrado por el establecimiento para su orden, visualizando el monto abonado (S/ 66.00), el método empleado (Yape) y el número de operación o referencia. Como resultado, el usuario obtiene el respaldo transparente de que su pedido figura como pagado en el sistema sin necesidad de intermediación de pasarelas de pago.

### Pantalla: cliente-pago-pendiente

- Contexto: Pagos; referencia del manifiesto: US12, US18.
- URL: /cliente/pago?vista=cliente-pago-pendiente; base: /cliente/pago; estado alternativo.
- Componente: src/app/pages/cliente/cliente-pago-pendiente/cliente-pago-pendiente.ts.
- Archivos: src/app/pages/cliente/cliente-pago-pendiente/cliente-pago-pendiente.ts, src/app/pages/cliente/cliente-pago-pendiente/cliente-pago-pendiente.html, src/app/pages/cliente/cliente-pago-pendiente/cliente-pago-pendiente.css.
- Ficha: PDF-UI-034, páginas 123; relación original: US12, US18.

Permite al cliente comprobar que el cobro de su orden aún no ha sido asentado por el restaurante, mostrándole el importe total por regularizar y la indicación de coordinar el pago con el personal. Como resultado, el usuario permanece al tanto del saldo adeudado y comprende que el estado se actualizará una vez que el personal registre la recepción del dinero.

### Pantalla: cliente-reservar

- Contexto: Reservas cliente; referencia del manifiesto: US05.
- URL: /cliente/reservar; base: /cliente/reservar; canónica.
- Componente: src/app/pages/cliente/cliente-reservar/cliente-reservar.ts.
- Archivos: src/app/pages/cliente/cliente-reservar/cliente-reservar.ts, src/app/pages/cliente/cliente-reservar/cliente-reservar.html, src/app/pages/cliente/cliente-reservar/cliente-reservar.css.
- Ficha: PDF-UI-039, páginas 126, 127; relación original: US05.

Permite al cliente definir los parámetros de su visita seleccionando la fecha, el intervalo de horas (inicio y fin) y la cantidad de comensales requerida para su atención. Como resultado, el sistema valida los criterios ingresados y activa el botón «Buscar mesas» para consultar la disponibilidad gráfica del establecimiento.

### Pantalla: cliente-plano

- Contexto: Reservas cliente; referencia del manifiesto: US05.
- URL: /cliente/plano; base: /cliente/plano; canónica.
- Componente: src/app/pages/cliente/cliente-plano/cliente-plano.ts.
- Archivos: src/app/pages/cliente/cliente-plano/cliente-plano.ts, src/app/pages/cliente/cliente-plano/cliente-plano.html, src/app/pages/cliente/cliente-plano/cliente-plano.css.
- Ficha: PDF-UI-040, páginas 127, 128; relación original: US05.

Permite al cliente interactuar con el plano visual del salón para explorar la distribución física de los espacios y seleccionar una mesa disponible según su capacidad. Como resultado, el usuario confirma la ubicación elegida (Mesa 04 para 4 personas) y avanza en el flujo pulsando el botón «Continuar con esta mesa».

### Pantalla: cliente-sin-disponibilidad

- Contexto: Reservas cliente; referencia del manifiesto: US05.
- URL: /cliente/reservar?vista=cliente-sin-disponibilidad; base: /cliente/reservar; estado alternativo.
- Componente: src/app/pages/cliente/cliente-sin-disponibilidad/cliente-sin-disponibilidad.ts.
- Archivos: src/app/pages/cliente/cliente-sin-disponibilidad/cliente-sin-disponibilidad.ts, src/app/pages/cliente/cliente-sin-disponibilidad/cliente-sin-disponibilidad.html, src/app/pages/cliente/cliente-sin-disponibilidad/cliente-sin-disponibilidad.css.
- Ficha: PDF-UI-041, páginas 128, 129; relación original: US05.

Permite al cliente comprobar la falta de mesas libres para el número de comensales en el turno consultado, mostrando una alerta explicativa y el plano con las mesas inhabilitadas. Como resultado, el sistema evita solapamientos y reservas fuera de capacidad, orientando al usuario a reprogramar su visita mediante el botón «Cambiar horario».

### Pantalla: cliente-reservas-deshabilitadas

- Contexto: Reservas cliente; referencia del manifiesto: US27.
- URL: /cliente/reservar?vista=cliente-reservas-deshabilitadas; base: /cliente/reservar; estado alternativo.
- Componente: src/app/pages/cliente/cliente-reservas-deshabilitadas/cliente-reservas-deshabilitadas.ts.
- Archivos: src/app/pages/cliente/cliente-reservas-deshabilitadas/cliente-reservas-deshabilitadas.ts, src/app/pages/cliente/cliente-reservas-deshabilitadas/cliente-reservas-deshabilitadas.html, src/app/pages/cliente/cliente-reservas-deshabilitadas/cliente-reservas-deshabilitadas.css.
- Ficha: PDF-UI-042, páginas 129; relación original: US27.

Permite al cliente ser notificado cuando el restaurante ha desactivado temporalmente la recepción de reservas en línea por motivos de capacidad u horarios operativos. Como resultado, el usuario es informado oportunamente sobre la pausa del servicio y dispone de un botón directo para explorar la carta y realizar pedidos.

### Pantalla: cliente-reserva-revisar

- Contexto: Reservas cliente; referencia del manifiesto: US06.
- URL: /cliente/reserva/revisar; base: /cliente/reserva/revisar; canónica.
- Componente: src/app/pages/cliente/cliente-reserva-revisar/cliente-reserva-revisar.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-revisar/cliente-reserva-revisar.ts, src/app/pages/cliente/cliente-reserva-revisar/cliente-reserva-revisar.html, src/app/pages/cliente/cliente-reserva-revisar/cliente-reserva-revisar.css.
- Ficha: PDF-UI-043, páginas 129, 130; relación original: US06.

Permite al cliente verificar el desglose completo de su visita antes de emitirla, añadir notas especiales para el local y conocer las condiciones de cancelación anticipada (2 horas) y tolerancia de llegada (15 minutos). Como resultado, el usuario tramita su solicitud en estado pendiente de aprobación mediante el botón «Solicitar reserva».

### Pantalla: cliente-reservas

- Contexto: Reservas cliente; referencia del manifiesto: US07.
- URL: /cliente/reservas; base: /cliente/reservas; canónica.
- Componente: src/app/pages/cliente/cliente-reservas/cliente-reservas.ts.
- Archivos: src/app/pages/cliente/cliente-reservas/cliente-reservas.ts, src/app/pages/cliente/cliente-reservas/cliente-reservas.html, src/app/pages/cliente/cliente-reservas/cliente-reservas.css.
- Ficha: PDF-UI-044, páginas 130; relación original: US07.

Permite al cliente consultar el listado histórico y vigente de todas sus reservas de mesa, detallando el código, fecha y hora, mesa asignada, cantidad de comensales y el estado operativo actual (Confirmada, Pendiente, Completada, Expirada). Como resultado, el usuario fiscaliza sus citas programadas y puede ingresar al seguimiento específico de cualquier reserva pulsando el enlace «Ver reserva».

### Pantalla: cliente-reserva-pendiente

- Contexto: Reservas cliente; referencia del manifiesto: US07.
- URL: /cliente/reserva; base: /cliente/reserva; canónica.
- Componente: src/app/pages/cliente/cliente-reserva-pendiente/cliente-reserva-pendiente.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-pendiente/cliente-reserva-pendiente.ts, src/app/pages/cliente/cliente-reserva-pendiente/cliente-reserva-pendiente.html, src/app/pages/cliente/cliente-reserva-pendiente/cliente-reserva-pendiente.css.
- Ficha: PDF-UI-045, páginas 130, 131; relación original: US07.

Permite al cliente revisar la ficha de una solicitud de mesa que se encuentra en proceso de revisión por parte del restaurante, mostrando el resumen de la visita, las notas registradas y el mapa del local. Como resultado, el usuario confirma que su solicitud está en cola de atención y dispone de los botones para «Reprogramar» o «Cancelar reserva» en caso de requerir modificaciones.

### Pantalla: cliente-reserva-confirmada

- Contexto: Reservas cliente; referencia del manifiesto: US07.
- URL: /cliente/reserva?vista=cliente-reserva-confirmada; base: /cliente/reserva; estado alternativo.
- Componente: src/app/pages/cliente/cliente-reserva-confirmada/cliente-reserva-confirmada.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-confirmada/cliente-reserva-confirmada.ts, src/app/pages/cliente/cliente-reserva-confirmada/cliente-reserva-confirmada.html, src/app/pages/cliente/cliente-reserva-confirmada/cliente-reserva-confirmada.css.
- Ficha: PDF-UI-046, páginas 131, 132; relación original: US07.

Permite al cliente constatar la aprobación formal de su reserva por parte del establecimiento, visualizando los detalles de la visita y la regla de tolerancia de llegada de 15 minutos previa a la expiración. Como resultado, el comensal obtiene la certeza de su espacio asegurado en el salón y conserva la facultad de reprogramar o cancelar anticipadamente si surge algún imprevisto.

### Pantalla: cliente-reserva-rechazada

- Contexto: Reservas cliente; referencia del manifiesto: US07.
- URL: /cliente/reserva?vista=cliente-reserva-rechazada; base: /cliente/reserva; estado alternativo.
- Componente: src/app/pages/cliente/cliente-reserva-rechazada/cliente-reserva-rechazada.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-rechazada/cliente-reserva-rechazada.ts, src/app/pages/cliente/cliente-reserva-rechazada/cliente-reserva-rechazada.html, src/app/pages/cliente/cliente-reserva-rechazada/cliente-reserva-rechazada.css.
- Ficha: PDF-UI-047, páginas 132, 133; relación original: US07.

Permite al cliente informarse sobre la desestimación de su solicitud de mesa, visualizando el motivo específico ingresado por la administración (por ejemplo, salón reservado para evento privado). Como resultado, el usuario comprende la causa del rechazo de forma transparente y cuenta con el botón «Hacer otra reserva» para buscar disponibilidad en otro turno.

### Pantalla: cliente-reserva-cancelada

- Contexto: Reservas cliente; referencia del manifiesto: US07.
- URL: /cliente/reserva?vista=cliente-reserva-cancelada; base: /cliente/reserva; estado alternativo.
- Componente: src/app/pages/cliente/cliente-reserva-cancelada/cliente-reserva-cancelada.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-cancelada/cliente-reserva-cancelada.ts, src/app/pages/cliente/cliente-reserva-cancelada/cliente-reserva-cancelada.html, src/app/pages/cliente/cliente-reserva-cancelada/cliente-reserva-cancelada.css.
- Ficha: PDF-UI-048, páginas 133, 134; relación original: US07.

Permite al cliente consultar la constancia de anulación de una reserva, informándole que la mesa ha quedado liberada nuevamente para el horario seleccionado. Como resultado, el usuario valida que el compromiso de atención fue cancelado correctamente y dispone del botón «Hacer otra reserva» para planificar una nueva visita.

### Pantalla: cliente-reserva-expirada

- Contexto: Reservas cliente; referencia del manifiesto: US07, US26.
- URL: /cliente/reserva?vista=cliente-reserva-expirada; base: /cliente/reserva; estado alternativo.
- Componente: src/app/pages/cliente/cliente-reserva-expirada/cliente-reserva-expirada.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-expirada/cliente-reserva-expirada.ts, src/app/pages/cliente/cliente-reserva-expirada/cliente-reserva-expirada.html, src/app/pages/cliente/cliente-reserva-expirada/cliente-reserva-expirada.css.
- Ficha: PDF-UI-049, páginas 134, 135; relación original: US07, US26.

Permite al cliente informarse sobre la caducidad automática de su reserva tras superarse la tolerancia de llegada de 15 minutos o por falta de confirmación oportuna. Como resultado, el usuario constata que la mesa fue liberada para otros comensales y dispone del botón «Hacer otra reserva» para agendar una nueva visita.

### Pantalla: cliente-reserva-completada

- Contexto: Reservas cliente; referencia del manifiesto: US07, US25.
- URL: /cliente/reserva?vista=cliente-reserva-completada; base: /cliente/reserva; estado alternativo.
- Componente: src/app/pages/cliente/cliente-reserva-completada/cliente-reserva-completada.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-completada/cliente-reserva-completada.ts, src/app/pages/cliente/cliente-reserva-completada/cliente-reserva-completada.html, src/app/pages/cliente/cliente-reserva-completada/cliente-reserva-completada.css.
- Ficha: PDF-UI-050, páginas 135, 136; relación original: US07, US25.

Permite al cliente revisar la constancia histórica de una reserva que fue atendida y concluida con éxito en el restaurante. Como resultado, el usuario verifica el registro conforme de su visita presencial y mantiene habilitado el botón «Hacer otra reserva» para programar futuros encuentros.

### Pantalla: cliente-reserva-editar

- Contexto: Reservas cliente; referencia del manifiesto: US08.
- URL: /cliente/reserva/editar; base: /cliente/reserva/editar; canónica.
- Componente: src/app/pages/cliente/cliente-reserva-editar/cliente-reserva-editar.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-editar/cliente-reserva-editar.ts, src/app/pages/cliente/cliente-reserva-editar/cliente-reserva-editar.html, src/app/pages/cliente/cliente-reserva-editar/cliente-reserva-editar.css.
- Ficha: PDF-UI-051, páginas 136, 137; relación original: US08.

Permite al cliente modificar la fecha, el intervalo de horas, el número de personas o las notas de una reserva activa sin cambiar de restaurante, advirtiéndole que la solicitud volverá al estado pendiente. Como resultado, el usuario tramita la actualización de su horario mediante el botón «Solicitar cambio» para una nueva evaluación del establecimiento.

### Pantalla: cliente-reserva-cancelar

- Contexto: Reservas cliente; referencia del manifiesto: US09.
- URL: /cliente/reserva/cancelar; base: /cliente/reserva/cancelar; canónica.
- Componente: src/app/pages/cliente/cliente-reserva-cancelar/cliente-reserva-cancelar.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-cancelar/cliente-reserva-cancelar.ts, src/app/pages/cliente/cliente-reserva-cancelar/cliente-reserva-cancelar.html, src/app/pages/cliente/cliente-reserva-cancelar/cliente-reserva-cancelar.css, src/app/dialogs/cliente-reserva-cancelar/cliente-reserva-cancelar-dialog.ts, src/app/dialogs/cliente-reserva-cancelar/cliente-reserva-cancelar-dialog.html, src/app/dialogs/cliente-reserva-cancelar/cliente-reserva-cancelar-dialog.css.
- Ficha: PDF-UI-052, páginas 137; relación original: US09.

Permite al cliente confirmar la anulación voluntaria de su reserva de mesa e ingresar un motivo opcional que justifique la cancelación. Como resultado, el usuario libera el espacio asignado en el salón mediante el botón «Sí, cancelar reserva» para que quede disponible para otros comensales.

### Pantalla: cliente-reserva-cancelacion-bloqueada

- Contexto: Reservas cliente; referencia del manifiesto: US09.
- URL: /cliente/reserva/cancelar?vista=cliente-reserva-cancelacion-bloqueada; base: /cliente/reserva/cancelar; estado alternativo.
- Componente: src/app/pages/cliente/cliente-reserva-cancelacion-bloqueada/cliente-reserva-cancelacion-bloqueada.ts.
- Archivos: src/app/pages/cliente/cliente-reserva-cancelacion-bloqueada/cliente-reserva-cancelacion-bloqueada.ts, src/app/pages/cliente/cliente-reserva-cancelacion-bloqueada/cliente-reserva-cancelacion-bloqueada.html, src/app/pages/cliente/cliente-reserva-cancelacion-bloqueada/cliente-reserva-cancelacion-bloqueada.css.
- Ficha: PDF-UI-053, páginas 137, 138; relación original: US09.

Permite al cliente visualizar el bloqueo de la anulación digital cuando restan 2 horas o menos para el inicio de la reserva, en cumplimiento de la política de anticipación mínima del restaurante. Como resultado, el sistema restringe la cancelación autónoma y le indica al usuario que debe comunicarse telefónicamente con recepción para resolver su caso.

### Pantalla: cliente-notificaciones

- Contexto: Notificaciones; referencia del manifiesto: US28.
- URL: /cliente/notificaciones; base: /cliente/notificaciones; canónica.
- Componente: src/app/pages/cliente/cliente-notificaciones/cliente-notificaciones.ts.
- Archivos: src/app/pages/cliente/cliente-notificaciones/cliente-notificaciones.ts, src/app/pages/cliente/cliente-notificaciones/cliente-notificaciones.html, src/app/pages/cliente/cliente-notificaciones/cliente-notificaciones.css.
- Ficha: PDF-UI-054, páginas 138, 139; relación original: US28.

Permite al cliente consultar el historial de avisos y novedades sobre el estado de sus pedidos y reservas en tiempo real (como pedidos listos para recojo o reservas confirmadas y completadas). Como resultado, el usuario se mantiene al tanto del progreso de sus atenciones y cuenta con enlaces directos («Ver detalle») para navegar hacia la ficha específica de cada transacción.

### Pantalla: cliente-notificaciones-vacio

- Contexto: Notificaciones; referencia del manifiesto: US28.
- URL: /cliente/notificaciones?vista=cliente-notificaciones-vacio; base: /cliente/notificaciones; estado alternativo.
- Componente: src/app/pages/cliente/cliente-notificaciones-vacio/cliente-notificaciones-vacio.ts.
- Archivos: src/app/pages/cliente/cliente-notificaciones-vacio/cliente-notificaciones-vacio.ts, src/app/pages/cliente/cliente-notificaciones-vacio/cliente-notificaciones-vacio.html, src/app/pages/cliente/cliente-notificaciones-vacio/cliente-notificaciones-vacio.css.
- Ficha: PDF-UI-055, páginas 139; relación original: US28.

Permite al cliente visualizar el estado inicial o vacío de su bandeja cuando no tiene alertas pendientes ni actualizaciones de pedidos o reservas activas. Como resultado, el usuario corrobora de manera clara que su cuenta está al día sin requerir gestiones inmediatas y dispone del botón «Volver al inicio» para retornar a la pantalla principal.

### Pantalla: op-inicio

- Contexto: Operación; referencia del manifiesto: Vista de acceso a módulos operativos.
- URL: /operacion; base: /operacion; canónica.
- Componente: src/app/pages/operacion/op-inicio/op-inicio.ts.
- Archivos: src/app/pages/operacion/op-inicio/op-inicio.ts, src/app/pages/operacion/op-inicio/op-inicio.html, src/app/pages/operacion/op-inicio/op-inicio.css.
- Ficha: PDF-UI-057, páginas 140, 141; relación original: Vista de acceso a módulos operativos.

Permite al administrador o personal operativo monitorear el pulso diario del restaurante en tiempo real mediante métricas clave (pagos recaudados, pedidos despachados, reservas completadas y porcentaje de ocupación), una gráfica horaria de demanda, accesos directos de gestión y la cola de atención activa. Como resultado, el usuario visualiza el estado integral del servicio en una sola pantalla y puede derivar rápidamente las acciones hacia cocina, salón o cobros.

### Pantalla: dueno-inicio

- Contexto: Dueño; referencia del manifiesto: US21.
- URL: /dueno; base: /dueno; canónica.
- Componente: src/app/pages/dueno/dueno-inicio/dueno-inicio.ts.
- Archivos: src/app/pages/dueno/dueno-inicio/dueno-inicio.ts, src/app/pages/dueno/dueno-inicio/dueno-inicio.html, src/app/pages/dueno/dueno-inicio/dueno-inicio.css.
- Ficha: PDF-UI-009, páginas 105; relación original: US21.

Panel principal o vista general del dueño. Presenta métricas consolidadas del restaurante (pagos confirmados, pedidos atendidos, reservas completadas y porcentaje de ocupación de mesas), accesos rápidos para revisar la configuración del servicio y un botón directo para "Incorporar administrador".

### Pantalla: op-categorias

- Contexto: Carta; referencia del manifiesto: US23.
- URL: /operacion/categorias; base: /operacion/categorias; canónica.
- Componente: src/app/pages/operacion/op-categorias/op-categorias.ts.
- Archivos: src/app/pages/operacion/op-categorias/op-categorias.ts, src/app/pages/operacion/op-categorias/op-categorias.html, src/app/pages/operacion/op-categorias/op-categorias.css.
- Ficha: PDF-UI-058, páginas 141, 142; relación original: US23.

Permite al administrador consultar el listado de categorías que organizan la oferta gastronómica del local (como Platos de fondo, Entradas y Bebidas) con sus respectivas descripciones. Como resultado, el usuario supervisa la estructura de su menú y dispone de acciones directas para editar, eliminar o crear nuevas secciones mediante el botón «+ Nueva categoría».

### Pantalla: op-categoria-nueva

- Contexto: Carta; referencia del manifiesto: US23.
- URL: /operacion/categoria/nueva; base: /operacion/categoria/nueva; canónica.
- Componente: src/app/pages/operacion/op-categoria-nueva/op-categoria-nueva.ts.
- Archivos: src/app/pages/operacion/op-categoria-nueva/op-categoria-nueva.ts, src/app/pages/operacion/op-categoria-nueva/op-categoria-nueva.html, src/app/pages/operacion/op-categoria-nueva/op-categoria-nueva.css.
- Ficha: PDF-UI-059, páginas 142; relación original: US23.

Permite al administrador incorporar una nueva clasificación para la carta del restaurante ingresando su nombre y una descripción orientativa para los comensales. Como resultado, la nueva categoría queda almacenada y asignada al establecimiento al pulsar «Guardar categoría» para comenzar a asociarle platos.

### Pantalla: op-categoria-editar

- Contexto: Carta; referencia del manifiesto: US23.
- URL: /operacion/categoria/editar; base: /operacion/categoria/editar; canónica.
- Componente: src/app/pages/operacion/op-categoria-editar/op-categoria-editar.ts.
- Archivos: src/app/pages/operacion/op-categoria-editar/op-categoria-editar.ts, src/app/pages/operacion/op-categoria-editar/op-categoria-editar.html, src/app/pages/operacion/op-categoria-editar/op-categoria-editar.css.
- Ficha: PDF-UI-060, páginas 142, 143; relación original: US23.

Permite al administrador modificar los datos descriptivos o el título de una categoría existente de su restaurante para mantener actualizada la carta. Como resultado, los cambios se aplican de inmediato en la presentación del menú mediante el botón «Guardar categoría» sin romper la relación con los productos asociados.

### Pantalla: op-categoria-eliminar

- Contexto: Carta; referencia del manifiesto: US23.
- URL: /operacion/categoria/eliminar; base: /operacion/categoria/eliminar; canónica.
- Componente: src/app/pages/operacion/op-categoria-eliminar/op-categoria-eliminar.ts.
- Archivos: src/app/pages/operacion/op-categoria-eliminar/op-categoria-eliminar.ts, src/app/pages/operacion/op-categoria-eliminar/op-categoria-eliminar.html, src/app/pages/operacion/op-categoria-eliminar/op-categoria-eliminar.css, src/app/dialogs/op-categoria-eliminar/op-categoria-eliminar-dialog.ts, src/app/dialogs/op-categoria-eliminar/op-categoria-eliminar-dialog.html, src/app/dialogs/op-categoria-eliminar/op-categoria-eliminar-dialog.css.
- Ficha: PDF-UI-061, páginas 143, 144; relación original: US23.

Permite al personal administrativo confirmar la remoción de una categoría mediante un diálogo de confirmación que advierte sobre posibles platos vinculados. Como resultado, el sistema previene la pérdida accidental de datos y solo ejecuta la baja en el catálogo si el usuario reitera la acción pulsando el botón «Eliminar categoría».

### Pantalla: op-platos

- Contexto: Carta; referencia del manifiesto: US14.
- URL: /operacion/platos; base: /operacion/platos; canónica.
- Componente: src/app/pages/operacion/op-platos/op-platos.ts.
- Archivos: src/app/pages/operacion/op-platos/op-platos.ts, src/app/pages/operacion/op-platos/op-platos.html, src/app/pages/operacion/op-platos/op-platos.css.
- Ficha: PDF-UI-062, páginas 144; relación original: US14.

Permite al administrador inspeccionar el catálogo de platos del restaurante, mostrando para cada uno su categoría, precio, nivel de complejidad culinaria, tiempo de preparación y estado de disponibilidad. Como resultado, el usuario fiscaliza la oferta activa del menú y cuenta con opciones para editar, pausar platos agotados o registrar nuevos productos mediante «+ Añadir plato».

### Pantalla: op-plato-nuevo

- Contexto: Carta; referencia del manifiesto: US14.
- URL: /operacion/plato/nuevo; base: /operacion/plato/nuevo; canónica.
- Componente: src/app/pages/operacion/op-plato-nuevo/op-plato-nuevo.ts.
- Archivos: src/app/pages/operacion/op-plato-nuevo/op-plato-nuevo.ts, src/app/pages/operacion/op-plato-nuevo/op-plato-nuevo.html, src/app/pages/operacion/op-plato-nuevo/op-plato-nuevo.css.
- Ficha: PDF-UI-063, páginas 144, 145; relación original: US14.

Permite al administrador dar de alta un nuevo plato en la carta completando su denominación, categoría, precio, nivel de complejidad culinaria, tiempo estimado de cocina (5 a 15 minutos), ingredientes y alérgenos. Como resultado, el producto queda registrado en el catálogo del restaurante y listo para ser ofrecido a los comensales mediante el botón «Guardar plato».

### Pantalla: op-plato-editar

- Contexto: Carta; referencia del manifiesto: US14.
- URL: /operacion/plato/editar; base: /operacion/plato/editar; canónica.
- Componente: src/app/pages/operacion/op-plato-editar/op-plato-editar.ts.
- Archivos: src/app/pages/operacion/op-plato-editar/op-plato-editar.ts, src/app/pages/operacion/op-plato-editar/op-plato-editar.html, src/app/pages/operacion/op-plato-editar/op-plato-editar.css.
- Ficha: PDF-UI-064, páginas 145, 146; relación original: US14.

Permite al administrador modificar los datos técnicos, precio, tiempos de preparación o alérgenos de un plato existente, ofreciendo además un acceso directo para darlo de baja. Como resultado, la información comercial del plato se actualiza en la carta de manera inmediata tras pulsar «Guardar plato», manteniendo la trazabilidad histórica de pedidos previos.

### Pantalla: op-plato-disponibilidad

- Contexto: Carta; referencia del manifiesto: US14.
- URL: /operacion/plato/disponibilidad; base: /operacion/plato/disponibilidad; canónica.
- Componente: src/app/pages/operacion/op-plato-disponibilidad/op-plato-disponibilidad.ts.
- Archivos: src/app/pages/operacion/op-plato-disponibilidad/op-plato-disponibilidad.ts, src/app/pages/operacion/op-plato-disponibilidad/op-plato-disponibilidad.html, src/app/pages/operacion/op-plato-disponibilidad/op-plato-disponibilidad.css, src/app/dialogs/op-plato-disponibilidad/op-plato-disponibilidad-dialog.ts, src/app/dialogs/op-plato-disponibilidad/op-plato-disponibilidad-dialog.html, src/app/dialogs/op-plato-disponibilidad/op-plato-disponibilidad-dialog.css.
- Ficha: PDF-UI-065, páginas 146, 147; relación original: US14.

Permite al personal administrativo pausar la disponibilidad de un plato cuando se agotan sus insumos en cocina sin necesidad de borrarlo del menú. Como resultado, el ítem se mantiene visible en la carta con la etiqueta de no disponible y bloquea la posibilidad de que los clientes lo añadan a sus órdenes al confirmar con «Pausar disponibilidad».

### Pantalla: op-plato-eliminar

- Contexto: Carta; referencia del manifiesto: US14.
- URL: /operacion/plato/eliminar; base: /operacion/plato/eliminar; canónica.
- Componente: src/app/pages/operacion/op-plato-eliminar/op-plato-eliminar.ts.
- Archivos: src/app/pages/operacion/op-plato-eliminar/op-plato-eliminar.ts, src/app/pages/operacion/op-plato-eliminar/op-plato-eliminar.html, src/app/pages/operacion/op-plato-eliminar/op-plato-eliminar.css, src/app/dialogs/op-plato-eliminar/op-plato-eliminar-dialog.ts, src/app/dialogs/op-plato-eliminar/op-plato-eliminar-dialog.html, src/app/dialogs/op-plato-eliminar/op-plato-eliminar-dialog.css.
- Ficha: PDF-UI-066, páginas 147; relación original: US14.

Permite al administrador confirmar la eliminación definitiva de un plato del catálogo, informándole que las órdenes previas preservarán el precio y nombre históricos y recomendando la pausa si se trata de una falta temporal. Como resultado, el sistema retira el producto de la oferta gastronómica al presionar el botón «Eliminar plato».

### Pantalla: op-pedidos

- Contexto: Pedidos operación; referencia del manifiesto: US12, US15.
- URL: /operacion/pedidos; base: /operacion/pedidos; canónica.
- Componente: src/app/pages/operacion/op-pedidos/op-pedidos.ts.
- Archivos: src/app/pages/operacion/op-pedidos/op-pedidos.ts, src/app/pages/operacion/op-pedidos/op-pedidos.html, src/app/pages/operacion/op-pedidos/op-pedidos.css.
- Ficha: PDF-UI-067, páginas 147, 148; relación original: US12, US15.

Permite al administrador o personal de servicio supervisar la cola de trabajo activa del restaurante (órdenes en estado pendiente y en preparación), detallando el código, cliente, modalidad de entrega, estado e importe. Como resultado, el equipo monitorea el volumen de atención en curso y puede ingresar a la gestión individual de cualquier comanda pulsando «Gestionar».

### Pantalla: op-cocina

- Contexto: Pedidos operación; referencia del manifiesto: US15.
- URL: /operacion/cocina; base: /operacion/cocina; canónica.
- Componente: src/app/pages/operacion/op-cocina/op-cocina.ts.
- Archivos: src/app/pages/operacion/op-cocina/op-cocina.ts, src/app/pages/operacion/op-cocina/op-cocina.html, src/app/pages/operacion/op-cocina/op-cocina.css.
- Ficha: PDF-UI-068, páginas 148, 149; relación original: US15.

Permite al equipo de cocina visualizar las comandas organizadas en un tablero Kanban priorizado automáticamente según la complejidad del plato (Alta, Media, Baja), el tiempo de elaboración y la antigüedad del pedido. Como resultado, los cocineros optimizan el orden de preparación y actualizan el flujo de trabajo mediante los botones «Iniciar preparación» y «Marcar listo».

### Pantalla: op-pedido-detalle

- Contexto: Pedidos operación; referencia del manifiesto: US12, US15.
- URL: /operacion/pedido; base: /operacion/pedido; canónica.
- Componente: src/app/pages/operacion/op-pedido-detalle/op-pedido-detalle.ts.
- Archivos: src/app/pages/operacion/op-pedido-detalle/op-pedido-detalle.ts, src/app/pages/operacion/op-pedido-detalle/op-pedido-detalle.html, src/app/pages/operacion/op-pedido-detalle/op-pedido-detalle.css.
- Ficha: PDF-UI-069, páginas 149, 150; relación original: US12, US15.

Permite al personal operativo examinar la ficha completa de un pedido en estado pendiente, comprobando el desglose de platos, costos unitarios, modalidad de servicio, hora de solicitud y estado del cobro. Como resultado, el operador mantiene el control de la orden y puede dar inicio a su elaboración en cocina pulsando el botón «Iniciar preparación».

### Pantalla: op-pedido-listo

- Contexto: Pedidos operación; referencia del manifiesto: US19.
- URL: /operacion/pedido/listo; base: /operacion/pedido/listo; canónica.
- Componente: src/app/pages/operacion/op-pedido-listo/op-pedido-listo.ts.
- Archivos: src/app/pages/operacion/op-pedido-listo/op-pedido-listo.ts, src/app/pages/operacion/op-pedido-listo/op-pedido-listo.html, src/app/pages/operacion/op-pedido-listo/op-pedido-listo.css.
- Ficha: PDF-UI-070, páginas 150, 151; relación original: US19.

Permite al personal registrar el avance de un pedido en proceso de cocción e indicar que los platos han culminado su preparación física. Como resultado, el estado de la comanda cambia a listo mediante el botón «Marcar como listo», notificando en tiempo real al comensal o al personal de despacho.

### Pantalla: op-pedido-entregar

- Contexto: Pedidos operación; referencia del manifiesto: US19.
- URL: /operacion/pedido/entregar; base: /operacion/pedido/entregar; canónica.
- Componente: src/app/pages/operacion/op-pedido-entregar/op-pedido-entregar.ts.
- Archivos: src/app/pages/operacion/op-pedido-entregar/op-pedido-entregar.ts, src/app/pages/operacion/op-pedido-entregar/op-pedido-entregar.html, src/app/pages/operacion/op-pedido-entregar/op-pedido-entregar.css.
- Ficha: PDF-UI-071, páginas 151; relación original: US19.

Permite al personal de salón o entrega constatar que los alimentos están listos para ser despachados y asentar la entrega formal al cliente en mostrador, mesa o repartidor de delivery. Como resultado, el usuario confirma la finalización del servicio mediante el botón «Registrar entrega», cerrando el ciclo operativo del pedido.

### Pantalla: op-pedido-entregado

- Contexto: Pedidos operación; referencia del manifiesto: US19.
- URL: /operacion/pedido?vista=op-pedido-entregado; base: /operacion/pedido; estado alternativo.
- Componente: src/app/pages/operacion/op-pedido-entregado/op-pedido-entregado.ts.
- Archivos: src/app/pages/operacion/op-pedido-entregado/op-pedido-entregado.ts, src/app/pages/operacion/op-pedido-entregado/op-pedido-entregado.html, src/app/pages/operacion/op-pedido-entregado/op-pedido-entregado.css.
- Ficha: PDF-UI-072, páginas 151, 152; relación original: US19.

Permite al personal operativo auditar la ficha de una comanda cuya atención ha concluido exitosamente tras asentarse la entrega física de los alimentos. Como resultado, el usuario corrobora el cierre operativo del servicio y dispone de accesos directos para regresar a la cola de trabajo mediante «Volver a la cola» o proceder con el cobro si el pago estuviese pendiente.

### Pantalla: op-pedido-editar

- Contexto: Pedidos operación; referencia del manifiesto: US24.
- URL: /operacion/pedido/editar; base: /operacion/pedido/editar; canónica.
- Componente: src/app/pages/operacion/op-pedido-editar/op-pedido-editar.ts.
- Archivos: src/app/pages/operacion/op-pedido-editar/op-pedido-editar.ts, src/app/pages/operacion/op-pedido-editar/op-pedido-editar.html, src/app/pages/operacion/op-pedido-editar/op-pedido-editar.css.
- Ficha: PDF-UI-073, páginas 152, 153; relación original: US24.

Permite al administrador ajustar las cantidades de platos, modalidad de servicio, mesa asignada o dirección de despacho de una orden que permanece en estado pendiente y no pagada. Como resultado, los cambios se actualizan en el sistema al pulsar «Guardar pedido», recalculando los importes correspondientes antes de que la cocina inicie la preparación.

### Pantalla: op-pedido-cancelar

- Contexto: Pedidos operación; referencia del manifiesto: US24.
- URL: /operacion/pedido/cancelar; base: /operacion/pedido/cancelar; canónica.
- Componente: src/app/pages/operacion/op-pedido-cancelar/op-pedido-cancelar.ts.
- Archivos: src/app/pages/operacion/op-pedido-cancelar/op-pedido-cancelar.ts, src/app/pages/operacion/op-pedido-cancelar/op-pedido-cancelar.html, src/app/pages/operacion/op-pedido-cancelar/op-pedido-cancelar.css, src/app/dialogs/op-pedido-cancelar/op-pedido-cancelar-dialog.ts, src/app/dialogs/op-pedido-cancelar/op-pedido-cancelar-dialog.html, src/app/dialogs/op-pedido-cancelar/op-pedido-cancelar-dialog.css.
- Ficha: PDF-UI-074, páginas 153; relación original: US24.

Permite al administrador confirmar la anulación controlada de una orden en estado pendiente que no ha sido pagada, advirtiendo que el registro conservará su historial sin borrarse físicamente. Como resultado, el sistema actualiza el estado a cancelado al pulsar «Cancelar pedido», retirándolo de la cola de preparación sin comprometer los datos de auditoría.

### Pantalla: op-pedido-bloqueado

- Contexto: Pedidos operación; referencia del manifiesto: US24.
- URL: /operacion/pedido/editar?vista=op-pedido-bloqueado; base: /operacion/pedido/editar; estado alternativo.
- Componente: src/app/pages/operacion/op-pedido-bloqueado/op-pedido-bloqueado.ts.
- Archivos: src/app/pages/operacion/op-pedido-bloqueado/op-pedido-bloqueado.ts, src/app/pages/operacion/op-pedido-bloqueado/op-pedido-bloqueado.html, src/app/pages/operacion/op-pedido-bloqueado/op-pedido-bloqueado.css.
- Ficha: PDF-UI-075, páginas 153, 154; relación original: US24.

Permite al personal visualizar la restricción de seguridad que bloquea cualquier intento de edición o cancelación sobre una orden que ya tiene un pago registrado y confirmado. Como resultado, el sistema protege la inmutabilidad financiera del cobro y orienta al usuario a revisar el comprobante mediante «Consultar pago» o retornar a la lista de pedidos.

### Pantalla: op-pago-buscar

- Contexto: Pagos; referencia del manifiesto: US18.
- URL: /operacion/pagos; base: /operacion/pagos; canónica.
- Componente: src/app/pages/operacion/op-pago-buscar/op-pago-buscar.ts.
- Archivos: src/app/pages/operacion/op-pago-buscar/op-pago-buscar.ts, src/app/pages/operacion/op-pago-buscar/op-pago-buscar.html, src/app/pages/operacion/op-pago-buscar/op-pago-buscar.css.
- Ficha: PDF-UI-035, páginas 123, 124; relación original: US18.

Permite al administrador o dueño buscar una orden específica mediante su número identificador para gestionar el registro de su cobro manual. Como resultado, el sistema valida la existencia del pedido dentro del restaurante y conduce al usuario directamente al formulario de confirmación de pago correspondiente.

### Pantalla: op-pago-registrar

- Contexto: Pagos; referencia del manifiesto: US18.
- URL: /operacion/pago/registrar; base: /operacion/pago/registrar; canónica.
- Componente: src/app/pages/operacion/op-pago-registrar/op-pago-registrar.ts.
- Archivos: src/app/pages/operacion/op-pago-registrar/op-pago-registrar.ts, src/app/pages/operacion/op-pago-registrar/op-pago-registrar.html, src/app/pages/operacion/op-pago-registrar/op-pago-registrar.css.
- Ficha: PDF-UI-036, páginas 124, 125; relación original: US18.

Permite al administrador registrar el cobro externo de un pedido, ingresando el monto exacto abonado, el método de pago utilizado y el código de operación bancaria o de billetera digital obligatorio. Como resultado, el sistema liquida administrativamente la cuenta del pedido y bloquea la posibilidad de generar registros duplicados.

### Pantalla: op-pago-confirmado

- Contexto: Pagos; referencia del manifiesto: US18.
- URL: /operacion/pago/registrar?vista=op-pago-confirmado; base: /operacion/pago/registrar; estado alternativo.
- Componente: src/app/pages/operacion/op-pago-confirmado/op-pago-confirmado.ts.
- Archivos: src/app/pages/operacion/op-pago-confirmado/op-pago-confirmado.ts, src/app/pages/operacion/op-pago-confirmado/op-pago-confirmado.html, src/app/pages/operacion/op-pago-confirmado/op-pago-confirmado.css.
- Ficha: PDF-UI-037, páginas 125, 126; relación original: US18.

Permite al personal administrativo auditar la constancia final de un cobro completado, visualizando los datos de la transacción y la confirmación de inmutabilidad del registro. Como resultado, el usuario tiene la certeza de que el pago quedó asentado de forma definitiva en la contabilidad del local y cuenta con un enlace para regresar a la ficha del pedido.

### Pantalla: op-pago-error

- Contexto: Pagos; referencia del manifiesto: US18.
- URL: /operacion/pago/registrar?vista=op-pago-error; base: /operacion/pago/registrar; estado alternativo.
- Componente: src/app/pages/operacion/op-pago-error/op-pago-error.ts.
- Archivos: src/app/pages/operacion/op-pago-error/op-pago-error.ts, src/app/pages/operacion/op-pago-error/op-pago-error.html, src/app/pages/operacion/op-pago-error/op-pago-error.css.
- Ficha: PDF-UI-038, páginas 126; relación original: US18.

Permite al administrador visualizar la notificación de rechazo cuando el monto ingresado no coincide exactamente con el total adeudado del pedido (S/ 66.00), conservando los datos ya completados en el formulario de corrección. Como resultado, el usuario comprueba que el intento fallido no fue registrado en el sistema e identifica el error para rectificar el importe y reenviarlo mediante el botón «Volver a registrar».

### Pantalla: op-mesas

- Contexto: Mesas; referencia del manifiesto: US16.
- URL: /operacion/mesas; base: /operacion/mesas; canónica.
- Componente: src/app/pages/operacion/op-mesas/op-mesas.ts.
- Archivos: src/app/pages/operacion/op-mesas/op-mesas.ts, src/app/pages/operacion/op-mesas/op-mesas.html, src/app/pages/operacion/op-mesas/op-mesas.css.
- Ficha: PDF-UI-076, páginas 154, 155; relación original: US16.

Permite al administrador visualizar el plano gráfico interactivo del salón principal con la ubicación física y distribución espacial de cada mesa según sus coordenadas cartesianas. Como resultado, el usuario supervisa la disposición del establecimiento y dispone de accesos directos para conmutar a la vista tabular mediante «Ver listado» o registrar un nuevo espacio con «+ Añadir mesa».

### Pantalla: op-mesas-lista

- Contexto: Mesas; referencia del manifiesto: US16.
- URL: /operacion/mesas/lista; base: /operacion/mesas/lista; canónica.
- Componente: src/app/pages/operacion/op-mesas-lista/op-mesas-lista.ts.
- Archivos: src/app/pages/operacion/op-mesas-lista/op-mesas-lista.ts, src/app/pages/operacion/op-mesas-lista/op-mesas-lista.html, src/app/pages/operacion/op-mesas-lista/op-mesas-lista.css.
- Ficha: PDF-UI-077, páginas 155; relación original: US16.

Permite al personal administrativo consultar el inventario de mesas en formato tabular, detallando el número identificador, aforo máximo de comensales, coordenadas cartesianas (X, Y) y estado operativo (Activa). Como resultado, el usuario gestiona el mobiliario de forma estructurada y cuenta con acciones inmediatas para editar las dimensiones o desactivar mesas del servicio.

### Pantalla: op-mesa-nueva

- Contexto: Mesas; referencia del manifiesto: US16.
- URL: /operacion/mesa/nueva; base: /operacion/mesa/nueva; canónica.
- Componente: src/app/pages/operacion/op-mesa-nueva/op-mesa-nueva.ts.
- Archivos: src/app/pages/operacion/op-mesa-nueva/op-mesa-nueva.ts, src/app/pages/operacion/op-mesa-nueva/op-mesa-nueva.html, src/app/pages/operacion/op-mesa-nueva/op-mesa-nueva.css.
- Ficha: PDF-UI-078, páginas 155, 156; relación original: US16.

Permite al administrador incorporar una nueva mesa al restaurante definiendo su código único, capacidad de personas y coordenadas de posición en el plano, contando con un croquis de referencia visual. Como resultado, la mesa queda registrada e integrada a la distribución del local al pulsar «Guardar mesa» para ser habilitada en el sistema de reservas.

### Pantalla: op-mesa-editar

- Contexto: Mesas; referencia del manifiesto: US16.
- URL: /operacion/mesa/editar; base: /operacion/mesa/editar; canónica.
- Componente: src/app/pages/operacion/op-mesa-editar/op-mesa-editar.ts.
- Archivos: src/app/pages/operacion/op-mesa-editar/op-mesa-editar.ts, src/app/pages/operacion/op-mesa-editar/op-mesa-editar.html, src/app/pages/operacion/op-mesa-editar/op-mesa-editar.css.
- Ficha: PDF-UI-079, páginas 156, 157; relación original: US16.

Permite al administrador reconfigurar el número, capacidad de comensales o coordenadas espaciales de una mesa existente, previsualizando su nueva posición en el plano de apoyo. Como resultado, los parámetros se actualizan en la base de datos tras presionar «Guardar mesa», adaptando inmediatamente la capacidad de atención en salón.

### Pantalla: op-mesa-desactivar

- Contexto: Mesas; referencia del manifiesto: US16.
- URL: /operacion/mesa/desactivar; base: /operacion/mesa/desactivar; canónica.
- Componente: src/app/pages/operacion/op-mesa-desactivar/op-mesa-desactivar.ts.
- Archivos: src/app/pages/operacion/op-mesa-desactivar/op-mesa-desactivar.ts, src/app/pages/operacion/op-mesa-desactivar/op-mesa-desactivar.html, src/app/pages/operacion/op-mesa-desactivar/op-mesa-desactivar.css, src/app/dialogs/op-mesa-desactivar/op-mesa-desactivar-dialog.ts, src/app/dialogs/op-mesa-desactivar/op-mesa-desactivar-dialog.html, src/app/dialogs/op-mesa-desactivar/op-mesa-desactivar-dialog.css.
- Ficha: PDF-UI-080, páginas 157, 158; relación original: US16.

Permite al personal administrativo deshabilitar una mesa para que deje de estar disponible para futuras reservas sin borrar su registro ni su historial, advirtiéndole que debe atender las reservas vigentes asociadas. Como resultado, el sistema bloquea la mesa en el plano al pulsar «Desactivar mesa», impidiendo nuevas asignaciones presenciales.

### Pantalla: op-mesa-bloqueada

- Contexto: Mesas; referencia del manifiesto: US16.
- URL: /operacion/mesa/desactivar?vista=op-mesa-bloqueada; base: /operacion/mesa/desactivar; estado alternativo.
- Componente: src/app/pages/operacion/op-mesa-bloqueada/op-mesa-bloqueada.ts.
- Archivos: src/app/pages/operacion/op-mesa-bloqueada/op-mesa-bloqueada.ts, src/app/pages/operacion/op-mesa-bloqueada/op-mesa-bloqueada.html, src/app/pages/operacion/op-mesa-bloqueada/op-mesa-bloqueada.css.
- Ficha: PDF-UI-081, páginas 158; relación original: US16.

Permite al personal administrativo visualizar la restricción del sistema que impide desactivar una mesa o disminuir su capacidad cuando tiene reservas vigentes y confirmadas asociadas (como la reserva #208). Como resultado, el sistema salvaguarda el compromiso de atención adquirido con los comensales y proporciona el acceso directo «Gestionar reserva» para reubicar o resolver la cita antes de alterar la mesa.

### Pantalla: op-reservas

- Contexto: Reservas operación; referencia del manifiesto: US29.
- URL: /operacion/reservas; base: /operacion/reservas; canónica.
- Componente: src/app/pages/operacion/op-reservas/op-reservas.ts.
- Archivos: src/app/pages/operacion/op-reservas/op-reservas.ts, src/app/pages/operacion/op-reservas/op-reservas.html, src/app/pages/operacion/op-reservas/op-reservas.css.
- Ficha: PDF-UI-082, páginas 158, 159; relación original: US29.

Permite al administrador o recepcionista supervisar la agenda general de reservas del restaurante filtrando por fecha específica y estado operativo (Confirmada, Pendiente, Completada, Expirada). Como resultado, el personal monitorea la afluencia de comensales en salón y dispone de accesos directos para tramitar una nueva reserva («+ Nueva reserva»), configurar el servicio o gestionar citas individuales pulsando «Gestionar».

### Pantalla: op-reserva-nueva

- Contexto: Reservas operación; referencia del manifiesto: US06, US29.
- URL: /operacion/reserva/nueva; base: /operacion/reserva/nueva; canónica.
- Componente: src/app/pages/operacion/op-reserva-nueva/op-reserva-nueva.ts.
- Archivos: src/app/pages/operacion/op-reserva-nueva/op-reserva-nueva.ts, src/app/pages/operacion/op-reserva-nueva/op-reserva-nueva.html, src/app/pages/operacion/op-reserva-nueva/op-reserva-nueva.css.
- Ficha: PDF-UI-083, páginas 159, 160; relación original: US06, US29.

Permite al personal operativo registrar una reserva manual directamente desde el panel de control, ingresando fecha, horario de atención, cantidad de personas, mesa asignada y notas especiales. Como resultado, la reserva queda almacenada en el sistema en estado pendiente al pulsar «Crear solicitud pendiente», reservando el espacio para su posterior confirmación.

### Pantalla: op-reserva-detalle

- Contexto: Reservas operación; referencia del manifiesto: US17, US29.
- URL: /operacion/reserva; base: /operacion/reserva; canónica.
- Componente: src/app/pages/operacion/op-reserva-detalle/op-reserva-detalle.ts.
- Archivos: src/app/pages/operacion/op-reserva-detalle/op-reserva-detalle.ts, src/app/pages/operacion/op-reserva-detalle/op-reserva-detalle.html, src/app/pages/operacion/op-reserva-detalle/op-reserva-detalle.css.
- Ficha: PDF-UI-084, páginas 160; relación original: US17, US29.

Permite al personal administrativo auditar los datos de una solicitud de mesa en estado pendiente, comprobando los datos del cliente, horario de visita, mesa requerida y notas registradas. Como resultado, el usuario evalúa la disponibilidad del salón y define la resolución de la cita mediante las opciones para «Confirmar reserva», «Rechazar» o «Reprogramar».

### Pantalla: op-reserva-rechazar

- Contexto: Reservas operación; referencia del manifiesto: US17, US29.
- URL: /operacion/reserva/rechazar; base: /operacion/reserva/rechazar; canónica.
- Componente: src/app/pages/operacion/op-reserva-rechazar/op-reserva-rechazar.ts.
- Archivos: src/app/pages/operacion/op-reserva-rechazar/op-reserva-rechazar.ts, src/app/pages/operacion/op-reserva-rechazar/op-reserva-rechazar.html, src/app/pages/operacion/op-reserva-rechazar/op-reserva-rechazar.css.
- Ficha: PDF-UI-085, páginas 160, 161; relación original: US17, US29.

Permite al administrador consignar el motivo obligatorio por el cual no es posible admitir una reserva (por ejemplo, salón reservado para un evento privado). Como resultado, el sistema procesa el rechazo formal al presionar «Rechazar reserva», notificando la decisión al comensal dentro de la plataforma y liberando la mesa para ese intervalo.

### Pantalla: op-reserva-rechazada

- Contexto: Reservas operación; referencia del manifiesto: US17, US29.
- URL: /operacion/reserva?vista=op-reserva-rechazada; base: /operacion/reserva; estado alternativo.
- Componente: src/app/pages/operacion/op-reserva-rechazada/op-reserva-rechazada.ts.
- Archivos: src/app/pages/operacion/op-reserva-rechazada/op-reserva-rechazada.ts, src/app/pages/operacion/op-reserva-rechazada/op-reserva-rechazada.html, src/app/pages/operacion/op-reserva-rechazada/op-reserva-rechazada.css.
- Ficha: PDF-UI-086, páginas 161; relación original: US17, US29.

Permite al personal administrativo verificar la constancia de una solicitud desestimada, mostrando el motivo sustentado y la confirmación de la notificación automática remitida al cliente. Como resultado, el usuario corrobora que la mesa volvió a quedar disponible en la agenda y cuenta con el botón «Volver a la agenda» para retornar al calendario de reservas.

### Pantalla: op-reserva-llegada

- Contexto: Reservas operación; referencia del manifiesto: US25.
- URL: /operacion/reserva/llegada; base: /operacion/reserva/llegada; canónica.
- Componente: src/app/pages/operacion/op-reserva-llegada/op-reserva-llegada.ts.
- Archivos: src/app/pages/operacion/op-reserva-llegada/op-reserva-llegada.ts, src/app/pages/operacion/op-reserva-llegada/op-reserva-llegada.html, src/app/pages/operacion/op-reserva-llegada/op-reserva-llegada.css.
- Ficha: PDF-UI-087, páginas 161, 162; relación original: US25.

Permite al recepcionista verificar una reserva confirmada cuando los comensales arriban al establecimiento, advirtiendo sobre el límite de tolerancia de 15 minutos previo a la expiración. Como resultado, el personal constata la puntualidad de la visita y asienta el ingreso presencial mediante el botón «Registrar llegada» para conservar la mesa asignada.

### Pantalla: op-reserva-atendiendo

- Contexto: Reservas operación; referencia del manifiesto: US25.
- URL: /operacion/reserva/atendiendo; base: /operacion/reserva/atendiendo; canónica.
- Componente: src/app/pages/operacion/op-reserva-atendiendo/op-reserva-atendiendo.ts.
- Archivos: src/app/pages/operacion/op-reserva-atendiendo/op-reserva-atendiendo.ts, src/app/pages/operacion/op-reserva-atendiendo/op-reserva-atendiendo.html, src/app/pages/operacion/op-reserva-atendiendo/op-reserva-atendiendo.css.
- Ficha: PDF-UI-088, páginas 162, 163; relación original: US25.

Permite al personal de salón dar seguimiento a una mesa cuya llegada ya fue registrada y que se encuentra disfrutando del servicio en el turno activo. Como resultado, el usuario monitorea la atención en curso en tiempo real y puede registrar el fin de la visita mediante el botón «Completar reserva» una vez concluido el consumo.

### Pantalla: op-reserva-completada

- Contexto: Reservas operación; referencia del manifiesto: US25.
- URL: /operacion/reserva?vista=op-reserva-completada; base: /operacion/reserva; estado alternativo.
- Componente: src/app/pages/operacion/op-reserva-completada/op-reserva-completada.ts.
- Archivos: src/app/pages/operacion/op-reserva-completada/op-reserva-completada.ts, src/app/pages/operacion/op-reserva-completada/op-reserva-completada.html, src/app/pages/operacion/op-reserva-completada/op-reserva-completada.css.
- Ficha: PDF-UI-089, páginas 163; relación original: US25.

Permite al personal administrativo auditar la constancia de una reserva finalizada satisfactoriamente tras la atención presencial de los clientes. Como resultado, el sistema archiva la visita como completada, notifica al comensal y libera la mesa para los siguientes turnos del salón al presionar «Volver a la agenda».

### Pantalla: op-reserva-expirada

- Contexto: Reservas operación; referencia del manifiesto: US26.
- URL: /operacion/reserva?vista=op-reserva-expirada; base: /operacion/reserva; estado alternativo.
- Componente: src/app/pages/operacion/op-reserva-expirada/op-reserva-expirada.ts.
- Archivos: src/app/pages/operacion/op-reserva-expirada/op-reserva-expirada.ts, src/app/pages/operacion/op-reserva-expirada/op-reserva-expirada.html, src/app/pages/operacion/op-reserva-expirada/op-reserva-expirada.css.
- Ficha: PDF-UI-090, páginas 163, 164; relación original: US26.

Permite al personal operativo examinar la ficha de una cita que venció por superar los 15 minutos de tolerancia sin registro de llegada o por no haberse confirmado a tiempo. Como resultado, el sistema constata la liberación inmediata de la mesa para atender a comensales sin reserva previa y ofrece el botón «Volver a reservas».

### Pantalla: op-reserva-editar

- Contexto: Reservas operación; referencia del manifiesto: US29.
- URL: /operacion/reserva/editar; base: /operacion/reserva/editar; canónica.
- Componente: src/app/pages/operacion/op-reserva-editar/op-reserva-editar.ts.
- Archivos: src/app/pages/operacion/op-reserva-editar/op-reserva-editar.ts, src/app/pages/operacion/op-reserva-editar/op-reserva-editar.html, src/app/pages/operacion/op-reserva-editar/op-reserva-editar.css.
- Ficha: PDF-UI-091, páginas 164, 165; relación original: US29.

Permite al administrador o personal de recepción reprogramar la fecha, horario, comensales o notas de una reserva, informando que la solicitud retornará al estado pendiente para reevaluar la capacidad. Como resultado, el nuevo horario queda registrado en la agenda tras presionar «Guardar reprogramación», evitando solapamientos de mesas.

### Pantalla: op-reserva-cancelar

- Contexto: Reservas operación; referencia del manifiesto: US29.
- URL: /operacion/reserva/cancelar; base: /operacion/reserva/cancelar; canónica.
- Componente: src/app/pages/operacion/op-reserva-cancelar/op-reserva-cancelar.ts.
- Archivos: src/app/pages/operacion/op-reserva-cancelar/op-reserva-cancelar.ts, src/app/pages/operacion/op-reserva-cancelar/op-reserva-cancelar.html, src/app/pages/operacion/op-reserva-cancelar/op-reserva-cancelar.css, src/app/dialogs/op-reserva-cancelar/op-reserva-cancelar-dialog.ts, src/app/dialogs/op-reserva-cancelar/op-reserva-cancelar-dialog.html, src/app/dialogs/op-reserva-cancelar/op-reserva-cancelar-dialog.css.
- Ficha: PDF-UI-092, páginas 165, 166; relación original: US29.

Permite al administrador gestionar la anulación de una reserva por causas de fuerza mayor o solicitud directa sin la restricción de anticipación de 2 horas exclusiva del cliente, permitiendo ingresar un motivo opcional. Como resultado, el personal procesa la cancelación formal mediante el botón «Cancelar reserva», liberando la mesa en ese turno y preservando el registro para auditoría.

### Pantalla: op-reservas-modulo

- Contexto: Reservas operación; referencia del manifiesto: US27.
- URL: /operacion/atencion; base: /operacion/atencion; canónica.
- Componente: src/app/pages/operacion/op-reservas-modulo/op-reservas-modulo.ts.
- Archivos: src/app/pages/operacion/op-reservas-modulo/op-reservas-modulo.ts, src/app/pages/operacion/op-reservas-modulo/op-reservas-modulo.html, src/app/pages/operacion/op-reservas-modulo/op-reservas-modulo.css.
- Ficha: PDF-UI-093, páginas 166; relación original: US27.

Permite al administrador comprobar el estado operativo del servicio de reservas en línea (Habilitado) e informarse sobre las dependencias asociadas a la atención física y pedidos en salón. Como resultado, el usuario evalúa la continuidad del canal digital y cuenta con el botón «Deshabilitar reservas» para suspender temporalmente la recepción de solicitudes.

### Pantalla: op-reservas-modulo-confirmar

- Contexto: Reservas operación; referencia del manifiesto: US27.
- URL: /operacion/atencion/confirmar; base: /operacion/atencion/confirmar; canónica.
- Componente: src/app/pages/operacion/op-reservas-modulo-confirmar/op-reservas-modulo-confirmar.ts.
- Archivos: src/app/pages/operacion/op-reservas-modulo-confirmar/op-reservas-modulo-confirmar.ts, src/app/pages/operacion/op-reservas-modulo-confirmar/op-reservas-modulo-confirmar.html, src/app/pages/operacion/op-reservas-modulo-confirmar/op-reservas-modulo-confirmar.css, src/app/dialogs/op-reservas-modulo-confirmar/op-reservas-modulo-confirmar-dialog.ts, src/app/dialogs/op-reservas-modulo-confirmar/op-reservas-modulo-confirmar-dialog.html, src/app/dialogs/op-reservas-modulo-confirmar/op-reservas-modulo-confirmar-dialog.css.
- Ficha: PDF-UI-094, páginas 166, 167; relación original: US27.

Permite al administrador confirmar la pausa general de las reservas en línea mediante un cuadro de advertencia que aclara que las reservas previamente agendadas seguirán vigentes. Como resultado, el sistema actualiza la configuración del restaurante al presionar «Confirmar cambio», inhabilitando el acceso a nuevas reservas desde la plataforma pública del cliente.

### Pantalla: op-reportes

- Contexto: Reportes; referencia del manifiesto: US20.
- URL: /operacion/reportes; base: /operacion/reportes; canónica.
- Componente: src/app/pages/operacion/op-reportes/op-reportes.ts.
- Archivos: src/app/pages/operacion/op-reportes/op-reportes.ts, src/app/pages/operacion/op-reportes/op-reportes.html, src/app/pages/operacion/op-reportes/op-reportes.css.
- Ficha: PDF-UI-095, páginas 167, 168; relación original: US20.

Permite al administrador o dueño consultar el informe analítico consolidado del restaurante en un rango de fechas, visualizando indicadores clave (ingresos confirmados, pedidos entregados, reservas y ocupación de mesas), la gráfica de horas con mayor demanda y el ranking de platos más consumidos. Como resultado, el usuario evalúa el desempeño operativo y comercial del negocio para respaldar la toma de decisiones estratégicas.

### Pantalla: op-reportes-pagos

- Contexto: Reportes; referencia del manifiesto: US20.
- URL: /operacion/reportes/pagos; base: /operacion/reportes/pagos; canónica.
- Componente: src/app/pages/operacion/op-reportes-pagos/op-reportes-pagos.ts.
- Archivos: src/app/pages/operacion/op-reportes-pagos/op-reportes-pagos.ts, src/app/pages/operacion/op-reportes-pagos/op-reportes-pagos.html, src/app/pages/operacion/op-reportes-pagos/op-reportes-pagos.css.
- Ficha: PDF-UI-096, páginas 168, 169; relación original: US20.

Permite al personal administrativo auditar el balance detallado de los ingresos recaudados en el período, desglosando el total cobrado según el método utilizado (Yape, Efectivo, Tarjeta, Plin) y contrastándolo frente a las cuentas pendientes. Como resultado, el usuario fiscaliza la liquidación económica del restaurante y garantiza la consistencia de los cierres de caja.

### Pantalla: op-reportes-vacio

- Contexto: Reportes; referencia del manifiesto: US20.
- URL: /operacion/reportes?vista=op-reportes-vacio; base: /operacion/reportes; estado alternativo.
- Componente: src/app/pages/operacion/op-reportes-vacio/op-reportes-vacio.ts.
- Archivos: src/app/pages/operacion/op-reportes-vacio/op-reportes-vacio.ts, src/app/pages/operacion/op-reportes-vacio/op-reportes-vacio.html, src/app/pages/operacion/op-reportes-vacio/op-reportes-vacio.css.
- Ficha: PDF-UI-097, páginas 169, 170; relación original: US20.

Permite al administrador comprobar el estado vacío del reporte cuando no se registran transacciones, pedidos ni reservas en el intervalo seleccionado, garantizando que no se muestren métricas ficticias. Como resultado, el sistema valida la ausencia de actividad en esas fechas y orienta al usuario a ingresar un nuevo rango mediante el botón «Cambiar período».

### Pantalla: op-reportes-fechas-invalidas

- Contexto: Reportes; referencia del manifiesto: US20.
- URL: /operacion/reportes?vista=op-reportes-fechas-invalidas; base: /operacion/reportes; estado alternativo.
- Componente: src/app/pages/operacion/op-reportes-fechas-invalidas/op-reportes-fechas-invalidas.ts.
- Archivos: src/app/pages/operacion/op-reportes-fechas-invalidas/op-reportes-fechas-invalidas.ts, src/app/pages/operacion/op-reportes-fechas-invalidas/op-reportes-fechas-invalidas.html, src/app/pages/operacion/op-reportes-fechas-invalidas/op-reportes-fechas-invalidas.css.
- Ficha: PDF-UI-098, páginas 170, 171; relación original: US20.

Permite al usuario ser notificado mediante una alerta de error cuando la fecha de inicio seleccionada es posterior a la fecha de fin del período de análisis. Como resultado, el sistema restringe el procesamiento de consultas temporales inconsistentes en la base de datos y habilita el botón «Corregir y consultar» para ajustar el rango adecuadamente.

### Pantalla: op-notificaciones

- Contexto: Notificaciones; referencia del manifiesto: US28.
- URL: /operacion/notificaciones; base: /operacion/notificaciones; canónica.
- Componente: src/app/pages/operacion/op-notificaciones/op-notificaciones.ts.
- Archivos: src/app/pages/operacion/op-notificaciones/op-notificaciones.ts, src/app/pages/operacion/op-notificaciones/op-notificaciones.html, src/app/pages/operacion/op-notificaciones/op-notificaciones.css.
- Ficha: PDF-UI-056, páginas 139, 140; relación original: US28.

Permite al personal administrativo acceder a su centro de notificaciones personales dirigidas a su cuenta de usuario dentro del restaurante, informándole cuando no existen mensajes individuales pendientes. Como resultado, el administrador valida que su casilla operativa se encuentra al día y cuenta con el botón «Volver al inicio» para regresar al panel de control general.

### Pantalla: dueno-administrador-nuevo

- Contexto: Dueño; referencia del manifiesto: US22.
- URL: /dueno/administradores/nuevo; base: /dueno/administradores/nuevo; canónica.
- Componente: src/app/pages/dueno/dueno-administrador-nuevo/dueno-administrador-nuevo.ts.
- Archivos: src/app/pages/dueno/dueno-administrador-nuevo/dueno-administrador-nuevo.ts, src/app/pages/dueno/dueno-administrador-nuevo/dueno-administrador-nuevo.html, src/app/pages/dueno/dueno-administrador-nuevo/dueno-administrador-nuevo.css.
- Ficha: PDF-UI-010, páginas 105, 106; relación original: US22.

Formulario exclusivo para que el dueño registre a un nuevo administrador de su local ingresando su nombre, correo y contraseña. Como resultado, el servidor asigna automáticamente el rol ADMINISTRADOR y vincula al nuevo usuario a la sede del dueño, sin exponer datos de otros restaurantes.

### Pantalla: dueno-administrador-creado

- Contexto: Dueño; referencia del manifiesto: US22.
- URL: /dueno/administradores/nuevo?vista=dueno-administrador-creado; base: /dueno/administradores/nuevo; estado alternativo.
- Componente: src/app/pages/dueno/dueno-administrador-creado/dueno-administrador-creado.ts.
- Archivos: src/app/pages/dueno/dueno-administrador-creado/dueno-administrador-creado.ts, src/app/pages/dueno/dueno-administrador-creado/dueno-administrador-creado.html, src/app/pages/dueno/dueno-administrador-creado/dueno-administrador-creado.css.
- Ficha: PDF-UI-011, páginas 106, 107; relación original: US22.

Pantalla de éxito tras registrar un nuevo administrador. Muestra la ficha con los datos asignados (nombre, correo, rol y restaurante) y aclara por seguridad que no se emiten contraseñas ni tokens en la respuesta. Permite volver al inicio o "Incorporar otra persona".

### Pantalla: dueno-administrador-duplicado

- Contexto: Dueño; referencia del manifiesto: US22.
- URL: /dueno/administradores/nuevo?vista=dueno-administrador-duplicado; base: /dueno/administradores/nuevo; estado alternativo.
- Componente: src/app/pages/dueno/dueno-administrador-duplicado/dueno-administrador-duplicado.ts.
- Archivos: src/app/pages/dueno/dueno-administrador-duplicado/dueno-administrador-duplicado.ts, src/app/pages/dueno/dueno-administrador-duplicado/dueno-administrador-duplicado.html, src/app/pages/dueno/dueno-administrador-duplicado/dueno-administrador-duplicado.css.
- Ficha: PDF-UI-012, páginas 107, 108; relación original: US22.

Alerta que se activa si el dueño intenta registrar a un administrador con un correo electrónico que ya existe en el sistema. Como resultado, bloquea la creación para evitar sobreescritura de cuentas, muestra una advertencia en rojo y permite corregir el correo mediante el botón "Volver a intentar".

### Pantalla: estado-403

- Contexto: Estados del sistema; referencia del manifiesto: Transversal; US02 para sesión y permisos.
- URL: /estado/403; base: /estado/403; canónica.
- Componente: src/app/pages/sistema/estado-403/estado-403.ts.
- Archivos: src/app/pages/sistema/estado-403/estado-403.ts, src/app/pages/sistema/estado-403/estado-403.html, src/app/pages/sistema/estado-403/estado-403.css.
- Ficha: PDF-UI-099, páginas 171; relación original: Transversal; US02 para sesión y permisos.

Permite al usuario conocer que su cuenta no cuenta con los permisos de rol requeridos o que intenta acceder a recursos ajenos a su restaurante según las reglas de aislamiento multitenant. Como resultado, el sistema salvaguarda la seguridad y privacidad de la plataforma bloqueando el acceso no autorizado y ofreciendo el botón «Volver al acceso» para reconducir al inicio de sesión.

### Pantalla: estado-404

- Contexto: Estados del sistema; referencia del manifiesto: Transversal; US02 para sesión y permisos.
- URL: /estado/404; base: /estado/404; canónica.
- Componente: src/app/pages/sistema/estado-404/estado-404.ts.
- Archivos: src/app/pages/sistema/estado-404/estado-404.ts, src/app/pages/sistema/estado-404/estado-404.html, src/app/pages/sistema/estado-404/estado-404.css.
- Ficha: PDF-UI-100, páginas 171, 172; relación original: Transversal; US02 para sesión y permisos.

Permite al usuario identificar que la ruta web solicitada no existe, ha cambiado de dirección o no se encuentra disponible para su cuenta. Como resultado, la aplicación evita la ruptura de la experiencia de usuario ante enlaces rotos y proporciona el botón «Volver al inicio» para retornar al entorno principal de navegación.

### Pantalla: estado-sesion-expirada

- Contexto: Estados del sistema; referencia del manifiesto: Transversal; US02 para sesión y permisos.
- URL: /estado/sesion; base: /estado/sesion; canónica.
- Componente: src/app/pages/sistema/estado-sesion-expirada/estado-sesion-expirada.ts.
- Archivos: src/app/pages/sistema/estado-sesion-expirada/estado-sesion-expirada.ts, src/app/pages/sistema/estado-sesion-expirada/estado-sesion-expirada.html, src/app/pages/sistema/estado-sesion-expirada/estado-sesion-expirada.css.
- Ficha: PDF-UI-101, páginas 172; relación original: Transversal; US02 para sesión y permisos.

Permite al usuario ser notificado cuando su token JWT de autenticación ha vencido por inactividad o expiración temporal, ocultando cualquier dato confidencial. Como resultado, el sistema protege la cuenta contra accesos indebidos y facilita el botón «Iniciar sesión» para renovar las credenciales de forma inmediata.

### Pantalla: estado-error

- Contexto: Estados del sistema; referencia del manifiesto: Transversal; US02 para sesión y permisos.
- URL: /estado/error; base: /estado/error; canónica.
- Componente: src/app/pages/sistema/estado-error/estado-error.ts.
- Archivos: src/app/pages/sistema/estado-error/estado-error.ts, src/app/pages/sistema/estado-error/estado-error.html, src/app/pages/sistema/estado-error/estado-error.css.
- Ficha: PDF-UI-102, páginas 172, 173; relación original: Transversal; US02 para sesión y permisos.

Permite al usuario recibir una retroalimentación clara cuando ocurre una interrupción de red o una respuesta fallida del servidor, impidiendo que la pantalla quede en blanco. Como resultado, el sistema garantiza la estabilidad visual de la aplicación y dispone del botón «Reintentar» para volver a consultar la información cuando la conexión se restablezca.

### Pantalla: estado-cargando

- Contexto: Estados del sistema; referencia del manifiesto: Transversal; US02 para sesión y permisos.
- URL: /estado/cargando; base: /estado/cargando; canónica.
- Componente: src/app/pages/sistema/estado-cargando/estado-cargando.ts.
- Archivos: src/app/pages/sistema/estado-cargando/estado-cargando.ts, src/app/pages/sistema/estado-cargando/estado-cargando.html, src/app/pages/sistema/estado-cargando/estado-cargando.css.
- Ficha: PDF-UI-103, páginas 173, 174; relación original: Transversal; US02 para sesión y permisos.

Permite al usuario visualizar una estructura visual de marcadores de posición (skeleton loaders) mientras la interfaz consulta y recupera asíncronamente los datos desde el backend. Como resultado, el sistema mitiga la sensación de espera y asegura una transición suave hacia el despliegue del contenido definitivo en pantalla.

### Pantalla: cliente-ia

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente; base: /cliente/asistente; canónica.
- Componente: src/app/pages/cliente/cliente-ia/cliente-ia.ts.
- Archivos: src/app/pages/cliente/cliente-ia/cliente-ia.ts, src/app/pages/cliente/cliente-ia/cliente-ia.html, src/app/pages/cliente/cliente-ia/cliente-ia.css.
- Ficha: PDF-UI-104, páginas 174, 175; relación original: US03 · Funcionalidad prevista.

Permite al cliente acceder al asistente conversacional inteligente para resolver consultas sobre platos, ingredientes y restricciones dietéticas, o conocer las operaciones permitidas sobre sus pedidos mediante sugerencias guiadas. Como resultado, el usuario dispone de un canal de interacción amigable y dinámico para explorar la oferta del restaurante en lenguaje natural.

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-plato-bowl

- Contexto: Cliente; referencia del manifiesto: US10.
- URL: /cliente/plato?vista=cliente-plato-bowl; base: /cliente/plato; estado alternativo.
- Componente: src/app/pages/cliente/cliente-plato-bowl/cliente-plato-bowl.ts.
- Archivos: src/app/pages/cliente/cliente-plato-bowl/cliente-plato-bowl.ts, src/app/pages/cliente/cliente-plato-bowl/cliente-plato-bowl.html, src/app/pages/cliente/cliente-plato-bowl/cliente-plato-bowl.css.
- Ficha: PDF-UI-019, páginas 112; relación original: US10.

Permite al cliente revisar la ficha completa de un plato sugerido por el asistente virtual, detallando sus ingredientes, alérgenos identificados, tiempo estimado de preparación y advertencias sobre contaminación cruzada. Como resultado, el usuario valida si la sugerencia se ajusta a sus preferencias o restricciones alimentarias y dispone de un botón para regresar a la lista de recomendaciones generadas por la IA.

### Pantalla: cliente-ia-recomendaciones

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente?vista=cliente-ia-recomendaciones; base: /cliente/asistente; estado alternativo.
- Componente: src/app/pages/cliente/cliente-ia-recomendaciones/cliente-ia-recomendaciones.ts.
- Archivos: src/app/pages/cliente/cliente-ia-recomendaciones/cliente-ia-recomendaciones.ts, src/app/pages/cliente/cliente-ia-recomendaciones/cliente-ia-recomendaciones.html, src/app/pages/cliente/cliente-ia-recomendaciones/cliente-ia-recomendaciones.css.
- Ficha: PDF-UI-105, páginas 175, 176; relación original: US03 · Funcionalidad prevista.

Permite al cliente recibir sugerencias personalizadas de platos adaptadas a sus necesidades dietéticas o alergias declaradas (como opciones veganas sin maní), incluyendo advertencias sobre la ausencia de datos de contaminación cruzada. Como resultado, el asistente presenta alternativas aptas como el «Bowl de la huerta» con acceso directo a «Consultar plato» para revisar su composición.

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-ia-ingredientes

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente?vista=cliente-ia-ingredientes; base: /cliente/asistente; estado alternativo.
- Componente: src/app/pages/cliente/cliente-ia-ingredientes/cliente-ia-ingredientes.ts.
- Archivos: src/app/pages/cliente/cliente-ia-ingredientes/cliente-ia-ingredientes.ts, src/app/pages/cliente/cliente-ia-ingredientes/cliente-ia-ingredientes.html, src/app/pages/cliente/cliente-ia-ingredientes/cliente-ia-ingredientes.css.
- Ficha: PDF-UI-106, páginas 176, 177; relación original: US03 · Funcionalidad prevista.

Permite al cliente verificar si un plato en específico contiene alérgenos o insumos no tolerados (como gluten o soya en el lomo saltado). Como resultado, el asistente detalla los componentes registrados en la base de datos, desaconseja el consumo si detecta incompatibilidades y provee el enlace «Ver ficha del plato» para su comprobación.

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-ia-carta

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente?vista=cliente-ia-carta; base: /cliente/asistente; estado alternativo.
- Componente: src/app/pages/cliente/cliente-ia-carta/cliente-ia-carta.ts.
- Archivos: src/app/pages/cliente/cliente-ia-carta/cliente-ia-carta.ts, src/app/pages/cliente/cliente-ia-carta/cliente-ia-carta.html, src/app/pages/cliente/cliente-ia-carta/cliente-ia-carta.css.
- Ficha: PDF-UI-107, páginas 177, 178; relación original: US03 · Funcionalidad prevista.

Permite al cliente pedir una síntesis conversacional de los platos de fondo y sus respectivos precios y tiempos de preparación. Como resultado, el asistente genera una tabla comparativa clara con las alternativas vigentes del restaurante y proporciona el botón «Explorar toda la carta» para examinar el menú completo.

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-ia-sin-informacion

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente?vista=cliente-ia-sin-informacion; base: /cliente/asistente; estado alternativo.
- Componente: src/app/pages/cliente/cliente-ia-sin-informacion/cliente-ia-sin-informacion.ts.
- Archivos: src/app/pages/cliente/cliente-ia-sin-informacion/cliente-ia-sin-informacion.ts, src/app/pages/cliente/cliente-ia-sin-informacion/cliente-ia-sin-informacion.html, src/app/pages/cliente/cliente-ia-sin-informacion/cliente-ia-sin-informacion.css.
- Ficha: PDF-UI-108, páginas 178; relación original: US03 · Funcionalidad prevista.

Permite al usuario comprobar la honestidad del modelo cuando el catálogo del restaurante carece de datos concluyentes sobre un alérgeno o ingrediente (como la presencia de lactosa). Como resultado, el asistente evita conjeturas riesgosas para la salud, aconseja consultar presencialmente con el personal y ofrece el botón «Revisar otros platos» para continuar la búsqueda.

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-ia-cancelar

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente?vista=cliente-ia-cancelar; base: /cliente/asistente; estado alternativo.
- Componente: src/app/pages/cliente/cliente-ia-cancelar/cliente-ia-cancelar.ts.
- Archivos: src/app/pages/cliente/cliente-ia-cancelar/cliente-ia-cancelar.ts, src/app/pages/cliente/cliente-ia-cancelar/cliente-ia-cancelar.html, src/app/pages/cliente/cliente-ia-cancelar/cliente-ia-cancelar.css.
- Ficha: PDF-UI-109, páginas 178, 179; relación original: US03 · Funcionalidad prevista.

Permite al cliente solicitar la cancelación de un pedido mediante el asistente inteligente, el cual comprueba en tiempo real si la orden se encuentra dentro de la ventana de gracia temporal permitida (límite de 5 minutos). Como resultado, la IA expone los datos cronológicos de la comanda y solicita la confirmación expresa del usuario mediante el botón «Sí, cancelar pedido».

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-ia-cancelado

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente?vista=cliente-ia-cancelado; base: /cliente/asistente; estado alternativo.
- Componente: src/app/pages/cliente/cliente-ia-cancelado/cliente-ia-cancelado.ts.
- Archivos: src/app/pages/cliente/cliente-ia-cancelado/cliente-ia-cancelado.ts, src/app/pages/cliente/cliente-ia-cancelado/cliente-ia-cancelado.html, src/app/pages/cliente/cliente-ia-cancelado/cliente-ia-cancelado.css.
- Ficha: PDF-UI-110, páginas 179, 180; relación original: US03 · Funcionalidad prevista.

Permite al cliente visualizar la respuesta afirmativa del asistente tras procesar la anulación de la comanda dentro del margen temporal permitido. Como resultado, la IA confirma el cambio de estado a cancelado en la base de datos, preserva el registro para auditoría y facilita accesos directos para «Consultar pedido» y «Ver notificación».

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-ia-notificacion-cancelacion

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/notificaciones/ia; base: /cliente/notificaciones/ia; canónica.
- Componente: src/app/pages/cliente/cliente-ia-notificacion-cancelacion/cliente-ia-notificacion-cancelacion.ts.
- Archivos: src/app/pages/cliente/cliente-ia-notificacion-cancelacion/cliente-ia-notificacion-cancelacion.ts, src/app/pages/cliente/cliente-ia-notificacion-cancelacion/cliente-ia-notificacion-cancelacion.html, src/app/pages/cliente/cliente-ia-notificacion-cancelacion/cliente-ia-notificacion-cancelacion.css.
- Ficha: PDF-UI-111, páginas 180; relación original: US03 · Funcionalidad prevista.

Permite al cliente recibir una notificación interna en su bandeja personal que acredita formalmente la anulación de su comanda tramitada por el asistente conversacional. Como resultado, el usuario obtiene el comprobante digital de la cancelación conforme y cuenta con un enlace para auditar la ficha histórica del pedido.

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-ia-cancelacion-bloqueada

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente?vista=cliente-ia-cancelacion-bloqueada; base: /cliente/asistente; estado alternativo.
- Componente: src/app/pages/cliente/cliente-ia-cancelacion-bloqueada/cliente-ia-cancelacion-bloqueada.ts.
- Archivos: src/app/pages/cliente/cliente-ia-cancelacion-bloqueada/cliente-ia-cancelacion-bloqueada.ts, src/app/pages/cliente/cliente-ia-cancelacion-bloqueada/cliente-ia-cancelacion-bloqueada.html, src/app/pages/cliente/cliente-ia-cancelacion-bloqueada/cliente-ia-cancelacion-bloqueada.css.
- Ficha: PDF-UI-112, páginas 180, 181; relación original: US03 · Funcionalidad prevista.

Permite al comensal conocer el motivo por el cual el asistente no puede anular su orden al haberse superado la ventana máxima de tolerancia (límite de tiempo expirado). Como resultado, la IA fundamenta el rechazo según las políticas del restaurante, mantiene vigente el pedido sin aplicar cambios y provee el botón «Seguir mi pedido» para continuar con su atención.

IA prevista; no acredita asistente operativo.

### Pantalla: cliente-ia-estado-bloqueado

- Contexto: IA cliente; referencia del manifiesto: US03 · Funcionalidad prevista.
- URL: /cliente/asistente?vista=cliente-ia-estado-bloqueado; base: /cliente/asistente; estado alternativo.
- Componente: src/app/pages/cliente/cliente-ia-estado-bloqueado/cliente-ia-estado-bloqueado.ts.
- Archivos: src/app/pages/cliente/cliente-ia-estado-bloqueado/cliente-ia-estado-bloqueado.ts, src/app/pages/cliente/cliente-ia-estado-bloqueado/cliente-ia-estado-bloqueado.html, src/app/pages/cliente/cliente-ia-estado-bloqueado/cliente-ia-estado-bloqueado.css.
- Ficha: PDF-UI-113, páginas 181, 182; relación original: US03 · Funcionalidad prevista.

Permite al cliente comprender el bloqueo de la cancelación cuando la orden ya fue admitida por la cocina y ha avanzado al estado de en preparación. Como resultado, el asistente explica con claridad que los alimentos ya se están elaborando físicamente, protegiendo los insumos del restaurante y brindando el enlace «Consultar pedido» para dar seguimiento a la entrega.

IA prevista; no acredita asistente operativo.

### Pantalla: op-ia

- Contexto: IA reportes; referencia del manifiesto: US04 · Funcionalidad prevista.
- URL: /operacion/asistente; base: /operacion/asistente; canónica.
- Componente: src/app/pages/operacion/op-ia/op-ia.ts.
- Archivos: src/app/pages/operacion/op-ia/op-ia.ts, src/app/pages/operacion/op-ia/op-ia.html, src/app/pages/operacion/op-ia/op-ia.css.
- Ficha: PDF-UI-114, páginas 182, 183; relación original: US04 · Funcionalidad prevista.

Permite al administrador o dueño consultar métricas del restaurante formulando preguntas directas en lenguaje natural, disponiendo de atajos guiados sobre ventas, demanda horaria, atenciones y liquidación de cobros. Como resultado, el usuario cuenta con un canal analítico conversacional para explorar el desempeño del negocio sin necesidad de estructurar consultas complejas.

IA prevista; no acredita asistente operativo.

### Pantalla: op-ia-platos

- Contexto: IA reportes; referencia del manifiesto: US04 · Funcionalidad prevista.
- URL: /operacion/asistente?vista=op-ia-platos; base: /operacion/asistente; estado alternativo.
- Componente: src/app/pages/operacion/op-ia-platos/op-ia-platos.ts.
- Archivos: src/app/pages/operacion/op-ia-platos/op-ia-platos.ts, src/app/pages/operacion/op-ia-platos/op-ia-platos.html, src/app/pages/operacion/op-ia-platos/op-ia-platos.css.
- Ficha: PDF-UI-115, páginas 183, 184; relación original: US04 · Funcionalidad prevista.

Permite al administrador consultar el ranking de platos con mayor volumen de venta en un intervalo de fechas específico mediante una solicitud conversacional. Como resultado, el asistente procesa el histórico de comandas, destaca que el lomo saltado lidera el período y presenta una tabla cuantitativa con un enlace directo para «Abrir reporte operativo».

IA prevista; no acredita asistente operativo.

### Pantalla: op-ia-atenciones

- Contexto: IA reportes; referencia del manifiesto: US04 · Funcionalidad prevista.
- URL: /operacion/asistente?vista=op-ia-atenciones; base: /operacion/asistente; estado alternativo.
- Componente: src/app/pages/operacion/op-ia-atenciones/op-ia-atenciones.ts.
- Archivos: src/app/pages/operacion/op-ia-atenciones/op-ia-atenciones.ts, src/app/pages/operacion/op-ia-atenciones/op-ia-atenciones.html, src/app/pages/operacion/op-ia-atenciones/op-ia-atenciones.css.
- Ficha: PDF-UI-116, páginas 184, 185; relación original: US04 · Funcionalidad prevista.

Permite al personal administrativo pedir una comparativa del volumen de atención del restaurante diferenciando entre órdenes atendidas y reservas completadas. Como resultado, la IA desglosa métricas independientes (24 pedidos y 12 reservas) para evitar confusiones entre canales de servicio y facilita el botón «Ver detalle del período».

IA prevista; no acredita asistente operativo.

### Pantalla: op-ia-demanda

- Contexto: IA reportes; referencia del manifiesto: US04 · Funcionalidad prevista.
- URL: /operacion/asistente?vista=op-ia-demanda; base: /operacion/asistente; estado alternativo.
- Componente: src/app/pages/operacion/op-ia-demanda/op-ia-demanda.ts.
- Archivos: src/app/pages/operacion/op-ia-demanda/op-ia-demanda.ts, src/app/pages/operacion/op-ia-demanda/op-ia-demanda.html, src/app/pages/operacion/op-ia-demanda/op-ia-demanda.css.
- Ficha: PDF-UI-117, páginas 185, 186; relación original: US04 · Funcionalidad prevista.

Permite al administrador indagar sobre los momentos y franjas horarias de mayor concentración de pedidos durante el período de análisis. Como resultado, el asistente identifica que el pico de atención se registró a las 13:00, muestra una gráfica de barras con la distribución por horas y proporciona el acceso para «Consultar reporte de demanda».

IA prevista; no acredita asistente operativo.

### Pantalla: op-ia-pagos

- Contexto: IA reportes; referencia del manifiesto: US04 · Funcionalidad prevista.
- URL: /operacion/asistente?vista=op-ia-pagos; base: /operacion/asistente; estado alternativo.
- Componente: src/app/pages/operacion/op-ia-pagos/op-ia-pagos.ts.
- Archivos: src/app/pages/operacion/op-ia-pagos/op-ia-pagos.ts, src/app/pages/operacion/op-ia-pagos/op-ia-pagos.html, src/app/pages/operacion/op-ia-pagos/op-ia-pagos.css.
- Ficha: PDF-UI-118, páginas 186, 187; relación original: US04 · Funcionalidad prevista.

Permite al administrador o dueño solicitar un balance conversacional de los cobros asentados frente a las cuentas pendientes del restaurante. Como resultado, el asistente sintetiza los ingresos totales (S/ 1,280.00), presenta una tabla discriminada por método de pago (Yape, Efectivo, Tarjeta y Plin) y ofrece el botón «Ver reporte de pagos» para conciliar la caja.

IA prevista; no acredita asistente operativo.

### Pantalla: op-ia-sin-datos

- Contexto: IA reportes; referencia del manifiesto: US04 · Funcionalidad prevista.
- URL: /operacion/asistente?vista=op-ia-sin-datos; base: /operacion/asistente; estado alternativo.
- Componente: src/app/pages/operacion/op-ia-sin-datos/op-ia-sin-datos.ts.
- Archivos: src/app/pages/operacion/op-ia-sin-datos/op-ia-sin-datos.ts, src/app/pages/operacion/op-ia-sin-datos/op-ia-sin-datos.html, src/app/pages/operacion/op-ia-sin-datos/op-ia-sin-datos.css.
- Ficha: PDF-UI-119, páginas 187, 188; relación original: US04 · Funcionalidad prevista.

Permite al administrador comprobar la respuesta del asistente cuando se consulta por un rango de fechas sin movimientos registrados en la base de datos del restaurante. Como resultado, la IA evita generar métricas ficticias o especulativas, explica con transparencia la falta de información histórica y sugiere botones directos para consultar períodos activos o abrir el reporte en blanco.

IA prevista; no acredita asistente operativo.

### Pantalla: op-ia-aclarar

- Contexto: IA reportes; referencia del manifiesto: US04 · Funcionalidad prevista.
- URL: /operacion/asistente?vista=op-ia-aclarar; base: /operacion/asistente; estado alternativo.
- Componente: src/app/pages/operacion/op-ia-aclarar/op-ia-aclarar.ts.
- Archivos: src/app/pages/operacion/op-ia-aclarar/op-ia-aclarar.ts, src/app/pages/operacion/op-ia-aclarar/op-ia-aclarar.html, src/app/pages/operacion/op-ia-aclarar/op-ia-aclarar.css.
- Ficha: PDF-UI-120, páginas 188, 189; relación original: US04 · Funcionalidad prevista.

Permite al usuario recibir una solicitud de aclaración por parte del asistente cuando se formulan preguntas abiertas o imprecisas (como «¿Cómo nos fue?») que requieren definir un marco temporal específico. Como resultado, la IA orienta proactivamente la conversación y despliega sugerencias de períodos habituales para estructurar un reporte analítico útil.

IA prevista; no acredita asistente operativo.

### Pantalla: op-ia-error

- Contexto: IA reportes; referencia del manifiesto: US04 · Funcionalidad prevista.
- URL: /operacion/asistente?vista=op-ia-error; base: /operacion/asistente; estado alternativo.
- Componente: src/app/pages/operacion/op-ia-error/op-ia-error.ts.
- Archivos: src/app/pages/operacion/op-ia-error/op-ia-error.ts, src/app/pages/operacion/op-ia-error/op-ia-error.html, src/app/pages/operacion/op-ia-error/op-ia-error.css.
- Ficha: PDF-UI-121, páginas 189; relación original: US04 · Funcionalidad prevista.

Permite al personal administrativo recibir una respuesta controlada y segura ante un fallo temporal de comunicación con el motor analítico del backend. Como resultado, el asistente aclara con rigor que no se pudieron calcular cifras en ese instante para no exhibir datos desactualizados y habilita el botón «Volver a consultar» para reintentar la petición.

IA prevista; no acredita asistente operativo.

## Backlog del Sprint 2

61 tareas oficiales; asignación en sus documentos de coordinación. Consultar el alcance autorizado y el estado de la rama para cada tarea. La existencia de interfaz o de un complemento no acredita integración ni aceptación.

| Historia | Tarea | Descripción |
| --- | --- | --- |
| TEC01 | S2-TSK-001 | Configurar Angular, Angular Material, rutas y componentes base; aplicar tokens de color, tipografía y layouts responsive. |
| TEC01 | S2-TSK-002 | Configurar los clientes HTTP y variables de entorno de la API; coordinar CORS y respuestas de error con el backend. |
| LP01 | S2-TSK-003 | Construir la Landing Page responsive con identidad, propuesta de valor, funcionalidades y llamadas a registro e inicio de sesión. |
| LP01 | S2-TSK-004 | Conectar los accesos de la landing con las rutas de la aplicación y verificar navegación Desktop y Mobile. |
| US21 | S2-TSK-005 | Construir el formulario responsive de alta de dueño y restaurante, con los pasos de cuenta y establecimiento. |
| US21 | S2-TSK-006 | Integrar el alta con la API y mostrar validaciones, correo duplicado y confirmación sin crear registros parciales. |
| US01 | S2-TSK-007 | Construir el formulario de registro de cliente con validaciones y mensajes por campo. |
| US01 | S2-TSK-008 | Integrar el registro público con la API y comprobar los estados de carga, éxito y rechazo. |
| US02 | S2-TSK-009 | Construir la pantalla de inicio de sesión e integrar la autenticación JWT mediante servicios HTTP e interceptor. |
| US02 | S2-TSK-010 | Implementar navegación por rol, protección de rutas, cierre de sesión y tratamiento de sesión expirada; la autorización definitiva permanece en la API. |
| US22 | S2-TSK-011 | Construir el formulario de incorporación de administradores accesible al dueño. |
| US22 | S2-TSK-012 | Integrar la creación de administradores y mostrar los rechazos por correo duplicado o falta de permisos. |
| US23 | S2-TSK-013 | Construir las vistas de listado, creación y edición de categorías de la carta. |
| US23 | S2-TSK-014 | Integrar las operaciones de categorías con la API y reflejar sus estados de carga, vacío y error. |
| US14 | S2-TSK-015 | Construir los formularios de platos con categoría, precio, ingredientes, alérgenos, imagen y preparación. |
| US14 | S2-TSK-016 | Integrar la gestión y disponibilidad de platos; actualizar el listado tras guardar y mostrar los errores de validación. |
| US10 | S2-TSK-017 | Construir la carta del cliente con tarjetas de platos, filtro por categoría y vista de detalle. |
| US10 | S2-TSK-018 | Integrar la consulta por restaurante y mostrar precio, imagen, ingredientes, alérgenos y disponibilidad con estados vacíos. |
| US27 | S2-TSK-019 | Construir el control de atención física y el diálogo de confirmación para pausar nuevas reservas. |
| US27 | S2-TSK-020 | Integrar la configuración con la API y reflejar su efecto en los accesos de reservas y atención en salón. |
| US16 | S2-TSK-021 | Construir el plano y listado de mesas y los formularios de número, capacidad y coordenadas. |
| US16 | S2-TSK-022 | Integrar el registro, edición y desactivación de mesas y mostrar restricciones de reservas vigentes. |
| US05 | S2-TSK-023 | Construir el buscador de disponibilidad por fecha, horario y comensales y la selección visual de mesa. |
| US05 | S2-TSK-024 | Integrar la consulta de disponibilidad y mostrar horarios inválidos, restaurante cerrado y ausencia de mesas. |
| US06 | S2-TSK-025 | Construir la revisión y confirmación de una reserva con mesa, horario, comensales y notas. |
| US06 | S2-TSK-026 | Integrar el registro de la reserva y reflejar el estado pendiente o los conflictos de disponibilidad informados por la API. |
| US29 | S2-TSK-027 | Construir la agenda administrativa de reservas con filtros y vista de detalle. |
| US29 | S2-TSK-028 | Integrar la consulta y las acciones administrativas permitidas, refrescando la agenda y mostrando los conflictos de estado. |
| US17 | S2-TSK-029 | Construir los controles de confirmación y rechazo de reservas con ingreso del motivo. |
| US17 | S2-TSK-030 | Integrar la evaluación de solicitudes y actualizar la interfaz según la respuesta y los permisos del usuario. |
| US11 | S2-TSK-031 | Construir el carrito y la selección de modalidad SALON, LLEVAR, RECOGER o DELIVERY con sus campos condicionales. |
| US11 | S2-TSK-032 | Integrar el registro de pedidos y mostrar totales confirmados por la API y restricciones de platos, mesas y atención. |
| US12 | S2-TSK-033 | Construir la vista de detalle de pedido con platos, cantidades, precios y total. |
| US12 | S2-TSK-034 | Integrar la consulta del pedido propio y su pago, incluyendo los estados de carga y acceso denegado. |
| US15 | S2-TSK-035 | Construir el tablero de cocina con pedidos pendientes y en preparación. |
| US15 | S2-TSK-036 | Integrar la cola priorizada devuelta por la API y conservar ese orden al actualizar el tablero. |
| US19 | S2-TSK-037 | Construir las acciones de preparación, pedido listo y entrega con confirmaciones visuales. |
| US19 | S2-TSK-038 | Integrar los cambios de estado y refrescar la vista; mostrar las transiciones rechazadas por la API. |
| US18 | S2-TSK-039 | Construir la consulta de pagos pendientes y el formulario de registro de monto, método y referencia. |
| US18 | S2-TSK-040 | Integrar el registro administrativo y mostrar validaciones, confirmación y detalle actualizado sin simular una pasarela. |
| US13 | S2-TSK-041 | Construir la visualización del estado del pedido del cliente y su avance de preparación y entrega. |
| US13 | S2-TSK-042 | Integrar la actualización del seguimiento desde la API y gestionar errores de consulta sin presentar estados inventados. |
| US24 | S2-TSK-043 | Construir los formularios y diálogos de ajuste y cancelación administrativa de pedidos. |
| US24 | S2-TSK-044 | Integrar las operaciones y reflejar el total actualizado o el bloqueo por pago o estado no permitido. |
| US28 | S2-TSK-045 | Construir el listado de notificaciones personales y sus estados de carga y vacío. |
| US28 | S2-TSK-046 | Integrar la consulta del usuario autenticado y actualizar los avisos tras las operaciones relacionadas. |
| US07 | S2-TSK-047 | Construir el historial del cliente con secciones de reservas y pedidos y accesos al detalle. |
| US07 | S2-TSK-048 | Integrar las consultas de operaciones propias y mostrar estados e historial vacío sin mezclar cuentas. |
| US08 | S2-TSK-049 | Construir el formulario de reprogramación de reservas con consulta de disponibilidad. |
| US08 | S2-TSK-050 | Integrar los cambios y mostrar restricciones de plazo, estado y concurrencia; refrescar el detalle después de guardar. |
| US09 | S2-TSK-051 | Construir el diálogo de cancelación de reserva y la vista de cancelación no permitida. |
| US09 | S2-TSK-052 | Integrar la cancelación y mostrar la respuesta de la API, actualizando el historial del cliente. |
| US25 | S2-TSK-053 | Construir las acciones de registro de llegada y finalización en la vista administrativa de reservas. |
| US25 | S2-TSK-054 | Integrar ambas operaciones y mostrar sus fechas y estados, con controles coherentes con las reglas del servidor. |
| US26 | S2-TSK-055 | Incorporar el estado EXPIRADA y la fecha de vencimiento en el detalle e historial de reservas. |
| US26 | S2-TSK-056 | Actualizar las vistas desde la API para reflejar el vencimiento y la nueva disponibilidad sin ejecutar la expiración desde el navegador. |
| US20 | S2-TSK-057 | Construir los reportes de platos, demanda, atenciones, ocupación y pagos con selector de período. |
| US20 | S2-TSK-058 | Integrar los reportes con tablas y gráficos responsive, incluyendo fechas inválidas y períodos sin datos. |
| TEC01 | S2-TSK-059 | Ejecutar la verificación de flujos cliente y personal: acceso, pedidos, pagos, reservas y errores de integración; registrar y corregir defectos. |
| TEC01 | S2-TSK-060 | Verificar navegación responsive, formularios, foco y mensajes de los flujos de reservas y sus estados vacíos y de error. |
| TEC01 | S2-TSK-061 | Preparar el despliegue de landing y aplicación, configurar rutas SPA y documentar variables, URL de API y dependencias externas. |

## Interacción y heurísticas

Basado en [Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/), consultado 01/11/2026. Propuesta de revisión, no conformidad certificada.

| Principio | Aplicación |
| --- | --- |
| H1 Estado visible | Carga, resultado y bloqueos perceptibles |
| H2 Lenguaje familiar | Carta, mesa, pedido y reserva |
| H3 Control | Cancelar o volver sin operación involuntaria |
| H4 Consistencia | Patrones y nombres iguales |
| H5 Prevención | Requisitos claros y revisión de acciones sensibles |
| H6 Reconocimiento | Resumen y opciones visibles |
| H7 Eficiencia | Filtros, navegación y teclado |
| H8 Prioridad | Contenido centrado en tarea |
| H9 Recuperación | Error comprensible con próximo paso |
| H10 Ayuda | Instrucciones breves en contexto |

Formularios: etiquetas permanentes y mensajes asociados. Conservar datos válidos ante error, evitar envíos duplicados y no confundir validación local con respuesta del servidor. Diferenciar campo inválido, conflicto, permiso y fallo de consulta conforme a respuestas reales, sin trazas técnicas.

Diálogos con título, foco inicial/retorno y cancelar/confirmar claros. Tablas con encabezados y alternativa móvil. Vacío no equivale a fallo. Éxito solo tras confirmación real o identificado como demostración.

Probar Tab/Shift+Tab, activación por teclado, foco, labels, alt significativo o vacío decorativo, mensajes anunciables, zoom, textos largos y movimiento reducido. Dos capturas no prueban responsive.

## Verificación y entrega

1. Leer AGENTS.md, memory.md y este SPEC común. Consultar los complementos disponibles que correspondan a la tarea, si existen.
2. Confirmar tarea/historia/criterios, frames y archivos; contrato si aplica.
3. Revisar rama y cambios sin descartar trabajo. Partir de develop actualizado para feature/<pantalla> cuando se autorice.
4. Implementar únicamente lo pactado; coordinar archivos compartidos.
5. Registrar historia → criterio → pantalla/estado → plataforma → ruta → componente → evidencia → prueba. Pendiente/no aplica exige motivo.

Documentación: comprobar enlaces, IDs y cobertura. CSS/código: ejecutar npm.cmd run check y npm.cmd run build. Equivalentes si npm no está disponible: node scripts/check-structure.mjs y node node_modules/@angular/cli/bin/ng.js build.

Interfaz: probar en navegador desktop/mobile, anchos intermedios, teclado, foco, estados y rutas. Integración: respuestas reales autorizadas, errores y restricciones. Compilación no certifica funcionalidad.

El chequeo conserva 120 escenarios únicos, sus archivos y estados coherentes. Una interfaz declarada implementada debe tener plantilla no vacía; eso no acredita integración ni aceptación. Landing está fuera del inventario de 120.

### Entrega de cualquier tarea

- Preparar una rama descriptiva según AGENTS.md y el acuerdo del equipo, sin imponer una rama de otra funcionalidad.
- Entregar mediante PR hacia develop cuando esté autorizado, indicando historias/tareas cubiertas, cambios, pruebas realmente ejecutadas, evidencia y limitaciones.
- Revisar con otro integrante los criterios aplicables y las regresiones en archivos compartidos. La integración a main y el despliegue siguen el acuerdo y la autorización del equipo.
- No fijar versiones, etiquetas o estrategias de fusión a partir de la entrega de un solo integrante.
- Commits, push, PR y despliegue requieren autorización aplicable. La edición de documentación no los ejecuta ni acredita que la tarea esté terminada.

## Pendientes

| Tema | Confirmación requerida |
| --- | --- |
| Frames vigentes desktop/mobile | Resolver nombre/ID y capturas antes de cada pantalla |
| Roboto | Recurso local; Arial funciona como respaldo |
| API | Contratos, enums, errores, sesión y permisos |
| Moneda, zona horaria y formatos | Contrato/diseño; no inferir del equipo |
| Compatibilidad alimentaria | No garantizar si faltan datos |
| Cancelación IA | Ventana y frontera exacta; IA no implementada |
| Contraste/responsive | Combinaciones y vistas reales |
| Estado Done | Aceptación y pruebas, no solo documentación |

Consultar la tabla de complementos en Fuentes y alcance para los detalles particulares de cada tarea. Su existencia no indica prioridad ni aceptación.
