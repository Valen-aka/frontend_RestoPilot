# Asignación del equipo de RestoPilot

Reparto compartido de mantenimiento del frontend. Consultar estos documentos antes de modificar carpetas y archivos compartidos.

## Fuente y alcance

El reparto procede de RestoPilot_Carpetas_Componentes_Por_Integrante.docx. Se verificaron los responsables y archivos de las 120 pantallas contra src/app/screen-manifest.json sin modificar ese inventario. La landing src/app/home/ es adicional a esas 120 pantallas.

La versión estructurada es [asignacion-equipo.json](asignacion-equipo.json). Actualizar ambos documentos en el mismo cambio cuando se acuerde una reasignación. Este reparto no acredita implementación ni aceptación funcional.

## Coordinación

- Trabajar desde develop en una rama propia y proponer la integración mediante Pull Request hacia develop.
- Consultar al mantenedor principal antes de cambiar componentes o archivos compartidos.
- Coordinar cambios de rutas con Francesco Meza.
- Coordinar tema y assets compartidos con Valentina Montenegro.
- Alexandra Fong mantiene la landing y su despliegue; Francesco prepara la configuración de despliegue Angular. Coordinar una publicación única.
- Conservar las rutas y los estados alternativos mediante ?vista= del inventario.
- Las vistas IA previstas no autorizan implementar servicios reales.

## Resumen

| Integrante | Pantallas | Landing | Componentes modales y layouts | Archivos de soporte |
| --- | ---: | ---: | ---: | ---: |
| Valentina Montenegro | 40 | 0 | 14 | 2 |
| Cristian Condori | 18 | 0 | 1 | 1 |
| Francesco Meza | 27 | 0 | 7 | 32 |
| Alexandra Fong | 35 | 1 | 4 | 0 |

## Valentina Montenegro

### Pantallas y landing

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/app/pages/cliente/cliente-inicio/ | ClienteInicioPage | US10 S2-TSK-017, S2-TSK-018 |
| src/app/pages/cliente/cliente-carta/ | ClienteCartaPage | US10 S2-TSK-017, S2-TSK-018 |
| src/app/pages/cliente/cliente-carta-categoria/ | ClienteCartaCategoriaPage | US10 S2-TSK-017, S2-TSK-018 |
| src/app/pages/cliente/cliente-carta-vacia/ | ClienteCartaVaciaPage | US10 S2-TSK-017, S2-TSK-018 |
| src/app/pages/cliente/cliente-plato/ | ClientePlatoPage | US10 S2-TSK-017, S2-TSK-018 |
| src/app/pages/cliente/cliente-plato-agotado/ | ClientePlatoAgotadoPage | US10 S2-TSK-017, S2-TSK-018 |
| src/app/pages/cliente/cliente-reservas-deshabilitadas/ | ClienteReservasDeshabilitadasPage | US27 S2-TSK-019, S2-TSK-020 |
| src/app/pages/operacion/op-categorias/ | OpCategoriasPage | US23 S2-TSK-013, S2-TSK-014 |
| src/app/pages/operacion/op-categoria-nueva/ | OpCategoriaNuevaPage | US23 S2-TSK-013, S2-TSK-014 |
| src/app/pages/operacion/op-categoria-editar/ | OpCategoriaEditarPage | US23 S2-TSK-013, S2-TSK-014 |
| src/app/pages/operacion/op-categoria-eliminar/ | OpCategoriaEliminarPage | US23 S2-TSK-013, S2-TSK-014 |
| src/app/pages/operacion/op-platos/ | OpPlatosPage | US14 S2-TSK-015, S2-TSK-016 |
| src/app/pages/operacion/op-plato-nuevo/ | OpPlatoNuevoPage | US14 S2-TSK-015, S2-TSK-016 |
| src/app/pages/operacion/op-plato-editar/ | OpPlatoEditarPage | US14 S2-TSK-015, S2-TSK-016 |
| src/app/pages/operacion/op-plato-disponibilidad/ | OpPlatoDisponibilidadPage | US14 S2-TSK-015, S2-TSK-016 |
| src/app/pages/operacion/op-plato-eliminar/ | OpPlatoEliminarPage | US14 S2-TSK-015, S2-TSK-016 |
| src/app/pages/operacion/op-mesas/ | OpMesasPage | US16 S2-TSK-021, S2-TSK-022 |
| src/app/pages/operacion/op-mesas-lista/ | OpMesasListaPage | US16 S2-TSK-021, S2-TSK-022 |
| src/app/pages/operacion/op-mesa-nueva/ | OpMesaNuevaPage | US16 S2-TSK-021, S2-TSK-022 |
| src/app/pages/operacion/op-mesa-editar/ | OpMesaEditarPage | US16 S2-TSK-021, S2-TSK-022 |
| src/app/pages/operacion/op-mesa-desactivar/ | OpMesaDesactivarPage | US16 S2-TSK-021, S2-TSK-022 |
| src/app/pages/operacion/op-mesa-bloqueada/ | OpMesaBloqueadaPage | US16 S2-TSK-021, S2-TSK-022 |
| src/app/pages/operacion/op-reservas/ | OpReservasPage | US29 S2-TSK-027, S2-TSK-028 |
| src/app/pages/operacion/op-reserva-editar/ | OpReservaEditarPage | US29 S2-TSK-027, S2-TSK-028 |
| src/app/pages/operacion/op-reserva-cancelar/ | OpReservaCancelarPage | US29 S2-TSK-027, S2-TSK-028 |
| src/app/pages/operacion/op-reservas-modulo/ | OpReservasModuloPage | US27 S2-TSK-019, S2-TSK-020 |
| src/app/pages/operacion/op-reservas-modulo-confirmar/ | OpReservasModuloConfirmarPage | US27 S2-TSK-019, S2-TSK-020 |
| src/app/pages/operacion/op-reportes/ | OpReportesPage | US20 S2-TSK-057, S2-TSK-058 |
| src/app/pages/operacion/op-reportes-pagos/ | OpReportesPagosPage | US20 S2-TSK-057, S2-TSK-058 |
| src/app/pages/operacion/op-reportes-vacio/ | OpReportesVacioPage | US20 S2-TSK-057, S2-TSK-058 |
| src/app/pages/operacion/op-reportes-fechas-invalidas/ | OpReportesFechasInvalidasPage | US20 S2-TSK-057, S2-TSK-058 |
| src/app/pages/cliente/cliente-plato-bowl/ | ClientePlatoBowlPage | US10 S2-TSK-017, S2-TSK-018 |
| src/app/pages/operacion/op-ia/ | OpIaPage | US04 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/operacion/op-ia-platos/ | OpIaPlatosPage | US04 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/operacion/op-ia-atenciones/ | OpIaAtencionesPage | US04 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/operacion/op-ia-demanda/ | OpIaDemandaPage | US04 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/operacion/op-ia-pagos/ | OpIaPagosPage | US04 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/operacion/op-ia-sin-datos/ | OpIaSinDatosPage | US04 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/operacion/op-ia-aclarar/ | OpIaAclararPage | US04 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/operacion/op-ia-error/ | OpIaErrorPage | US04 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |

Los archivos exactos de cada carpeta se detallan en asignacion-equipo.json.

### Componentes modales y layouts

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/app/dialogs/op-categoria-eliminar/ | OpCategoriaEliminarDialog | US23 S2-TSK-013, S2-TSK-014 |
| src/app/dialogs/op-plato-disponibilidad/ | OpPlatoDisponibilidadDialog | US14 S2-TSK-015, S2-TSK-016 |
| src/app/dialogs/op-plato-eliminar/ | OpPlatoEliminarDialog | US14 S2-TSK-015, S2-TSK-016 |
| src/app/dialogs/op-mesa-desactivar/ | OpMesaDesactivarDialog | US16 S2-TSK-021, S2-TSK-022 |
| src/app/dialogs/op-reserva-cancelar/ | OpReservaCancelarDialog | US29 S2-TSK-027, S2-TSK-028 |
| src/app/dialogs/op-reservas-modulo-confirmar/ | OpReservasModuloConfirmarDialog | US27 S2-TSK-019, S2-TSK-020 |
| src/app/components/brand/ | Brand | Transversal S2-TSK-001 |
| src/app/components/page-heading/ | PageHeading | Transversal S2-TSK-001 |
| src/app/components/status-badge/ | StatusBadge | Transversal S2-TSK-001 |
| src/app/components/data-table/ | DataTable | Transversal S2-TSK-001 |
| src/app/components/floor-plan/ | FloorPlan | Transversal S2-TSK-001 |
| src/app/components/sidebar/ | Sidebar | Transversal S2-TSK-001 |
| src/app/layouts/admin-layout/ | AdminLayout | Transversal S2-TSK-001 |
| src/app/layouts/dueno-layout/ | DuenoLayout | Transversal S2-TSK-001 |

Los archivos exactos de cada carpeta se detallan en asignacion-equipo.json.

### Configuración y soporte

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/material-theme.scss | — | Tema y assets compartidos; coordinar su uso con las páginas |
| src/styles.css | — | Tema y assets compartidos; coordinar su uso con las páginas |

## Cristian Condori

### Pantallas y landing

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/app/pages/cliente/cliente-reservar/ | ClienteReservarPage | US05 S2-TSK-023, S2-TSK-024 |
| src/app/pages/cliente/cliente-plano/ | ClientePlanoPage | US05 S2-TSK-023, S2-TSK-024 |
| src/app/pages/cliente/cliente-sin-disponibilidad/ | ClienteSinDisponibilidadPage | US05 S2-TSK-023, S2-TSK-024 |
| src/app/pages/cliente/cliente-reserva-revisar/ | ClienteReservaRevisarPage | US06 S2-TSK-025, S2-TSK-026 |
| src/app/pages/cliente/cliente-reservas/ | ClienteReservasPage | US07 S2-TSK-047, S2-TSK-048 |
| src/app/pages/cliente/cliente-reserva-pendiente/ | ClienteReservaPendientePage | US07 S2-TSK-047, S2-TSK-048 |
| src/app/pages/cliente/cliente-reserva-confirmada/ | ClienteReservaConfirmadaPage | US07 S2-TSK-047, S2-TSK-048 |
| src/app/pages/cliente/cliente-reserva-rechazada/ | ClienteReservaRechazadaPage | US07 S2-TSK-047, S2-TSK-048 |
| src/app/pages/cliente/cliente-reserva-cancelada/ | ClienteReservaCanceladaPage | US07 S2-TSK-047, S2-TSK-048 |
| src/app/pages/cliente/cliente-reserva-expirada/ | ClienteReservaExpiradaPage | US07, US26 S2-TSK-047, S2-TSK-048 |
| src/app/pages/cliente/cliente-reserva-completada/ | ClienteReservaCompletadaPage | US07, US25 S2-TSK-047, S2-TSK-048 |
| src/app/pages/cliente/cliente-reserva-editar/ | ClienteReservaEditarPage | US08 S2-TSK-049, S2-TSK-050 |
| src/app/pages/cliente/cliente-reserva-cancelar/ | ClienteReservaCancelarPage | US09 S2-TSK-051, S2-TSK-052 |
| src/app/pages/cliente/cliente-reserva-cancelacion-bloqueada/ | ClienteReservaCancelacionBloqueadaPage | US09 S2-TSK-051, S2-TSK-052 |
| src/app/pages/operacion/op-reserva-nueva/ | OpReservaNuevaPage | US06, US29 S2-TSK-025, S2-TSK-026 |
| src/app/pages/operacion/op-reserva-detalle/ | OpReservaDetallePage | US17, US29 S2-TSK-029, S2-TSK-030 |
| src/app/pages/operacion/op-reserva-rechazar/ | OpReservaRechazarPage | US17, US29 S2-TSK-029, S2-TSK-030 |
| src/app/pages/operacion/op-reserva-rechazada/ | OpReservaRechazadaPage | US17, US29 S2-TSK-029, S2-TSK-030 |

Los archivos exactos de cada carpeta se detallan en asignacion-equipo.json.

### Componentes modales y layouts

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/app/dialogs/cliente-reserva-cancelar/ | ClienteReservaCancelarDialog | US09 S2-TSK-051, S2-TSK-052 |

Los archivos exactos de cada carpeta se detallan en asignacion-equipo.json.

### Configuración y soporte

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| docs/QA-RESERVAS-CRISTIAN.md | — | Verificación de reservas **Previsto, aún no existe en develop.** |

## Francesco Meza

### Pantallas y landing

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/app/pages/auth/acceso/ | AccesoPage | US02 S2-TSK-009, S2-TSK-010 |
| src/app/pages/auth/acceso-error/ | AccesoErrorPage | US02 S2-TSK-009, S2-TSK-010 |
| src/app/pages/auth/registro-cliente/ | RegistroClientePage | US01 S2-TSK-007, S2-TSK-008 |
| src/app/pages/auth/registro-dueno/ | RegistroDuenoPage | US21 S2-TSK-005, S2-TSK-006 |
| src/app/pages/auth/registro-restaurante/ | RegistroRestaurantePage | US21 S2-TSK-005, S2-TSK-006 |
| src/app/pages/auth/registro-duplicado/ | RegistroDuplicadoPage | US21 S2-TSK-005, S2-TSK-006 |
| src/app/pages/dueno/dueno-bienvenida/ | DuenoBienvenidaPage | US21 S2-TSK-005, S2-TSK-006 |
| src/app/pages/cliente/cliente-notificaciones/ | ClienteNotificacionesPage | US28 S2-TSK-045, S2-TSK-046 |
| src/app/pages/cliente/cliente-notificaciones-vacio/ | ClienteNotificacionesVacioPage | US28 S2-TSK-045, S2-TSK-046 |
| src/app/pages/operacion/op-inicio/ | OpInicioPage | Vista de acceso a módulos operativos Transversal / revisar |
| src/app/pages/dueno/dueno-inicio/ | DuenoInicioPage | US21 S2-TSK-005, S2-TSK-006 |
| src/app/pages/operacion/op-pedido-editar/ | OpPedidoEditarPage | US24 S2-TSK-043, S2-TSK-044 |
| src/app/pages/operacion/op-pedido-cancelar/ | OpPedidoCancelarPage | US24 S2-TSK-043, S2-TSK-044 |
| src/app/pages/operacion/op-pedido-bloqueado/ | OpPedidoBloqueadoPage | US24 S2-TSK-043, S2-TSK-044 |
| src/app/pages/operacion/op-pago-buscar/ | OpPagoBuscarPage | US18 S2-TSK-039, S2-TSK-040 |
| src/app/pages/operacion/op-pago-registrar/ | OpPagoRegistrarPage | US18 S2-TSK-039, S2-TSK-040 |
| src/app/pages/operacion/op-pago-confirmado/ | OpPagoConfirmadoPage | US18 S2-TSK-039, S2-TSK-040 |
| src/app/pages/operacion/op-pago-error/ | OpPagoErrorPage | US18 S2-TSK-039, S2-TSK-040 |
| src/app/pages/operacion/op-notificaciones/ | OpNotificacionesPage | US28 S2-TSK-045, S2-TSK-046 |
| src/app/pages/dueno/dueno-administrador-nuevo/ | DuenoAdministradorNuevoPage | US22 S2-TSK-011, S2-TSK-012 |
| src/app/pages/dueno/dueno-administrador-creado/ | DuenoAdministradorCreadoPage | US22 S2-TSK-011, S2-TSK-012 |
| src/app/pages/dueno/dueno-administrador-duplicado/ | DuenoAdministradorDuplicadoPage | US22 S2-TSK-011, S2-TSK-012 |
| src/app/pages/sistema/estado-403/ | Estado403Page | Transversal; US02 para sesión y permisos S2-TSK-009, S2-TSK-010 |
| src/app/pages/sistema/estado-404/ | Estado404Page | Transversal; US02 para sesión y permisos S2-TSK-009, S2-TSK-010 |
| src/app/pages/sistema/estado-sesion-expirada/ | EstadoSesionExpiradaPage | Transversal; US02 para sesión y permisos S2-TSK-009, S2-TSK-010 |
| src/app/pages/sistema/estado-error/ | EstadoErrorPage | Transversal; US02 para sesión y permisos S2-TSK-009, S2-TSK-010 |
| src/app/pages/sistema/estado-cargando/ | EstadoCargandoPage | Transversal; US02 para sesión y permisos S2-TSK-009, S2-TSK-010 |

Los archivos exactos de cada carpeta se detallan en asignacion-equipo.json.

### Componentes modales y layouts

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/app/dialogs/op-pedido-cancelar/ | OpPedidoCancelarDialog | US24 S2-TSK-043, S2-TSK-044 |
| src/app/components/auth-story/ | AuthStory | Transversal Transversal / revisar |
| src/app/components/form-errors/ | FormErrors | Transversal Transversal / revisar |
| src/app/components/empty-state/ | EmptyState | Transversal Transversal / revisar |
| src/app/components/loading-state/ | LoadingState | Transversal Transversal / revisar |
| src/app/layouts/auth-layout/ | AuthLayout | Transversal Transversal / revisar |
| src/app/layouts/cuenta-layout/ | CuentaLayout | Transversal Transversal / revisar |

Los archivos exactos de cada carpeta se detallan en asignacion-equipo.json.

### Configuración y soporte

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| .editorconfig | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| .gitignore | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| .nvmrc | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| README.md | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| angular.json | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| netlify.toml | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| package-lock.json | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| package.json | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| public/_redirects | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| scripts/check-structure.mjs | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/app.config.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/app.css | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/app.html | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/app.routes.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/app.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/routes/auth/auth.routes.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/routes/cliente/cliente.routes.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/routes/dueno/dueno.routes.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/routes/estado/estado.routes.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/routes/operacion/operacion.routes.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/screen-host.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/screen-loaders.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/screen-manifest.json | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/structure-index/structure-index.css | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/structure-index/structure-index.html | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/app/structure-index/structure-index.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/environments/environment.development.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/environments/environment.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/index.html | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| src/main.ts | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| tsconfig.app.json | — | Configuración, rutas, carga, inventario o documentación técnica compartida |
| tsconfig.json | — | Configuración, rutas, carga, inventario o documentación técnica compartida |

## Alexandra Fong

### Pantallas y landing

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/app/pages/cliente/cliente-carrito/ | ClienteCarritoPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-carrito-vacio/ | ClienteCarritoVacioPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-entrega-salon/ | ClienteEntregaSalonPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-entrega-delivery/ | ClienteEntregaDeliveryPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-entrega-llevar/ | ClienteEntregaLlevarPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-entrega-recoger/ | ClienteEntregaRecogerPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-restaurante-cerrado/ | ClienteRestauranteCerradoPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-pedido-creado/ | ClientePedidoCreadoPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-pedidos/ | ClientePedidosPage | US12, US13 S2-TSK-033, S2-TSK-034, S2-TSK-041, S2-TSK-042 |
| src/app/pages/cliente/cliente-pedido-detalle/ | ClientePedidoDetallePage | US12, US13 S2-TSK-033, S2-TSK-034, S2-TSK-041, S2-TSK-042 |
| src/app/pages/cliente/cliente-pedido-listo/ | ClientePedidoListoPage | US12, US13 S2-TSK-033, S2-TSK-034, S2-TSK-041, S2-TSK-042 |
| src/app/pages/cliente/cliente-pedido-entregado/ | ClientePedidoEntregadoPage | US11 S2-TSK-031, S2-TSK-032 |
| src/app/pages/cliente/cliente-pedido-cancelado/ | ClientePedidoCanceladoPage | US12, US13 S2-TSK-033, S2-TSK-034, S2-TSK-041, S2-TSK-042 |
| src/app/pages/cliente/cliente-pago/ | ClientePagoPage | US12, US18 S2-TSK-033, S2-TSK-034 |
| src/app/pages/cliente/cliente-pago-pendiente/ | ClientePagoPendientePage | US12, US18 S2-TSK-033, S2-TSK-034 |
| src/app/pages/operacion/op-pedidos/ | OpPedidosPage | US12, US15 S2-TSK-033, S2-TSK-034, S2-TSK-035, S2-TSK-036 |
| src/app/pages/operacion/op-cocina/ | OpCocinaPage | US15 S2-TSK-035, S2-TSK-036 |
| src/app/pages/operacion/op-pedido-detalle/ | OpPedidoDetallePage | US12, US15 S2-TSK-033, S2-TSK-034, S2-TSK-035, S2-TSK-036 |
| src/app/pages/operacion/op-pedido-listo/ | OpPedidoListoPage | US19 S2-TSK-037, S2-TSK-038 |
| src/app/pages/operacion/op-pedido-entregar/ | OpPedidoEntregarPage | US19 S2-TSK-037, S2-TSK-038 |
| src/app/pages/operacion/op-pedido-entregado/ | OpPedidoEntregadoPage | US19 S2-TSK-037, S2-TSK-038 |
| src/app/pages/operacion/op-reserva-llegada/ | OpReservaLlegadaPage | US25 S2-TSK-053, S2-TSK-054 |
| src/app/pages/operacion/op-reserva-atendiendo/ | OpReservaAtendiendoPage | US25 S2-TSK-053, S2-TSK-054 |
| src/app/pages/operacion/op-reserva-completada/ | OpReservaCompletadaPage | US25 S2-TSK-053, S2-TSK-054 |
| src/app/pages/operacion/op-reserva-expirada/ | OpReservaExpiradaPage | US26 S2-TSK-055, S2-TSK-056 |
| src/app/pages/cliente/cliente-ia/ | ClienteIaPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-recomendaciones/ | ClienteIaRecomendacionesPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-ingredientes/ | ClienteIaIngredientesPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-carta/ | ClienteIaCartaPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-sin-informacion/ | ClienteIaSinInformacionPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-cancelar/ | ClienteIaCancelarPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-cancelado/ | ClienteIaCanceladoPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-notificacion-cancelacion/ | ClienteIaNotificacionCancelacionPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-cancelacion-bloqueada/ | ClienteIaCancelacionBloqueadaPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/pages/cliente/cliente-ia-estado-bloqueado/ | ClienteIaEstadoBloqueadoPage | US03 · Funcionalidad prevista Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/home/ | Home | LP01 S2-TSK-003, S2-TSK-004 |

Los archivos exactos de cada carpeta se detallan en asignacion-equipo.json.

### Componentes modales y layouts

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |
| src/app/components/client-header/ | ClientHeader | Transversal Transversal / revisar |
| src/app/components/client-footer/ | ClientFooter | Transversal Transversal / revisar |
| src/app/components/chat-panel/ | ChatPanel | Transversal Transversal / revisar IA prevista: no implementar como servicio real. |
| src/app/layouts/cliente-layout/ | ClienteLayout | Transversal Transversal / revisar |

Los archivos exactos de cada carpeta se detallan en asignacion-equipo.json.

### Configuración y soporte

| Carpeta o archivo | Componente | Referencias y responsabilidad |
| --- | --- | --- |

## Archivos previstos

Las rutas de la fuente todavía ausentes se conservan como asignaciones previstas. No se crean archivos vacíos para aparentar implementación.
- docs/QA-RESERVAS-CRISTIAN.md: Cristian Condori.

Las credenciales, configuración personal y notas privadas permanecen locales. Estos documentos se comparten en Git.
