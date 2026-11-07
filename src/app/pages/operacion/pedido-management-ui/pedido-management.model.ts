import {PedidoRequest, PedidoResponse, confirmedPedido} from '../../../core/models/pedido-api.model';

export function confirmedAdjustment(value:unknown,original:PedidoResponse,request:PedidoRequest):PedidoResponse {
 const result=confirmedPedido(value,request);
 if(result.id!==original.id||result.clienteId!==original.clienteId||result.fechaCreacion!==original.fechaCreacion||result.limiteCancelacion!==original.limiteCancelacion)throw new Error('La confirmación no corresponde al pedido original.');
 return result;
}
export function matchesAdjustment(order:PedidoResponse,request:PedidoRequest):boolean {
 return order.restauranteId===request.restauranteId&&order.tipoEntrega===request.tipoEntrega&&order.mesaId===request.mesaId&&order.direccionEntrega===request.direccionEntrega&&order.detalles.length===request.detalles.length&&order.detalles.every((line,i)=>line.platoId===request.detalles[i].platoId&&line.cantidad===request.detalles[i].cantidad&&line.notas===request.detalles[i].notas);
}
