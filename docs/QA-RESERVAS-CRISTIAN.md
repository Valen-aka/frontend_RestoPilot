# Verificación y Aseguramiento de Calidad: Módulo de Reservas

**Responsable:** Cristian Condori (`overcp73@gmail.com` / `Oveer73`)  
**Proyecto:** Frontend RestoPilot  
**Alcance:** Flujos de Reservas Cliente y Gestión Operativa (US05, US06, US07, US08, US09, US17, US25, US26, US27, US29).

---

## 1. Alcance General

Este documento consolida la verificación técnica, funcional y estructural de las interfaces implementadas por Cristian Condori a lo largo del cronograma de 3 días:

1. **Día 1 (Flujo de reserva y selección de mesas - US05, US06):**
   - `cliente-reservar`: Búsqueda de disponibilidad (fecha, turno, comensales y zona).
   - `cliente-plano`: Plano interactivo y croquis del salón restaurante La Mesa Verde con mesas mapeadas por capacidad.
   - `cliente-sin-disponibilidad`: Estado alternativo ante aforo copado o ausencia de disponibilidad.
   - `cliente-reserva-revisar`: Pantalla de verificación previa y resumen de solicitud antes de confirmarla.
   - Arquitectura compartida `reserva-ui`: `reserva.model.ts`, `reserva-store.ts`, `reserva-view.css`.

2. **Día 2 (Gestión de historial, estados, reprogramación y cancelación - US07, US08, US09, US25, US26):**
   - `cliente-reservas`: Listado de reservas con chips de filtrado reactivo (`TODAS`, `PENDIENTE`, `CONFIRMADA`, `COMPLETADA`, `EXPIRADA`, `CANCELADA`).
   - Vistas de detalle de estado: `cliente-reserva-pendiente`, `cliente-reserva-confirmada`, `cliente-reserva-rechazada`, `cliente-reserva-cancelada`, `cliente-reserva-expirada` (US26), `cliente-reserva-completada` (US25).
   - `cliente-reserva-editar` (US08): Formulario reactivo `form0` para modificar fecha, hora y comensales, con la regla estricta de retorno al estado `PENDIENTE`.
   - `cliente-reserva-cancelar` (US09): Cancelación con motivo opcional hasta 300 caracteres y diálogo modal `cliente-reserva-cancelar-dialog` (`MatDialog`).
   - `cliente-reserva-cancelacion-bloqueada` (US09): Regla de bloqueo autónomo cuando faltan $\le 2$ horas con derivación telefónica a recepción al `(01) 445-8920`.

3. **Día 3 (Gestión operativa en salón y auditoría administrativa - US17, US27, US29):**
   - `op-reserva-nueva` (US27): Formulario administrativo `form0` para registrar reservas telefónicas o presenciales en estado pendiente.
   - `op-reserva-detalle` (US29): Ficha de control de aforo, auditoría de solicitud pendiente y acciones de confirmación o rechazo.
   - `op-reserva-rechazar` (US17): Formulario `form0` con motivo de rechazo obligatorio no vacío (mínimo 5 caracteres).
   - `op-reserva-rechazada` (US17): Constancia administrativa de solicitud desestimada con liberación inmediata de mesa en la agenda.

---

## 2. Matriz de Comprobaciones Funcionales y de Reglas de Negocio

| Requerimiento / Regla | Pantalla / Componente | Caso de prueba y resultado esperado | Estado |
| :--- | :--- | :--- | :--- |
| **US05 - Búsqueda de disponibilidad** | `cliente-reservar` | Búsqueda con comensales positivos y fecha válida filtra mesas del salón según aforo. | **Aprobado** |
| **US05 - Plano interactivo** | `cliente-plano` | Representación gráfica del restaurante por zonas; mesas ocupadas no permiten selección; mesas libres se seleccionan con borde y feedback accesible. | **Aprobado** |
| **US05 - Sobrecupo / Sin aforo** | `cliente-sin-disponibilidad` | Renderiza sugerencias alternativas y enlaces para cambiar turno o fecha si no hay mesas con capacidad. | **Aprobado** |
| **US06 - Solicitud sin cobro** | `cliente-reserva-revisar` | Muestra resumen exacto; aclara explícitamente que no hay cargo bancario ni pasarela en esta etapa. | **Aprobado** |
| **US07 - Listado y filtros** | `cliente-reservas` | Barra de chips filtra reactivamente la lista en memoria según el estado (`PENDIENTE`, `CONFIRMADA`, etc.). | **Aprobado** |
| **US07 - Navegación resiliente** | `cliente-reserva-*` | Lectura dual: lee `state.reservaId` o `queryParam.id`; resiste recarga de página (F5) sin perder datos. | **Aprobado** |
| **US08 - Reprogramación** | `cliente-reserva-editar` | Modificar fecha o turno conserva restaurante y retorna la reserva al estado `PENDIENTE` para reevaluación. | **Aprobado** |
| **US09 - Cancelación anticipada** | `cliente-reserva-cancelar` | Permite anulación con motivo opcional de hasta 300 caracteres si faltan $> 2$ horas para la visita. | **Aprobado** |
| **US09 - Modal de confirmación** | `cliente-reserva-cancelar-dialog` | Diálogo modal Material advierte liberación irreversible de mesa antes de ejecutar la acción. | **Aprobado** |
| **US09 - Frontera de 2 horas** | `cliente-reserva-cancelacion-bloqueada` | Si faltan $\le 2$ horas, bloquea anulación web e indica llamar a la central telefónica `(01) 445-8920`. | **Aprobado** |
| **US17 - Rechazo con motivo** | `op-reserva-rechazar` | Campo `motivo` obligatorio (mínimo 5 caracteres); no admite envíos en blanco. | **Aprobado** |
| **US17 - Mesa liberada** | `op-reserva-rechazada` | Constancia confirma que el comensal fue notificado y la mesa quedó disponible en el salón. | **Aprobado** |
| **US25 - Visita completada** | `cliente-reserva-completada` | Muestra constancia de atención concluida y botón «Hacer una nueva reserva». | **Aprobado** |
| **US26 - Expiración por tolerancia** | `cliente-reserva-expirada` | Visualiza caducidad tras superar los 15 minutos de tolerancia sin registro de llegada presencial. | **Aprobado** |
| **US27 - Registro manual** | `op-reserva-nueva` | Personal de recepción registra clientes telefónicos/presenciales asignando mesa en estado pendiente. | **Aprobado** |
| **US29 - Auditoría de reserva** | `op-reserva-detalle` | Visualiza ficha técnica del salón con opciones para «Confirmar reserva», «Rechazar» o «Reprogramar». | **Aprobado** |
| **QA Móvil - 390px (Viewport celular)** | *12 pantallas asignadas* | Cero desbordamiento horizontal en 390px (iPhone 12/14/15/Android viewport). El diseño de escritorio se conserva al 100%. | **Aprobado** |

---

## 3. Verificación Estructural y Calidad de Código

### A. Chequeo de estructura (`scripts/check-structure.mjs`)
- **Ejecución:** `node scripts/check-structure.mjs`
- **Resultado:** 120/120 escenarios conservados. 51 interfaces declaradas con plantilla HTML válida.
- **Validación de modales:** Se conservaron íntegras las 8 carpetas de diálogos requeridas (`cliente-reserva-cancelar` y modales de operación).
- **Inventario:** Se actualizaron únicamente los slugs correspondientes a Cristian Condori en `src/app/screen-manifest.json` sin alterar los módulos de otros integrantes.

### B. Compilación de producción (`ng build`)
- **Ejecución:** `node ./node_modules/@angular/cli/bin/ng.js build`
- **Resultado:** `Application bundle generation complete` (0 errores, 0 warnings).
- **Diagnósticos extendidos:** Se verificó la ausencia de advertencias de Angular Compiler (como `NG8107` o incompatibilidades de tipos estrictos).

---

## 4. Trazabilidad de Commits y Ramas Git

El desarrollo se ejecutó de forma incremental bajo la estrategia GitFlow:

1. **Rama `feature/cliente-reservar` (Día 1):**
   - `7cb87a1`: `feat(reservas): modelo de datos, store reactivo y estilos base de reservas`
   - `d45b59f`: `feat(reservas): pantalla de busqueda y seleccion inicial de mesa (US05)`
   - `bb87dc5`: `feat(reservas): plano interactivo de distribucion y vista sin disponibilidad (US05, US06)`
   - `b11562b`: `feat(reservas): revision y confirmacion previa de solicitud de reserva (US06)`
   - **Pull Request #22:** Fusionado en `develop`.

2. **Rama `feature/cliente-reserva-estados` (Día 2):**
   - `853b473`: `feat(reservas): implementar listado de reservas del cliente con filtros por estado (US07)`
   - `d612c7a`: `feat(reservas): vistas de detalle de reserva para estados pendiente, confirmada, rechazada, expirada y completada (US07, US25, US26)`
   - `af4eb22`: `feat(reservas): pantalla de modificacion y reprogramacion de reservas con regla de reevaluacion (US08)`
   - `735b272`: `feat(reservas): cancelacion voluntaria con dialogo modal y bloqueo por politica de 2 horas (US09)`
   - **Pull Request #23:** Fusionado en `develop`.

3. **Rama `feature/operacion-reservas-gestion` (Día 3):**
   - `feat(operacion): pantalla de alta administrativa de reserva presencial y telefonica (US27)`
   - `feat(operacion): detalle operativo y flujo de rechazo con motivo obligatorio (US17, US29)`
   - `docs(qa): matriz de pruebas, trazabilidad de historias y aseguramiento de calidad (Cristian Condori)`
   - **Pull Request #25:** Integración final en `develop`.

4. **Rama `fix/reservas-responsive-390px` (Atención a observaciones de QA / Líder):**
   - `fix(reservas): resolver desbordamiento horizontal a 390px mediante media queries móviles sin alterar formato desktop`
   - Incorporación de `@media (max-width: 600px)` y `@media (max-width: 1100px)` en hojas de estilo del módulo de reservas (`reserva-view.css`, `cliente-plano.css`, vistas de detalle, y pantallas operativas).
   - Verificación estricta: resolución móvil 390px limpia sin scroll horizontal, navegación táctil suave, y formato de escritorio ($\ge 1024$px / 1440px) 100% inalterado.

---

## 5. Conclusiones

Todas las pantallas, componentes, reglas de negocio, validaciones reactivas, diálogos y adaptabilidad responsiva móvil asignados a Cristian Condori fueron implementados en su totalidad, cumpliendo los estándares de diseño de RestoPilot, accesibilidad semántica y verificaciones de compilación del proyecto.
