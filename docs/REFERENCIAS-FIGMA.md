# Referencias Figma verificadas — 02/11/2026

Fuente autorizada: [RestoPilot original](https://www.figma.com/design/wBq85sZ8G5W5RQ1RmQmdqg/RestoPilot). Verificación documental mediante MCP oficial get_metadata en Landing 0:1, RestoPilot 5:92 y Style 5:124.

Se contrastaron las referencias numéricas y los destinos node-id de los enlaces de los nueve complementos existentes: landing, US11, US12, US13, US15, US19, US25, US26 y Mis pedidos. Resultado: **91 identificadores únicos consultados; 90 encontrados y uno no verificable**. El detalle de nombres, tipo de nodo, dimensiones y documentos relacionados está en [referencias-figma.json](referencias-figma.json).

| Conjunto | Resultado |
| --- | --- |
| Landing desktop/mobile y navbar | 115:144, 115:781 y 115:773 verificados en el original. |
| Style | Página 5:124 y guía 125:3 verificadas. La comprobación no valida todos los tokens de estilo. |
| US11 | Ocho pares desktop/mobile de carrito, modalidades, cerrado y confirmación verificados. |
| US12/US13 | Detalle, pagos y variantes de seguimiento desktop/mobile verificados. |
| US15/US19 | Cola, tablero, detalle y etapas operativas desktop/mobile verificados. |
| US25/US26 | Llegada, atención, finalización, expiración y listados de apoyo desktop/mobile verificados. |
| Mis pedidos | 84:39468 y 84:39590 verificados. |
| Hover histórico | 115:64 no aparece en los metadatos de las páginas y su consulta individual devolvió selección inválida. No se usa como destino vigente. |

Los números coinciden cuando se comprueban en el original; no se mantuvieron por suposición de equivalencia con la copia. Se corrigieron los enlaces antiguos después de contrastarlos. Las pequeñas diferencias de decimales en dimensiones corresponden al redondeo del valor del nodo.

Esta entrega acredita identidad, nombre y dimensiones de las referencias. **No acredita nuevas capturas comparativas, estilos completos, recursos exportados, reacciones ni navegación del prototipo.** Las evidencias históricas de la copia conservan esa procedencia; no se atribuyen retroactivamente al original.

## Estado documental contrastado

Base de código de la revisión: develop 3685d07. Incluye US25, US26, fix/reservas-consistencia y Mis pedidos. La guía común vuelve a ser neutral e incorpora el enlace de US25 en la tabla de complementos.

Las secuencias SPEC → implementación documentadas en entregas anteriores se conservan como historia. Las instrucciones actuales deben considerar los stores compartidos de reservas, los IDs independientes #190/#207/#208 y la continuidad del pedido seleccionado. Las muestras del carrito generan #1043, #1044, … y no sustituyen #1042.

Los recorridos de aplicación se verifican por separado en test/flujos-integrados. Corregir referencias documentales no modifica pantallas, rutas, responsables ni reglas de negocio, ni declara aceptación funcional.
