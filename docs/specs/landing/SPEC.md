# SPEC — Landing de RestoPilot

Fecha de revisión: 01/11/2026. Estado: especificación preparada; interfaz pendiente de implementar. Funcionalidad LP01, tareas S2-TSK-003 y S2-TSK-004. Rama de implementación propuesta: feature/landing.

Leer el [SPEC común](../../../SPEC.md) y [AGENTS.md](../../../AGENTS.md). Esta especificación detalla únicamente la landing y no autoriza implementar otras pantallas.

## 1. Objetivo y alcance

Presentar RestoPilot, explicar cómo conecta el servicio del restaurante y permitir explorar sus capacidades y los accesos de la aplicación. La primera entrega es interfaz responsive y navegación local con Angular Material dentro del frontend existente.

| Tarea original | Cobertura de esta entrega |
| --- | --- |
| S2-TSK-003 | Identidad, propuesta de valor, funcionalidades, secciones y CTA en escritorio/móvil |
| S2-TSK-004 | Accesos a rutas de aplicación y verificación de navegación escritorio/móvil |

LP01 es un elemento de backlog; las pruebas LP-Lxx de este documento son identificadores locales de verificación, no criterios US añadidos al reporte.

No incluye HTTP, autenticación real, registro de cuentas, pedidos/reservas operativos, cobros, IA conectada, cambios de backend ni despliegue. Los ejemplos de carta, pedido y asistente se presentan como ilustraciones. No usar un layout autenticado para envolver Home ni crear otra aplicación, repositorio o servidor de landing.

## 2. Fuentes y evidencia

[Figma vigente: página Landing](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=0-1).

| Referencia | ID | Medidas del nodo |
| --- | --- | --- |
| [RestoPilot / Landing · Escritorio](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=115-144) | 115:144 | 1280 × 6278.42 px |
| [RestoPilot — Buen servicio. Buenas historias.](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=115-781) | 115:781 | 390 × 7238 px |
| [Navbar · Estado de scroll](https://www.figma.com/design/sRxKEwFdrMKfXPosGFvoHc/RestoPilot--Copy-?node-id=115-773) | 115:773 | 263 × 101 px; contiene etiqueta explicativa y burbuja |
| Guía común de aplicación | 125:3 en Style 5:124 | Fundamentos compartidos, no todas las propiedades de marketing |

Se consultaron estructura, textos completos, estilos de nodos seleccionados, reacciones y capturas de ambos frames el 01/11/2026. Las capturas completas sirven para composición; el texto pequeño se recuperó del modelo Figma. No se ejecutó el prototipo ni el frontend.

El render mobile incluyó contenido fuera del frame (422 × 7319 frente al nodo de 390 × 7238), entre ello el enlace «Saltar al contenido» situado por encima del frame. El Body mide aproximadamente 7241.36 px. No copiar recortes, desbordes o esas alturas como restricciones CSS: probar el contenido real dentro del viewport.

### Interacciones efectivamente recuperadas

Las instancias desktop 115:154, 115:710 y 115:769 tienen ON_HOVER → CHANGE_TO hacia 115:64, y ON_CLICK sin acciones. No demuestran destino de navegación. No se recuperaron reacciones en mobile ni en la burbuja de scroll. Esto no prueba ausencia de comportamiento en cualquier otra versión.

Los destinos y comportamientos propuestos más abajo se distinguen de hechos del prototipo. No afirmar que se probaron clics ni que existe un registro funcional.

## 3. Estructura y archivos de implementación

| Archivo | Responsabilidad |
| --- | --- |
| src/app/home/home.ts | Home standalone, imports y estados locales necesarios |
| src/app/home/home.html | Estructura semántica y contenido |
| src/app/home/home.css | Composición y variante visual específica de landing |
| public/assets/landing/ | Assets exportados necesarios; crear solo cuando se implemente |
| src/app/home/README.md | Referencia local de alcance; actualizar únicamente si cambia información de implementación |

La ruta / ya carga Home en src/app/app.routes.ts. No modificarla por conveniencia. No cambiar screen-manifest.json: la landing es adicional a las 120 pantallas. Conservar base global en src/styles.css y tema de aplicación en src/material-theme.scss.

Reutilizar Angular Material instalado; imports explícitos según uso real: RouterLink, MatButtonModule, MatIconModule, MatMenuModule y MatExpansionModule son candidatos, no dependencias nuevas. Usar @if/@for con track. Datos locales de presentación no son DTO ni servicios.

Estado local propuesto: menú abierto/cerrado, índice de FAQ y, si se acuerdan variantes, selección del recorrido y solución. Scroll mediante CSS sticky y observación de un elemento centinela si es necesario; no añadir un manejador pesado que ejecute lógica cada píxel.

## 4. Orden y contenido de secciones

Conservar este orden en desktop y mobile. Los saltos tipográficos pueden adaptarse al ancho, sin alterar el texto ni forzar líneas que causen recortes.

| Sección | ID desktop / mobile | Composición |
| --- | --- | --- |
| Cabecera | 115:753 / 115:1382 | Barra centrada desktop, marca y botón de menú mobile |
| Hero | 115:145 / 115:784 | Título, explicación y CTA; ilustración y tarjeta de recorrido |
| La experiencia | 115:393 / 115:1031 | Mensaje principal y tres beneficios |
| Soluciones | 115:414 / 115:1054 | Cuatro opciones y previsualización operativa |
| Clientes y equipo | 115:491 / 115:1125 | Dos experiencias con ilustración y acceso |
| Asistente IA | 115:574 / 115:1208 | Presentación y ejemplo de conversación |
| Empieza a tu ritmo | 115:629 / 115:1263 | CTA y tres pasos |
| Preguntas frecuentes | 115:659 / 115:1290 | Cinco preguntas y respuestas |
| Cierre | 115:704 / 115:1335 | Mensaje final y CTA |
| Footer | 115:715 / 115:1344 | Marca, enlaces, wordmark, aviso académico y retorno |

### 4.1 Cabecera

Marca RestoPilot; navegación desktop «La experiencia», «Soluciones», «Asistente IA», «Preguntas» y CTA «Empieza con RestoPilot». En mobile: marca y botón «Abrir menú». El panel abierto no está documentado como variante: implementar una lista accesible de los mismos destinos, identificada como decisión de UI propuesta.

Desktop: barra de referencia 1000 × 70 px en x=140/y=18, radio 14. Mobile: 358 × 64 px en x=16/y=12, radio 12 y fondo crema con opacidad 0.74. No fijar 1000 px cuando no quepa.

El frame de scroll indica «Después del hero · burbuja derecha» y una burbuja de 112 × 56 con radio 32. Puede representar navegación condensada tras superar el hero; el contenido expandido y su funcionamiento no están configurados. Si se implementa, mantener acceso por teclado y a todos los destinos; no hacer desaparecer la navegación sin alternativa.

### 4.2 Hero

- H1: «Que fluya el servicio.».
- Introducción: «Una mesa se reserva. Un pedido llega a cocina. Alguien vuelve por su plato favorito.».
- Énfasis: «RestoPilot conecta cada momento.».
- CTA: «Empieza con RestoPilot».
- Ilustración isométrica del restaurante, no un dashboard real.
- Tarjeta «Una noche en la mesa 04»: «19:30 · Reserva confirmada», «La noche empieza bien.», «Dos personas. Una mesa lista. El equipo ya está al tanto.», «Salón», «Reservada».
- Opciones del recorrido: «Reserva», «Cocina», «A la mesa».
- Aviso: «Un recorrido ilustrativo. Puedes cambiar de momento.».
- Remate: «Del primer “hola” al próximo “nos vemos”.»; desktop incluye «Sigue el recorrido».

La tarjeta no registra una reserva. Solo se recuperó contenido del momento inicial; textos/ilustraciones de Cocina/A la mesa deben recuperarse o aprobarse antes de producir variantes. No crear resultados de negocio ficticios.

### 4.3 La experiencia

Título: «Menos “¿ya sale?”. Más “buen provecho”.».

Párrafo: «Una reserva que llega a tiempo. Un pedido que cocina entiende. Un equipo que sabe qué sigue. RestoPilot reúne los detalles para que tú te concentres en lo que importa: hacer que quieran volver.».

Beneficios:
- «Todo a la vista.» — «La operación, organizada y a mano.».
- «Un espacio para cada uno.» — «Experiencias para clientes, dueños y administradores.».
- «Del salón a cocina.» — «Del salón a cocina, sin perder el hilo.».

Desktop combina título/párrafo y tres columnas de beneficios. Mobile apila. No introducir testimonios o métricas comerciales.

### 4.4 Soluciones

Título: «El salón y la cocina. En la misma página.». Apoyo: «Todo lo que hace fluir tu servicio. Sin ir de una herramienta a otra.».

Opciones, en orden: 01 Pedidos que fluyen; 02 Reservas en orden; 03 Una carta con personalidad; 04 Reportes para decidir.

Estado inicial: Pedidos que fluyen, descripción «Del antojo de tu cliente al ritmo de tu cocina. Sigue cada pedido hasta la entrega.».

Preview: «RestoPilot», «Tu operación», «Servicio de hoy», «Pedidos en curso», restaurante «La Mesa Verde», «Vista de ejemplo». Desktop incluye #1042 Mesa 04 En preparación, #1041 Para recoger Listo, #1040 Delivery Pendiente; mobile conserva modalidad/estado sin esos IDs visibles. Mantener «Explora las cuatro vistas del restaurante».

Desktop preview y opciones en dos columnas; mobile opciones antes del preview. Si se activan las otras tres opciones, sus previews/textos deben estar definidos. No copiar pantallas operativas completas ni crear servicios para esta muestra.

### 4.5 Clientes y equipo

Título «A ambos lados de la mesa.».

Clientes: «Para tus clientes», «Elegir y disfrutar.», «Descubrir la carta, seguir un pedido y reservar su próxima mesa. Todo a su ritmo.», CTA «Sentarme a la mesa». Preview ilustrativo con La Mesa Verde/Mesa 04, «¿Qué se te antoja?», «Hecho para disfrutar, a tu ritmo.», Lomo saltado/«Un clásico de la casa», Ají de gallina/«El sabor de siempre», «Tu carta, siempre a mano» y «Carta ilustrativa».

Equipo: «Para tu equipo y para ti», «Coordinar y crecer.», «Organiza el servicio, gestiona tu equipo y encuentra perspectiva en los resultados de tu restaurante.», CTA «Conocer el lado del equipo». Tarjeta de pedido #1042, Mesa 04 En preparación, 2 × Lomo saltado, 1 × Limonada, «Listo para cocina» y «Del pedido al siguiente paso.».

La composición desktop tiene dos bloques con distinta alineación vertical; mobile muestra clientes antes que equipo. Estos ejemplos no añaden productos ni pedidos reales.

### 4.6 Asistente IA

Título «Tu operación. Una conversación.». Texto «Un asistente para explorar la carta y consultar tu operación en lenguaje natural. Porque a veces, lo único que necesitas es preguntar.». CTA «Preguntarle al copiloto».

Ejemplo: RestoPilot IA / Reportes; pregunta «¿Cuáles fueron los platos más vendidos?»; respuesta «Estos son los favoritos del período:», ranking Lomo saltado, Ají de gallina, Bowl de la huerta; enlace «Ver los favoritos de la casa».

Conservar «Ejemplo ilustrativo de una consulta. Los resultados dependen de los datos de tu restaurante.». US03/US04 no están implementadas: añadir identificación breve de «Funcionalidad prevista» en el bloque si la apariencia pudiera sugerir operación real. Es una adaptación de honestidad funcional al estado del proyecto, no una afirmación de que esa leyenda ya aparece en Figma.

No hacer solicitudes IA, mostrar un chat funcional ni prometer disponibilidad real. El destino de sus enlaces sigue pendiente.

### 4.7 Empieza a tu ritmo

Título «Empieza aquí. A tu ritmo.» y CTA «Empieza con RestoPilot».

1. «Presenta tu restaurante» — «Crea tu cuenta de dueño y registra el espacio que le da vida a tu cocina.».
2. «Dale tu personalidad» — «Organiza la carta, configura tus mesas e incorpora a tu administrador.».
3. «Conecta el servicio» — «Reúne pedidos, reservas y reportes en el día a día de tu equipo.».

Estos pasos describen capacidades; no crean cuentas ni autoejecutan configuración.

### 4.8 Preguntas frecuentes

Estado visual inicial: cinco filas cerradas con indicador de expansión. Las respuestas existen en el árbol Figma, aunque no se vean en la captura cerrada.

1. **¿Para quién está pensado RestoPilot?**  
   Para restaurantes que quieren reunir su carta, pedidos, mesas y reservas. Hay espacios específicos para clientes, dueños y administradores.
2. **¿Puedo gestionar distintos tipos de entrega?**  
   La experiencia contempla pedidos en salón, delivery, para llevar y para recoger. Cada pedido muestra su modalidad y estado.
3. **¿Cómo funciona el registro de pagos?**  
   El equipo registra los pagos recibidos por los medios del restaurante. Es un registro administrativo; no reemplaza una pasarela de pago.
4. **¿Qué puedo consultar al asistente IA?**  
   Los clientes pueden explorar platos, ingredientes y recomendaciones. El equipo puede consultar platos más vendidos, volumen de atención, demanda y pagos, según los datos disponibles.
5. **¿Puedo ver la experiencia antes de registrarme?**  
   Sí. Explora las pantallas de demostración. Usan datos de ejemplo y no guardan operaciones reales.

Usar expansión accesible con estado anunciado. Propuesta de implementación: permitir una respuesta abierta cada vez y poder cerrar la activa; no se presenta como interacción ejecutada en el prototipo. Matizar la respuesta IA con el estado «previsto». La última respuesta queda condicionada a que haya una demostración pública verificada; no prometer acceso anónimo a pantallas protegidas.

### 4.9 Cierre y footer

Cierre: «Buen servicio. Buenas historias.», «Deja que todo conecte. Y vuelve a disfrutar de lo que haces.» y CTA «Empieza con RestoPilot».

Footer: marca RestoPilot; «Para quienes hacen que una mesa sea mucho más.»; grupo «El restaurante» con Soluciones, Clientes y equipo, Asistente IA; grupo «Antes de empezar» con Preguntas frecuentes (FAQ), Términos y condiciones, Explorar el prototipo. Wordmark grande, «© 2026 RestoPilot · Prototipo académico» y «Volver al inicio».

No inventar términos legales, URL externa, contacto, política de privacidad ni redes sociales. «Términos y condiciones» y «Explorar el prototipo» requieren destino/documento aprobado antes de publicar. No usar href vacío ni # como simulación de enlace funcional.

## 5. Variante visual local de landing

La página de marketing difiere de Style: Manrope/DM Sans y colores específicos. El sistema común Roboto/Material continúa para la aplicación. No reescribir tokens globales para adaptar solo esta pantalla; definir variables --landing-* dentro de :host y aplicar clases locales a controles Material. Esta divergencia está observada en Figma, no es una nueva paleta inventada.

| Token local propuesto | Valor observado | Aplicación |
| --- | --- | --- |
| --landing-navy | #18334A | Hero, bloque IA y texto sobre claro |
| --landing-navy-deep | #132F49 | Cierre |
| --landing-green | #18764F | Soluciones |
| --landing-green-soft | #77AD69 | Sección de pasos y fondo ilustrativo |
| --landing-cream | #F8F4EA | Clientes/equipo, footer, tarjetas y navbar |
| --landing-white | #FFFFFF | Experiencia y FAQ |
| --landing-copy-on-dark | #D5E1E6 | Texto introductorio del hero |

No reutilizar --rp-primary como si coincidiera exactamente con #18764F. Verificar contraste con el tamaño y peso reales; no afirmar cumplimiento solo por tabla de colores.

### Tipografía observada

Manrope Medium (500) para títulos seleccionados y DM Sans Regular (400) en el párrafo del hero. Otros pesos/textos deben verificarse al implementar. Fuentes locales Manrope y DM Sans no están en public/assets; conseguir recursos autorizados o acordar respaldo. Declarar font-family no descarga una fuente. Evitar dependencias de Google Fonts no acordadas.

| Elemento | Desktop: tamaño / interlineado px | Mobile: tamaño / interlineado px |
| --- | --- | --- |
| Hero H1 | 72 / 71.28 | 65.83 / 65.17 |
| Experiencia | 48.64 / 52.53 | 32 / 34.56 |
| Soluciones | 51.20 / 55.30 | 32 / 34.56 |
| Clientes/equipo | 61.44 / 66.36 | 38 / 41.04 |
| Asistente IA | 51.20 / 55.30 | 34 / 36.72 |
| Pasos | 61.44 / 66.36 | 38 / 41.04 |
| FAQ | 61.44 / 66.36 | 34 / 36.72 |
| Cierre | 89.60 / 96.77 | 35.10 / 37.91 |
| Párrafo de hero | 15 / 24.75 | 14 / 23.10 |

Valores de referencia, no obligación de convertir el layout a coordenadas absolutas. Usar rem, límites fluidos y clases de título locales para no heredar automáticamente la escala h1/h2 de aplicación. Mantener jerarquía semántica independiente del tamaño visual.

Desktop: varios bloques usan padding 112 px vertical y 64 px horizontal. Hero referencia 720 px; footer padding 64/64/24/64. Son medidas del frame, no alturas fijas para contenido variable. La navbar no debe tapar títulos al navegar con anclas.

## 6. Assets e ilustraciones

- Reutilizar logo local solo si coincide con el diseño y mantiene resolución/proporción. No asumir que el PNG existente reemplaza todos los wordmarks.
- Exportar ilustración isométrica desde los nodos del hero a recurso local; preferir SVG si conserva el arte y revisar su contenido. No introducir imagen generada distinta sin solicitud.
- Las tarjetas de carta, pedido y ranking pueden construirse con HTML accesible si preservan composición; nunca usar una captura de página completa como landing.
- Assets permanentes en public/assets/landing/, con nombres descriptivos. No guardar URLs MCP temporales en código ni documentación.
- Imagen decorativa con alt vacío; ilustración informativa con alternativa breve. No exponer dos veces como texto y alt la misma información.
- Declarar dimensiones/relación de aspecto para evitar saltos; diferir recursos inferiores al primer viewport cuando corresponda.
- Ningún asset/fuente se exportó ni instaló al redactar este SPEC; resolverlos al implementar.

## 7. Navegación y decisiones de interacción

IDs de ancla propuestos: inicio, experiencia, soluciones, clientes-equipo, asistente-ia, como-empezar y preguntas. Son decisiones de implementación, no IDs de Figma.

| Control | Destino o acción | Evidencia/estado |
| --- | --- | --- |
| Marca y Volver al inicio | #inicio | Propuesta local coherente con etiqueta |
| La experiencia | #experiencia | Propuesta local |
| Soluciones | #soluciones | Propuesta local |
| Asistente IA | #asistente-ia | Propuesta local |
| Preguntas / FAQ | #preguntas | Propuesta local |
| Clientes y equipo en footer | #clientes-equipo | Propuesta local |
| Sigue el recorrido | #experiencia | Propuesta; confirmar intención antes de implementar |
| Empieza con RestoPilot en navbar/hero/pasos/cierre | /auth/registro-dueno | Ruta existente; propuesta contextual por los pasos de alta. Figma no configura este clic |
| Acceso explícito de registro cliente, si se añade | /auth/registro | Ruta existente; no añadir un CTA fuera del diseño sin aprobación |
| Inicio de sesión explícito, si se añade | /auth/login | Ruta existente; no figura como enlace separado en el frame recuperado |
| Sentarme a la mesa | Pendiente | Confirmar demo frente a registro; no elegir por inferencia |
| Conocer el lado del equipo | Pendiente | No saltar protección de rutas |
| Preguntarle al copiloto / Ver los favoritos de la casa | Pendiente | IA prevista, sin servicio |
| Términos y condiciones | Pendiente de contenido/destino | No inventar documento |
| Explorar el prototipo | Pendiente de URL/entorno demo | No enlazar automáticamente /estructura como si fuera una demo aceptada |

La ruta /auth/restaurante existe como paso adicional del alta, pero no reemplaza el punto de entrada /auth/registro-dueno sin contrato de flujo. Los enlaces internos usan routerLink o fragmentos; externos verificados con tratamiento apropiado.

Las propuestas de destino quedan listas para decisión, no equivalen a aprobación. Antes de cerrar aceptación, confirmar todos los CTA principales y enlaces legales/demo. No presentar un enlace sin destino como funcional; resolver el destino o acordar su presentación informativa.

### Menú, FAQ, recorrido y scroll

- Menú mobile: botón con aria-expanded/aria-controls; abrir/cerrar, Escape, cerrar al elegir destino y retorno de foco al disparador. Sin panel variante en Figma: documentar composición elegida.
- FAQ: preguntas como botones de expansión; estado inicial cerrado, respuestas completas, teclado y contenido accesible al abrir.
- Recorrido/soluciones: estado inicial confirmado; no habilitar selección de contenido inexistente. Si se aprueban variantes, controles semánticos y estado seleccionado perceptible.
- Navbar scroll: el umbral propuesto es la salida del hero, no un número mágico de píxeles. Mantener navegación y foco durante el cambio; no saltar ni reordenar contenido al redimensionar.
- Movimiento suave opcional, respetando prefers-reduced-motion. No carruseles automáticos ni animaciones perpetuas.

## 8. Responsive y accesibilidad

Referencias 1280 y 390 px. Probar además 320, 768 y 1440 px como tamaños de QA propuestos, no frames adicionales. Ajustar puntos de quiebre por contenido; 37.5rem de la base no determina por sí solo el cambio completo de landing.

Desktop: secciones con pares de columnas y beneficios distribuidos. Mobile: menú compacto, contenido apilado, soluciones antes de preview, clientes antes de equipo, IA debajo del texto y pasos en lista. No duplicar dos árboles de contenido completo para cada dispositivo.

No fijar altura del frame ni ocultar overflow-x global para disimular errores. Evitar que tarjetas rotadas e ilustración desborden en móvil. Mantener texto legible sin depender de un tamaño de captura reducido.

HTML: header/nav/main/footer; un h1, h2 por sección y niveles inferiores coherentes. Skip link «Saltar al contenido» oculto fuera de foco y visible al recibirlo; no dejarlo permanentemente fuera del viewport como en el canvas.

Foco visible también sobre azul oscuro; usar contorno claro local en ese fondo si el navy global no contrasta. Área táctil al menos 48 px en controles compactos como decisión de accesibilidad. Mantener labels y nombres de iconos. Controles decorativos de tarjeta no reciben foco si no actúan.

Probar Tab/Shift+Tab, Enter/Espacio, Escape en menú, zoom 200%, lectura y texto largo. Diálogos/menús no atrapan foco sin salida. No anunciar cambios ilustrativos como transacciones reales.

## 9. Relación con reglas de negocio y heurísticas

LP01 no ejecuta US01/US02/US21; sus accesos llevan a rutas de esos flujos. Menciones de pedidos/reservas/pagos no alteran condiciones del SPEC común.

- Pagos son registro administrativo, sin pasarela.
- No garantizar tiempos, disponibilidad ni métricas reales a partir de muestras.
- Mantener aviso académico y carácter ilustrativo.
- US03/US04 siguen previstas; no prometer asistente operativo.
- No añadir roles adicionales o acceso automático a gestión.

| Heurística | Aplicación en landing |
| --- | --- |
| H1 | Menú, FAQ y selecciones muestran estado |
| H2 | Lenguaje de restaurante del diseño |
| H3 | Cierre de menú/FAQ y retorno al inicio |
| H4 | CTA repetidos con mismo destino confirmado |
| H5 | Sin enlaces vacíos o acceso a operaciones no disponibles |
| H6 | Navegación y tres pasos reconocibles |
| H7 | Anclas, teclado y menú compacto |
| H8 | Jerarquía de propuesta de valor sin contenido comercial inventado |
| H9 | Resolver enlaces rotos y conservar salida |
| H10 | FAQ completa y ayuda contextual |

## 10. Criterios locales de aceptación

Todos quedan **pendientes de ejecución**. LP-Lxx son IDs locales para esta entrega.

| ID | Verificación | Tarea |
| --- | --- | --- |
| LP-L01 | / carga Home dentro del frontend existente | 003 |
| LP-L02 | Cabecera y nueve bloques respetan orden, contenido y variantes observadas | 003 |
| LP-L03 | Hero conserva título, ilustración, CTA y aviso ilustrativo | 003 |
| LP-L04 | Soluciones muestra sus cuatro opciones y preview inicial correcto | 003 |
| LP-L05 | Clientes/equipo conserva ambos bloques sin operaciones reales | 003 |
| LP-L06 | IA se identifica como ilustrativa/prevista, sin servicio ni resultados reales | 003 |
| LP-L07 | Tres pasos, cierre y footer completos, sin textos legales inventados | 003 |
| LP-L08 | FAQ muestra cinco preguntas y respuestas accesibles | 003 |
| LP-L09 | Paleta/tipografía local contrastadas con Figma sin alterar tema global | 003 |
| LP-L10 | Capturas a 1280/390 y pruebas 320/768/1440 sin desbordes ni recortes | 003 |
| LP-L11 | Fuentes y assets locales verificados; sin URLs temporales | 003 |
| LP-L12 | Navegación por anclas y retorno funcionan sin cabecera tapando destino | 004 |
| LP-L13 | Todos los CTA repetidos llevan al destino expresamente acordado | 004 |
| LP-L14 | Menú mobile abre/cierra con teclado, Escape y retorno de foco | 004 |
| LP-L15 | FAQ inicia cerrada y permite abrir/cerrar sin perder navegación | 004 |
| LP-L16 | Si se habilitan recorrido/soluciones/scroll, sus estados y contenido están definidos y probados | 003/004 |
| LP-L17 | Destinos legales y demo confirmados o presentación alternativa acordada | 004 |
| LP-L18 | Skip link, foco contrastado, zoom y reduced-motion revisados | 003/004 |
| LP-L19 | Sin HTTP, persistencia, cobros, autenticación ficticia ni implementación de otras pantallas | 003/004 |
| LP-L20 | Check/build correctos y evidencia/revisión registradas | 003/004 |

## 11. Plan de verificación al implementar

1. Capturar estado inicial en 1280 y 390, página completa y detalles de hero, soluciones, FAQ y footer.
2. Probar anchos adicionales y zoom, buscando desborde con ilustración/tarjeta rotada.
3. Recorrer todos los enlaces con ratón y teclado; comprobar URL/fragmento y retorno.
4. Abrir/cerrar menú y cada FAQ; verificar nombre/estado accesible y foco.
5. Comprobar scroll inicial/condensado solo si se implementa esa variante.
6. Revisar red: no debe haber solicitudes a API de negocio ni dependencias de assets temporales.
7. Ejecutar npm.cmd run check y npm.cmd run build desde la raíz; registrar resultado. No alterar los 120 registros para hacerlos pasar.
8. Registrar LP-Lxx → evidencia → resultado → pendiente. No afirmar aprobación por compilar.

Hoy solo se verifican documentación y estructura. Las pruebas anteriores no se presentan como ejecutadas.

## 12. Pendientes antes de cerrar implementación

| Pendiente | Evidencia requerida |
| --- | --- |
| Destino CTA principal | Acordar /auth/registro-dueno o alternativa; ON_CLICK actual no tiene acción |
| CTA de clientes/equipo/IA y demos | Destino verificable y política de acceso sin saltar autenticación |
| Términos y condiciones | Documento/destino aprobado |
| Otras vistas del recorrido y soluciones | Textos/ilustraciones de variantes aprobadas |
| Menú abierto y burbuja de scroll | Composición/acciones locales acordadas |
| Fuentes | Archivos Manrope/DM Sans autorizados o respaldo aprobado |
| Assets definitivos | Exportación y contraste visual |
| Honestidad IA/demo | Leyenda y respuesta FAQ coherentes con capacidades disponibles |

Estos pendientes no impiden completar la especificación; sí impiden afirmar aceptación de sus criterios dependientes.

## 13. Secuencia de implementación y entrega

1. Revisar cambios existentes y preparar feature/landing desde develop actualizado cuando se autorice.
2. Resolver decisiones anteriores sin ampliar el alcance; recuperar assets y fuentes.
3. Implementar estructura semántica, textos y recursos en Home.
4. Aplicar variante local de marketing y responsive.
5. Añadir navegación y estados locales aprobados.
6. Ejecutar verificaciones, comparar con Figma y documentar diferencias.
7. PR hacia develop revisado por un compañero; no publicar automáticamente.

Prompt de implementación: «Lee AGENTS.md, SPEC.md y docs/specs/landing/SPEC.md. Implementa únicamente LP01/S2-TSK-003/004 en Home. Conserva la base global y usa los estilos locales de marketing documentados. Confirma destinos pendientes y variantes antes de habilitarlos; no inventes interacciones ni implementes API u otras pantallas. Verifica desktop/mobile, teclado, rutas y compilación; registra evidencia y limitaciones».

## 14. Commit de esta especificación

Título: docs(landing): completa la especificación de la página pública

Descripción: Define la estructura, contenido, variante visual, navegación y criterios de aceptación de la landing de RestoPilot para escritorio y móvil. Documenta las referencias Figma, accesibilidad, estados ilustrativos y decisiones pendientes de CTA, demos, fuentes y enlaces legales. Mantiene el alcance en LP01 y S2-TSK-003/004, sin implementar la interfaz ni integrar la API.

El futuro commit de implementación puede usar feat(landing): implementa la landing responsive de RestoPilot, pero ese nombre no describe este cambio documental.

