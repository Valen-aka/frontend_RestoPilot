# Verificación del frontend de autenticación

## Alcance

Esta fase comprende acceso, acceso con error, registro de cliente, registro de dueño, registro de restaurante, registro duplicado y bienvenida del dueño. Incluye los componentes y layouts compartidos necesarios para esas vistas. La referencia visual son las capturas locales proporcionadas por el usuario.

No incluye conexión HTTP, autenticación real, creación de cuentas, persistencia de credenciales, JWT ni aceptación del backend. El estado del inventario describe contenido visual y no equivale a una tarea funcional terminada.

## Matriz de comprobaciones

| Área | Caso y resultado esperado | Estado |
| --- | --- | --- |
| Estructura | Conservar 120 slugs únicos, archivos de pantallas y ocho modales con TS, HTML y CSS | Pasó `npm.cmd run check` durante la preparación |
| Compilación | Estructura y compilación de producción terminan sin errores; servidor de desarrollo compila | Pasó: la sesión principal confirmó build de producción y compilación dev; checker aprobado por QA |
| Acceso | La interfaz valida formato sin anunciar una sesión real | Flujo estático revisado; navegador comprobó los errores descritos abajo, sin autenticación real |
| Validación | Enviar vacío muestra errores asociados a cada campo y evita continuar | Pasó en acceso: errores visibles y foco al correo |
| Correo | Correo sin formato válido muestra error y conserva el foco adecuado | Pasó en acceso: error y foco al correo |
| Contraseñas | Política visible coherente; rechazar solo espacios y más de 72 bytes UTF-8 | Revisión estática y casos de navegador aprobados |
| Registro | Dueño válido continúa a restaurante; formularios válidos no anuncian cuentas creadas | Pasó: dueño continúa; cliente y restaurante muestran aviso de integración pendiente |
| Estados | Las vistas de error y duplicado renderizan por URL directa | Pasó; los enlaces de regreso se revisaron en código, no se documentó su clic |
| Rutas | `?vista=` de otra base vuelve a la vista canónica | Pasó: `registro-duplicado` sobre `/auth/login` muestra acceso canónico |
| URLs directas | Las siete vistas renderizan por URL directa | Pasó; atrás/adelante y recarga no se documentaron como casos separados |
| Escritorio | Revisar a 1440 × 900 y medir desbordamiento | Las siete vistas renderizan sin overflow medido; capturas de acceso y restaurante inspeccionadas |
| Móvil | Revisar capturas a 390 px y medir desbordamiento a 320 px | Capturas de las siete vistas inspeccionadas a 390 px; todas sin overflow DOM a 320 px |
| Accesibilidad | Etiquetas, asociación de errores y foco al primer inválido | Código revisado y foco probado; contraste, lector de pantalla, recorrido completo de teclado y Enter no verificados |
| Datos | Sin autenticación, cuentas, HTTP ni persistencia real; contraseña se limpia tras validación del registro cliente | Revisión estática de seguridad sin hallazgos pendientes; limpieza confirmada en navegador para registro cliente |
| Regresión | No modificar rutas ni contenido de los otros 113 slugs, landing o módulos de otros responsables | Inventario comparado con HEAD: solo cambian estado y booleano de los siete slugs autorizados; revisión integrada pendiente |

## Evidencia y limitaciones

El checker actualizado pasó `npm.cmd run check` durante la preparación. También se ejecutaron casos aislados en memoria: rechazó estado no booleano, slug duplicado, una pantalla menos, un archivo de modal ausente y una carpeta de modal menos. La comparación del inventario con HEAD confirmó que solo cambian `status` y `contenidoImplementado` de los siete slugs autorizados.

Las comprobaciones de navegador siguientes fueron realizadas por la sesión principal en un servidor local con datos de prueba. No constituyen una suite automatizada persistente ni verifican la integración del backend.

## Evidencia de navegador de la sesión principal

- Las siete rutas renderizaron a 1440 × 900 y a 320 px; la medición del DOM no detectó desbordamiento horizontal.
- Se inspeccionaron capturas de acceso en escritorio y a 390 px, acceso con error a 390 px, registro cliente a 390 px, registro dueño a 390 px, restaurante en escritorio y a 390 px, duplicado a 390 px y bienvenida a 390 px.
- Acceso vacío y correo inválido mostraron errores con foco al correo. Una contraseña formada solo por espacios mostró error.
- Registro cliente válido mostró el aviso de cuenta no creada y limpió la contraseña. Una contraseña de más de 72 bytes mostró error.
- Registro dueño válido navegó a restaurante.
- Restaurante con horario inválido y campos faltantes conservó foco en nombre; con solo horario inválido enfocó cierre. El envío válido mostró el aviso de restaurante y cuenta no creados.
- `/auth/login?vista=registro-duplicado` mostró la vista canónica de acceso.

La inspección cubre esos tamaños y casos concretos. No equivale a aceptación completa de accesibilidad ni a una comparación de píxeles contra Figma. No se verificaron contraste mediante herramienta, lector de pantalla, recarga y navegación atrás/adelante como casos independientes, ni un recorrido completo de teclado.

## Revisión estática de la implementación

Se revisaron las seis vistas auth, bienvenida, utilidades de formularios, layout, panel visual y componente de errores. Los formularios usan Reactive Forms, etiquetas asociadas por `for`/`id`, errores mediante `aria-describedby`, regiones vivas, tipos de entrada y atributos de autocompletado. La política de contraseña declarada coincide con el patrón y el límite de bytes del backend consultado. Los envíos válidos de acceso, cliente y restaurante explican que el servicio aún no está conectado.

Hallazgo P2 de foco corregido y cerrado: en `registro-restaurante.ts`, el foco se dirige a `#cierre` por horario inválido únicamente cuando `Object.values(this.form.controls).every(control => control.valid)` es verdadero. Si nombre u otro control está inválido, se conserva el foco al primer campo inválido de `validateForm`. La reproducción original era nombre vacío, apertura 18:00 y cierre 17:00. La corrección se verificó por relectura del código y por los dos escenarios de foco en navegador informados por la sesión principal.

Se confirmó además `nonBlank` en las contraseñas de acceso y acceso con error. El validador rechaza entradas formadas solo por espacios sin recortar ni modificar una contraseña válida. La sesión principal reportó compilación de producción y compilación del servidor de desarrollo correctas.

La comprobación visual y de interacción la realizó la sesión principal; este agente no abrió un navegador ni ejecutó otra compilación concurrente. La conexión inicial del navegador al servidor del entorno restringido no estuvo disponible; la sesión principal inició un servidor autorizado fuera de ese entorno para realizar los casos documentados. La revisión estática de seguridad informó que no quedan hallazgos pendientes en este alcance. Se mantienen las limitaciones de accesibilidad y de integración indicadas arriba.

La utilidad de foco usa el estado del FormControl y el atributo formControlName, sin depender de clases CSS que pueden actualizarse después del evento. Se comprobó en navegador que una contraseña superior a 72 bytes deja el foco en password y muestra el mensaje correspondiente.
