# Corrección US26 y verificación de interfaces implementadas

05/11/2026. Rama fix/us26-reservas-expiradas. Base frontend 2bb4a2b más los cambios locales de esta entrega. [Resumen estructurado](evidencias/us26-fix/resumen.json).

## Corrección

Las pantallas cliente-reservas, cliente-reserva-expirada y cliente-reserva-completada habían reemplazado la consulta API por ReservaStore con datos de muestra. Vuelven a componer ReservaExpiradaView y ReservaExpiradaStore. Se conserva la consulta de todos los estados, los filtros Material sobre la colección recibida y las fechas reales. No se implementan las escrituras de otras historias.

reservaSelection admite reservaId, el alias anterior id y el estado de navegación. Un parámetro explícito inválido bloquea la consulta; no se sustituye por un ID anterior. La variante completada también exige sesión. El detalle conserva el estado del servidor aunque la variante de URL se llame expirada.

Se recuperan carga, vacío, error, lectura anterior, rechazo de cuentas ajenas, fecha de expiración ausente, disponibilidad libre/ocupada y coherencia con US25. No se calcula ni ejecuta expiración desde Angular.

Se completó el contrato de WorkspaceShell (inputs live/restaurante, salida signOut y fecha), utilizado ya por su plantilla y CategoriasView. Su ausencia impedía compilar antes de esta corrección. Los valores por defecto conservan el modo de vista previa de las otras pantallas.

## Pruebas ejecutadas

| Comprobación | Resultado | Alcance |
| --- | --- | --- |
| Estructura | Correcta: 120 escenarios, 74 interfaces declaradas | No acredita aceptación de esas interfaces |
| Producción | Build correcto | Sass JavaScript oficial; Windows bloquea el ejecutable Sass nativo |
| Frontend | 191 pruebas correctas | Todas las suites existentes más dos casos nuevos de identidad |
| Navegador API simulada | 126 recorridos correctos | US11:10, US12:25, US13:21, US15:13, US19:15, US25:23, US26:19 |
| Formularios de vista previa | 14 recorridos correctos | Acceso, registro cliente/dueño/restaurante, administrador, pago y ajuste de pedido, a 390/1440; sin escrituras HTTP |
| Landing | Cuatro anchos correctos | 320/390/768/1440, imágenes, contenido y destinos de acceso/registro |
| Categorías | 13 verificaciones DOM correctas usando Volver | Sesión mediante AuthService en el harness; no acredita el formulario real de login |
| Renderizado general | 136/148 comprobaciones correctas | 74 pantallas declaradas implementadas a 390/1440; 12 desbordamientos móviles detectados |
| Backend integrado | 114 pruebas correctas; una omitida de 115 registradas | Copia origin/develop 85353b7, Spring/JWT/JPA/H2; sin tocar la rama del usuario ni PostgreSQL |

Las pruebas iniciales de US15/US19 consultaban contenido retenido o el botón antes de terminar el refresco. Se ajustaron sus esperas al resultado visible; se conservaron las mismas expectativas y se repitieron ambas suites completas.

## Hallazgos abiertos fuera de US26

- cliente-reservar: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-plano: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-sin-disponibilidad: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-reserva-revisar: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-reserva-pendiente: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-reserva-confirmada: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-reserva-rechazada: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-reserva-cancelada: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-reserva-editar: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-reserva-cancelar: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- cliente-reserva-cancelacion-bloqueada: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.
- op-reserva-detalle: desbordamiento horizontal a 390px. Responsable en inventario: Cristian Condori.

- Categorías: el diálogo establece disableClose=true y no se cierra con Escape. La prueba original de Escape falla; mediante Volver cancela, restaura foco y permite continuar las otras comprobaciones. No se modificó ese componente en esta entrega.
- Backend real en localhost:8081: GET /api/reservas/me sin sesión devolvió 403; login con credenciales inválidas, 401; preflight CORS desde localhost:4200, 200. GET /v3/api-docs devolvió 500. Son comprobaciones básicas, no un recorrido autenticado.
- PostgreSQL está escuchando en 5432. No hubo credenciales de cuentas de prueba disponibles y DEMO_ENABLED está desactivado. No se activaron muestras, crearon cuentas ni modificaron datos del equipo. Los recorridos completos contra PostgreSQL siguen sin verificarse.
- Las interfaces de vista previa siguen sin integrar sus operaciones. La validación de sus formularios no las convierte en tareas API terminadas.

## Reproducción

Desde frontend, con dependencias instaladas:

~~~powershell
$env:NG_BUILD_SASS_EMBEDDED='0'
npm.cmd run verify
$qaTests = Get-ChildItem scripts -File | Where-Object Name -match '\.test\.(cjs|mjs)$' | ForEach-Object FullName
node --test $qaTests
~~~

NG_BUILD_SASS_EMBEDDED=0 es la opción existente de Angular para usar Sass JavaScript. No cambia package.json, no instala dependencias ni desactiva controles del equipo. Puede omitirse donde el compilador nativo funcione.

US26 y US25: seguir GUIA-INTEGRACION-RESERVAS.md; ejecutar los guiones scripts/us26-api-browser.cjs y scripts/us25-api-browser.cjs con Angular de desarrollo y sus simulaciones locales. El guion US26 incluye filtro, enlace anterior id, vista completada e ID inválido explícito con selección anterior.

Renderizado general: scripts/qa-pantallas-implementadas.cjs usa RP_QA_URL, RP_MOCK_URL, RP_QA_OUTPUT y PLAYWRIGHT_MODULE. Predeterminados Angular 4319 y simulación US26 4320. Inyecta una sesión sintética mediante AuthService solo desde el harness de desarrollo y redirige HTTP hacia el mock. Devuelve error si detecta pantallas vacías, errores JavaScript o desbordamiento. Es revisión básica de renderizado, no prueba de operaciones. Con los 12 problemas actuales debe señalar fallos.

La documentación y los resultados no equivalen a aceptación total, paridad nueva con Figma, auditoría completa de accesibilidad ni despliegue. No se crearon commits, push ni PR.
