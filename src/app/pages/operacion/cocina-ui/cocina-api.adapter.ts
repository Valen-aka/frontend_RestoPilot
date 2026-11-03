import {CocinaPedido, readCocinaPedido} from '../../../core/models/cocina-api.model';
import {KitchenOrder, KitchenStatus} from './cocina.model';
const states:Record<CocinaPedido['estado'],KitchenStatus>={PENDIENTE:'Pendiente',EN_PREPARACION:'En preparación',LISTO:'Listo',ENTREGADO:'Entregado',CANCELADO:'Cancelado'};
const complexity={ALTA:'Alta',MEDIA:'Media',BAJA:'Baja'} as const;
export function kitchenOrder(value:CocinaPedido):KitchenOrder {
  const p=readCocinaPedido(value,value.id);
  return Object.freeze({id:p.id,restaurantId:String(p.restauranteId),restaurantName:p.restauranteNombre,source:'api',
    customer:p.clienteNombre,status:states[p.estado],createdAt:p.fechaCreacion,modality:p.tipoEntrega,
    table:p.mesaId===null?undefined:'ID de mesa '+p.mesaId,address:p.direccionEntrega??undefined,payment:null,
    complexity:p.complejidadMaxima?complexity[p.complejidadMaxima]:null,
    preparationMinutes:p.tiempoPreparacionMaximoMinutos??null,totalCents:Math.round(p.total*100),
    lines:Object.freeze(p.detalles.map(d=>Object.freeze({name:d.nombrePlatoSnapshot,quantity:d.cantidad,
      unitCents:Math.round(d.precioUnitario*100),subtotalCents:Math.round(d.subtotal*100),notes:d.notas,
      complexity:null,preparationMinutes:null})))});
}
