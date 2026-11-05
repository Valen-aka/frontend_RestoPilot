# Home — Landing de RestoPilot

Interfaz pública de esta aplicación Angular. Ruta /, componente Home. Alcance LP01 / S2-TSK-003 y S2-TSK-004; sin backend, autenticación, cobros ni IA conectada.

## Implementación

- home.ts: estados locales, datos ilustrativos y navegación/foco.
- home.html: cabecera, ocho secciones principales y footer.
- home.css: variante de marketing, Manrope/DM Sans, responsive y personalización local de Material.
- public/assets/landing/: ilustración e icono originales exportados de Figma, fuentes y licencias.
- No se modificaron el tema global, las rutas ni las otras 120 pantallas.

Decisión confirmada por el usuario: CTA «Empieza con RestoPilot» → /auth/registro-dueno; demos locales en la propia landing. Acceso «Sentarme a la mesa» → /auth/registro. Las rutas de destino ya existen; comprobar la navegación no acredita funcionamiento de sus formularios.

Las muestras de soluciones/recorrido son estados locales de presentación, usando el contenido del SPEC. «Conocer el lado del equipo», «Explorar el prototipo» y los accesos IA llevan a muestras de la página. No hay operaciones persistentes ni acceso a pantallas protegidas para simular una demo. Términos se muestran como pendientes de publicación, sin enlace ficticio. IA se identifica como prevista.

## Recursos y licencias

- Ilustración: Figma sRxKEwFdrMKfXPosGFvoHc, nodo 115:161; exportación PNG completa de la ilustración, no captura de página.
- Icono de marca: nodo 115:755 del mismo diseño; SVG original.
- [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope) y [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans), archivos variables oficiales servidos localmente. Licencias SIL OFL incluidas en public/assets/landing/fonts/.
- Ninguna URL de asset temporal se usa en la aplicación. Fonts e imágenes están aisladas a la landing; la tipografía global no cambia.

## Verificación del 01/11/2026

Se ejecutaron equivalentes directos de los scripts del proyecto en el runtime disponible:

- node scripts/check-structure.mjs: correcto, conserva 120 escenarios y ocho modales.
- node node_modules/@angular/cli/bin/ng.js build: compilación de producción correcta.
- Navegador Chrome local: 320, 390, 768, 1280 y 1440 px, sin desbordamiento horizontal. Un h1, ocho secciones más footer; fuentes e imágenes cargan.
- Menú móvil: abrir/cerrar, Escape devuelve foco y elegir una sección mueve foco a destino.
- FAQ: respuesta visible y un solo panel abierto. Recorrido/soluciones cambian muestra local y aria-pressed.
- Navbar compacta después del hero; skip link y teclado; CTA a registro restaurante y acceso a registro cliente.
- Zoom de contenido 200 % en viewport de 1280: sin desbordamiento horizontal.
- Sin pageerror ni solicitudes fallidas durante las pruebas. Aviso IA con color de texto legible y FAQ sin sombras comprobados tras corrección.
- Capturas completas desktop/mobile revisadas frente a la referencia. Hay adaptaciones locales para controles Material, demos y avisos de funcionalidad prevista; no se afirma equivalencia exacta de píxeles ni certificación completa de accesibilidad.

Las pruebas automatizadas y capturas de esta sesión están fuera del repositorio en la carpeta de trabajo landing-implementation; no se añadieron dependencias de pruebas al proyecto.

## Límites

Pendientes de aceptación humana y documento legal definitivo. El backend y los formularios de destino no se probaron ni implementaron aquí. No se publicaron cambios, no se creó commit y no se marca aceptación funcional de otros módulos.
