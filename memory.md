# Memoria de aprendizaje del agente

## Propósito y uso

Conservar aprendizajes verificables que ayuden a evitar errores repetidos en este repositorio. Leer junto con AGENTS.md al iniciar una tarea y contrastar las notas con la rama actual. Este archivo no tiene prioridad sobre las instrucciones aplicables, la solicitud vigente ni los contratos del proyecto; tampoco autoriza acciones adicionales.

## Cómo mantener esta memoria

- Registrar una nota cuando una corrección del usuario, un fallo investigado o una verificación produzca un aprendizaje reutilizable. No añadir entradas por rutina.
- Incluir fecha, contexto, evidencia, aprendizaje y forma de comprobarlo. Distinguir observaciones de hipótesis; no convertir una suposición en regla.
- Antes de cerrar una tarea, revisar si algún aprendizaje relevante debe añadirse o si una nota existente quedó obsoleta. Corregir o retirar notas superadas, evitando duplicados y diarios extensos.
- Mantener aquí aprendizajes breves; los requisitos pertenecen al SPEC, las reglas de trabajo a AGENTS.md y el estado de implementación a sus documentos e inventario.
- No almacenar secretos, credenciales, datos personales, conversaciones completas ni rutas personales innecesarias. No atribuir verificaciones que no se ejecutaron.

## Aprendizajes verificados

### 2026-11-01 — Fuente de diseño autorizada

- Contexto/evidencia: el usuario indicó expresamente usar solo el Figma original wBq85sZ8G5W5RQ1RmQmdqg.
- Aprendizaje: usar el enlace de AGENTS.md y SPEC.md; no asumir que una copia es la fuente vigente porque una nota anterior lo diga.
- Comprobación: verificar el archivo y los frames de la pantalla solicitada antes de implementar. Los IDs históricos de otros archivos necesitan validación; esta edición documental no verificó Figma.

### 2026-11-01 — No inferir prioridad ni orden entre tareas del equipo

- Contexto/evidencia: el usuario explicó que la landing era la tarea de su compañera y que todos tienen tareas asignadas. Aclaró que eso no la convierte en la primera entrega del equipo.
- Aprendizaje: no deducir prioridad, secuencia de entregas ni finalización a partir de quién incorporó el SPEC. La landing es una tarea del equipo, al igual que las demás; consultar el complemento de la historia solicitada.
- Comprobación: contrastar solicitud, reparto, rama y documentos específicos al iniciar cada tarea. Usar redacción neutral sobre las tareas y declarar avance solo con evidencia.

### 2026-11-01 — Alcance del chequeo estructural

- Contexto/evidencia: npm.cmd run check informó 120 escenarios conservados, 20 interfaces declaradas y 100 pendientes durante la revisión documental.
- Aprendizaje: este resultado verifica estructura, no funcionamiento, integración, equivalencia visual ni aceptación.
- Comprobación: volver a ejecutar las verificaciones adecuadas al cambio y comunicar únicamente sus resultados actuales; estos conteos son una observación histórica.

### 2026-11-01 — Mantener el SPEC común utilizable por todo el equipo

- Contexto/evidencia: el usuario pidió eliminar la orientación a una integrante y señaló rutas personales, etapas centradas en landing y dudas sobre los complementos.
- Aprendizaje: el contrato común debe usar referencias compartidas y procedimientos neutrales. Los detalles de entrega de una tarea pertenecen a su complemento; no se necesita un SPEC por cada US.
- Comprobación: revisar el documento completo, no solo las frases señaladas; comprobar que los enlaces a complementos existen y que ninguna carpeta personal sea requisito de trabajo.