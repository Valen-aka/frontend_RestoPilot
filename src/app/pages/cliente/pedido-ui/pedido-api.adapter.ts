import type {EstadoPedido, PedidoResponse} from '../../../core/models/pedido-api.model';
import type {PagoResponse} from '../../../core/models/pago-api.model';
import type {OrderSnapshot, OrderStatus, PaymentSnapshot} from './pedido.model';

export const EMPTY_ORDER:OrderSnapshot=Object.freeze({id:0,restaurant:'',requestedAt:'',modality:'LLEVAR',lines:Object.freeze([]),total:0});
const labels:Record<EstadoPedido,OrderStatus>={PENDIENTE:'Pendiente',EN_PREPARACION:'En preparación',LISTO:'Listo',ENTREGADO:'Entregado',CANCELADO:'Cancelado'};
export function orderStatus(pedido:PedidoResponse):OrderStatus {return labels[pedido.estado];}
export function displayLocalDate(value:string):string {
  // Solo presentación: se conserva la fecha local enviada por el servidor, sin convertir zona horaria.
  return value.slice(8,10)+'/'+value.slice(5,7)+'/'+value.slice(0,4)+' · '+value.slice(11,16);
}
export function orderSnapshot(p:PedidoResponse):OrderSnapshot {
  return Object.freeze({id:p.id,restaurant:p.restauranteNombre,requestedAt:displayLocalDate(p.fechaCreacion),modality:p.tipoEntrega,
    ...(p.tipoEntrega==='SALON'&&p.mesaId?{table:'Mesa asignada · ID '+p.mesaId}:{}),
    ...(p.tipoEntrega==='DELIVERY'&&p.direccionEntrega?{deliveryAddress:p.direccionEntrega}:{}),
    lines:Object.freeze(p.detalles.map(d=>Object.freeze({name:d.nombrePlatoSnapshot,quantity:d.cantidad,unitPrice:d.precioUnitario,subtotal:d.subtotal}))),
    total:p.total});
}
export function paymentSnapshot(p:PagoResponse):PaymentSnapshot {
  const methods={YAPE:'Yape',PLIN:'Plin',TARJETA:'Tarjeta',EFECTIVO:'Efectivo'};
  return Object.freeze({orderId:p.pedidoId,amount:p.monto,
    ...(p.metodo?{method:methods[p.metodo]}:{}),...(p.codigoReferencia?{reference:p.codigoReferencia}:{}),
    ...(p.fechaPago?{registeredAt:displayLocalDate(p.fechaPago)}:{})});
}
