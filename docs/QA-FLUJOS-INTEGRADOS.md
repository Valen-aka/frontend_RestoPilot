# Verificación de recorridos locales — 02/11/2026

Rama: test/flujos-integrados. Base de código: develop 3685d07. Pruebas realizadas con la corrección de consistencia de reservas y Mis pedidos ya incorporados. Alcance solicitado: frontend de muestra.

## Resultado

**21 de 21 casos de navegador correctos**, más **93 de 93 pruebas existentes correctas**. Compilación de producción y chequeo estructural correctos: 120 escenarios conservados, 26 interfaces declaradas y 94 pendientes. El chequeo no acredita aceptación de todas las pantallas.

| Recorrido | Anchos | Casos | Comprobaciones |
| --- | --- | ---: | --- |
| Carrito → detalle/seguimiento → pago → historial | 320/390/768/1024/1440 | 5 | 2 × 38 + 28 = 104; confirmación #1043 independiente; Pendiente; modalidad Para llevar; pago Pendiente sin método inventado; retorno y conservación. Consulta posterior de #1034 conserva Entregado, S/ 38 y Efectivo. |
| Cocina → preparación → listo → entrega → cola/tablero | 320/390/768/1024/1440 | 5 | #1042; cancelar confirmación no cambia Pendiente; tres avances válidos con confirmaciones; líneas conservadas; estado final sin nuevas acciones; desaparece de cola y tablero activos. |
| Llegada → finalización → historial → consulta | 320/390/768/1024/1440 | 5 | #208; cancelar conserva ausencia de llegada; llegada 19:05; finalización 19:30; Completada y ambas fechas conservadas en resumen y ficha. #207 permanece Expirada y no admite acciones de atención. |
| Errores de consulta de cliente | 390/1440 | 2 | Carga y error sin tabla, reapertura y selección ajena sin desglose/progreso. Vacío legítimo sin sustituir por un ejemplo. |
| Rechazo y lectura anterior de cocina | 390/1440 | 2 | Error local de actualización conserva Pendiente; lectura anterior bloquea acciones. |
| Límite de llegada | 390/1440 | 2 | A las 19:15 se bloquea la llegada sin crear un timestamp ni inventar Expirada. El historial conserva la lectura recibida. |

Durante los casos se comprobaron errores JavaScript, ausencia de solicitudes de escritura/API y desbordamiento horizontal de página. La tabla puede desplazarse dentro de su propia región. Cada caso usa un contexto nuevo de navegador, por lo que sus muestras no heredan resultados del caso anterior.

No se detectaron defectos nuevos en los recorridos comprobados; esta rama añade el guion, la documentación y la exclusión de artefactos generados, sin modificar componentes del producto.

## Repetir las pruebas

Requisitos: dependencias del proyecto instaladas, Node compatible y una instalación disponible del paquete Playwright. El guion usa una instalación existente; no cambia package.json ni instala dependencias automáticamente. Si el paquete no está en la resolución normal de Node, definir PLAYWRIGHT_MODULE con su ruta absoluta. En Windows se utiliza Chrome instalado en su ubicación habitual; BROWSER_EXECUTABLE permite indicar otro ejecutable compatible. En otros sistemas puede utilizarse el Chromium disponible para Playwright.

Desde la raíz de esta copia del repositorio, iniciar Angular en modo desarrollo:

```powershell
node node_modules/@angular/cli/bin/ng.js serve --host 127.0.0.1 --port 4303
```

En otra terminal, desde la misma raíz:

```powershell
node scripts/flujos-integrados.cjs
```

Configuración opcional:

| Variable | Uso |
| --- | --- |
| PLAYWRIGHT_MODULE | Nombre o ruta al paquete playwright disponible. |
| BROWSER_EXECUTABLE | Ejecutable de Chrome/Chromium. |
| RP_QA_URL | URL de la aplicación local; valor predeterminado http://127.0.0.1:4303. Solo admite localhost/127.0.0.1/::1. |
| RP_QA_OUTPUT | Carpeta de artefactos; predeterminada artifacts/flujos-integrados. |
| RP_QA_SOURCE_COMMIT | Commit de código probado para identificar el resultado; en esta ejecución, 3685d07. |

El guion devuelve un código distinto de cero si un caso falla. Genera results.json y una captura por caso, incluyendo los fallidos. La carpeta predeterminada se excluye de Git para no mezclar capturas generadas con código.

Para las reglas y compilación:

```powershell
node --test scripts/cliente-pedidos.test.mjs scripts/cocina-priority.test.mjs scripts/cocina-transitions.test.mjs scripts/reserva-atencion.test.mjs scripts/reserva-expirada.test.mjs scripts/reserva-consistencia.test.mjs
node scripts/check-structure.mjs
node node_modules/@angular/cli/bin/ng.js build
```

## Interpretación y límites

- Son tres recorridos locales distintos. Cliente y cocina conservan fuentes de muestra independientes: esta prueba no atribuye al pedido temporal del carrito una aparición automática en cocina ni una actualización del seguimiento del cliente desde el tablero.
- US25 y US26 sí comparten la colección de reservas; se comprueba expresamente que la #208 completada no aparezca como Expirada al volver.
- Las acciones positivas se ejecutan mediante los controles de la interfaz. Solo se configuran entradas de prueba para adelantar el reloj fijo de muestra o provocar errores de consulta/actualización. Esto necesita el modo de desarrollo de Angular.
- El guion bloquea solicitudes de escritura, rutas /api y orígenes externos. No ejecuta cobros, avisos ni operaciones persistentes.
- Las capturas se usan como evidencia del caso; no son una auditoría visual exhaustiva ni certifican accesibilidad completa.
- La revisión de referencias Figma corresponde a docs/alineacion-specs. Estas ramas pueden revisarse y guardarse en commits independientes.
