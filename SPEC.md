# SPEC — RestoPilot

## Datos

- Aplicación: frontend_RestoPilot; Angular 22.2.0 y Angular Material 22.2.3 ya instalados.
- Figma vigente: https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=5-124
- Guía de estilos: página Style, 5:124. Landing: página 0:1. Aplicación: página RestoPilot, 5:92.
- Primera entrega: [Landing](docs/specs/landing/SPEC.md), rama recomendada `feature/landing`.

## Objetivo

Convertir los frames de Figma en interfaces Angular, siguiendo el laboratorio: base compartida → pantalla en una rama feature → revisión → PR hacia develop → integración final hacia main.

Este es el SPEC común del proyecto. La única pantalla preparada en esta etapa es la landing, definida en docs/specs/landing/SPEC.md. No se crean SPEC de otras funcionalidades hasta solicitarlas.

## Fuentes y alcance

Leer AGENTS.md y el SPEC de la funcionalidad antes de editar. El reporte report_1ACC0236-20262.pdf, §4.3.2, páginas físicas 215–221, define tareas; los dos laboratorios definen el procedimiento. La solicitud vigente usa el archivo Figma de la sección Datos; los enlaces al archivo antiguo de AGENTS.md son antecedentes, no se trasladan automáticamente.

Primero implementar interfaz y navegación: HTML/CSS, Angular Material, responsive y validaciones locales cuando correspondan. No integrar HTTP, JWT, persistencia, pagos ni IA en esta etapa. Las tareas de integración del reporte quedan identificadas para una entrega posterior. No mostrar éxitos reales de operaciones sin servicio conectado.

Los ejemplos de EventSales del laboratorio no son requisitos de RestoPilot. No copiar roles de participante/organizador ni el aviso de compra segura. El video aportado no pudo recuperarse; esta estructura se basa en el laboratorio y en el diagrama compartido, sin atribuirle contenido no consultado.

## Estructura

```text
SPEC.md                         Reglas comunes
docs/specs/landing/SPEC.md       Primera entrega
src/app/home/                   Landing existente
src/app/pages/                  Pantallas existentes
src/app/routes/                 Rutas por grupo
src/app/layouts/                Layouts existentes
src/app/components/             Componentes compartidos
src/app/dialogs/                Diálogos existentes
public/assets/                  Recursos locales
```

Conservar componentes standalone con archivos .ts/.html/.css separados. Reutilizar la estructura, tema, assets y rutas existentes; no regenerar el proyecto ni instalar dependencias. Usar routerLink, @if y @for con track. Las URLs con ?vista= son estados de pantalla según screen-manifest.json, no endpoints.

## Diseño y heurísticas

Leer el frame exacto desktop/mobile antes de implementar. Recuperar captura, propiedades y assets; los metadatos por sí solos no prueban apariencia. No inventar IDs ni deducir breakpoints únicamente de dos frames. Mantener las correcciones expresamente aprobadas por el usuario.

Aplicar [las diez heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/): estado visible, lenguaje familiar, salida de acciones, consistencia, prevención de errores, opciones reconocibles, eficiencia, contenido esencial, recuperación de errores y ayuda contextual. Documentar aplicación y evidencia por pantalla; no afirmar cumplimiento solo por una captura. Añadir teclado, foco visible, etiquetas y reduced-motion cuando corresponda.

## Flujo de trabajo

1. Revisar rama y cambios actuales; no descartar trabajo existente.
2. Actualizar develop y crear feature/<pantalla> cuando se autoricen esas operaciones. Mantener PR pequeños; un complemento puede contener varios estados que se entregan en cambios separados.
3. Pedir: «Lee AGENTS.md, SPEC.md y docs/specs/<funcionalidad>/SPEC.md. Implementa únicamente la pantalla y los estados indicados, etapa visual. Verifica el frame de Figma, reutiliza los archivos actuales y registra pendientes».
4. Revisar escritorio/móvil, navegación, foco y estados. Comparar con el diseño y registrar evidencia.
5. Ejecutar npm.cmd run check y npm.cmd run build para implementación; corregir fallos justificados sin desactivar controles.
6. Commit tipo(pantalla): descripción en minúsculas. PR feature → develop con revisión de un compañero.
7. Cuando el incremento esté revisado: PR develop → main con merge commit, sin squash según laboratorio. Tag v1.0.0 opcional. No publicar automáticamente.

No se crean ramas, commits ni PR al redactar estos SPEC. El SPEC de landing no habilita implementar funcionalidades vecinas.

## Verificación

Para cambios documentales: revisar enlaces, IDs de tareas y ejecutar el chequeo de estructura disponible. Para interfaces: además compilar y revisar en navegador; una compilación no valida diseño, accesibilidad ni integración.

Consultar docs/ASIGNACION-EQUIPO.md y docs/asignacion-equipo.json para la coordinación vigente. No modificar el reparto ni incluir nombres personales en los SPEC.
