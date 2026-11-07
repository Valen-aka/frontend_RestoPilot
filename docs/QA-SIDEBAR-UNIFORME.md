# Navegación uniforme — 6 de noviembre de 2026

Rama: fix/sidebar-uniforme. Alcance: navegación visual compartida de operación y dueño, sin cambios en las operaciones de negocio ni en la base.

## Corrección

CocinaShell y WorkspaceShell duplicaban sidebar y cabecera con diferentes márgenes, fuentes, tarjeta de restaurante y destino de Carta. CocinaShell ahora delega en WorkspaceShell. Se conserva un único ancho de 260 px en escritorio, espaciado y altura de enlaces, marca, perfil y cabecera. La identidad del restaurante se consulta una vez por sesión desde un contexto compartido y se elimina al cambiar de cuenta. Los textos de muestra de una pantalla no sustituyen esa identidad.

El logo y el pie de cuenta permanecen visibles; el menú dispone de desplazamiento interno cuando no cabe. Se conserva su posición al navegar. Carta abre siempre platos y esa pantalla mantiene un enlace explícito a Categorías. Se preservan los accesos propios del dueño. La navegación de cliente y autenticación conserva su composición correspondiente.

## Verificación

- Estructura y compilación de producción aprobadas; 239 pruebas existentes aprobadas.
- Comparación de dimensiones, fuentes, enlaces y restaurante en diez rutas: inicio, pedidos, cocina, platos, categorías, reservas, mesas, pagos, reportes y notificaciones.
- Un único sidebar y una sola opción activa en cada ruta; posición del menú conservada y marca visible durante el desplazamiento.
- Pedidos y platos comprobados a 1440, 1024, 390 y 320 px, sin desbordamiento horizontal global. En móvil: abrir, Escape, foco y selección incluso de la ruta actual.
- Inicio, acceso a administradores e identidad propios del dueño tras cambiar de cuenta; sin mezcla con el restaurante del administrador.
- Sin errores JavaScript ni solicitudes a localhost:8081. Se utilizaron cuentas reales sin escrituras de pedidos, reservas o pagos.

Evidencias sanitizadas en [evidencias/sidebar-uniforme](evidencias/sidebar-uniforme). Se inspeccionaron capturas de pedidos y platos en escritorio y de móvil. No acredita funciones pendientes de otras US ni una auditoría exhaustiva de accesibilidad.

## Repetir

Iniciar el frontend de desarrollo. Configurar RP_QA_ACCESS_FILE con un JSON privado fuera de Git: una lista de cuentas {correo,password,rol}; requiere ADMINISTRADOR y DUENO de restaurantes diferentes. No copiar credenciales al repositorio. PLAYWRIGHT_MODULE y BROWSER_EXECUTABLE permiten indicar Playwright y Chrome. RP_QA_URL admite cambiar localhost:4200. Ejecutar node scripts/sidebar-real-browser.cjs; las capturas y resultados se guardan en artifacts/sidebar-uniforme.
