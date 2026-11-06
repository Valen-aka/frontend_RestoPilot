# Verificación de US10 — carta del cliente

Rama: feature/cliente-carta. Alcance: S2-TSK-017 y S2-TSK-018. SPEC: [US10](specs/us10/SPEC.md).

## Resultado

- Checker y build de producción correctos; en este equipo NG_BUILD_SASS_EMBEDDED=0. Las 191 pruebas existentes pasaron.
- 21 comprobaciones HTTP controladas correctas: restaurante, filtro/URL, categoría vacía, detalle, agotados, 404, IDs inválidos, datos de otro local, errores/reintento, carrito acumulado y reemplazo confirmado, cambio de disponibilidad, sesión y respuestas tardías. Las variantes de pantalla consultan los datos reales, sin forzar muestras.
- 12 comprobaciones contra Spring Boot temporal 8082 y PostgreSQL de Supabase, a 390 y 1440 px: carta y categorías, precio/detalle, agotado y preparación del carrito con IDs reales. Sin POST de pedidos ni pagos.
- Sin desbordamiento global a 320/390/768/1440 ni errores JavaScript en los recorridos controlados. Capturas de carta móvil y detalle de escritorio inspeccionadas, usando imágenes alternativas cuando la respuesta carece de imagen.
- Se mantiene el carrito existente de US11; esta entrega no incorpora el PR pendiente de US14 ni modifica sus pantallas.

La sesión real se obtuvo mediante AuthService desde el harness de desarrollo: el formulario general de acceso sigue en su tarea independiente. La preparación del carrito es un borrador en memoria; no se afirma un pedido registrado. La referencia visual es la copia Figma indicada por el usuario para esta tarea; no se afirma equivalencia exacta de píxeles.

Evidencia sanitizada: [resultado](evidencias/us10/resultado.json).

## Reproducción

Con Angular en modo desarrollo y Playwright instalado:

~~~powershell
$env:RP_QA_URL='http://127.0.0.1:4351'
# PLAYWRIGHT_MODULE admite la ruta del módulo Playwright instalado fuera del repo.
node scripts/us10-api-browser.cjs
~~~

El guion intercepta todas las solicitudes /api; no necesita credenciales ni permite registrar pedidos. RP_QA_OUTPUT cambia la carpeta de artefactos predeterminada artifacts/us10. Las consultas reales usan credenciales locales fuera de Git.
