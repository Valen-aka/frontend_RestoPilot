import {isModality, positiveId, validQuantity} from './pedido-api.model';
import type {PedidoResponse} from './pedido-api.model';
import type {PagoResponse} from './pago-api.model';

export class ConsultaContractError extends Error {
  constructor(){super('La respuesta de la consulta no es compatible con el contrato.');}
}
export interface PedidosPage {
  readonly mensaje: string;
  readonly pedidos: readonly PedidoResponse[];
  readonly totalElementos: number;
  readonly totalPaginas: number;
}
const text=(v:unknown):v is string=>typeof v==='string'&&!!v.trim();
const money=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const nullableText=(v:unknown):v is string|null=>v===null||typeof v==='string';
export function localDateTime(v:unknown):v is string {
  if(typeof v!=='string')return false;
  const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?$/.exec(v);
  if(!match)return false;
  const [year,month,day,hour,minute,second]=match.slice(1).map(Number);
  const d=new Date(0);d.setUTCFullYear(year,month-1,day);
  return year>0&&d.getUTCFullYear()===year&&d.getUTCMonth()===month-1&&d.getUTCDate()===day&&hour<24&&minute<60&&second<60;
}
export function parsePedidoId(value:unknown):number|null {
  if(typeof value==='number')return positiveId(value)?value:null;
  if(typeof value!=='string'||! /^[1-9]\d*$/.test(value))return null;
  const id=Number(value);return positiveId(id)?id:null;
}
export function readPedido(value:unknown,expectedId:number):PedidoResponse {
  if(!value||typeof value!=='object')throw new ConsultaContractError();
  const p=value as PedidoResponse;
  if(!positiveId(p.id)||p.id!==expectedId||!positiveId(p.restauranteId)||!text(p.restauranteNombre)||
     !positiveId(p.clienteId)||!text(p.clienteNombre)||!isModality(p.tipoEntrega)||
     !['PENDIENTE','EN_PREPARACION','LISTO','ENTREGADO','CANCELADO'].includes(p.estado)||
     !(p.mesaId===null||positiveId(p.mesaId))||!nullableText(p.direccionEntrega)||
     (p.tipoEntrega==='SALON'&&!positiveId(p.mesaId))||(p.tipoEntrega==='DELIVERY'&&!text(p.direccionEntrega))||
     !money(p.total)||!localDateTime(p.fechaCreacion)||!(p.limiteCancelacion===null||localDateTime(p.limiteCancelacion))||
     !Array.isArray(p.detalles)||!p.detalles.length)throw new ConsultaContractError();
  const ids=new Set<number>();
  for(const d of p.detalles){
    if(!d||!positiveId(d.id)||ids.has(d.id)||!positiveId(d.platoId)||!text(d.nombrePlatoSnapshot)||!validQuantity(d.cantidad)||
       !money(d.precioUnitario)||!money(d.subtotal)||!nullableText(d.notas))throw new ConsultaContractError();
    ids.add(d.id);
  }
  return Object.freeze({...p,detalles:Object.freeze(p.detalles.map(d=>Object.freeze({...d})))});
}
export function readPago(value:unknown,pedidoId:number,total:number):PagoResponse {
  if(!value||typeof value!=='object')throw new ConsultaContractError();
  const p=value as PagoResponse;
  if(!positiveId(p.id)||p.pedidoId!==pedidoId||!money(p.monto)||p.monto!==total||
     !['PENDIENTE','PAGADO'].includes(p.estado)||!(p.metodo===null||['YAPE','PLIN','TARJETA','EFECTIVO'].includes(p.metodo))||
     !nullableText(p.codigoReferencia)||!(p.fechaPago===null||localDateTime(p.fechaPago))||
     !(p.creadoEn===null||localDateTime(p.creadoEn))||(p.estado==='PENDIENTE'&&p.fechaPago!==null))throw new ConsultaContractError();
  return Object.freeze({...p});
}
export function readPedidosPage(value:unknown):PedidosPage {
  if(!value||typeof value!=='object')throw new ConsultaContractError();
  const p=value as PedidosPage;
  if(typeof p.mensaje!=='string'||!Array.isArray(p.pedidos)||!Number.isSafeInteger(p.totalElementos)||p.totalElementos<0||
     !Number.isSafeInteger(p.totalPaginas)||p.totalPaginas<0||p.pedidos.length>p.totalElementos)throw new ConsultaContractError();
  const pedidos=p.pedidos.map(item=>readPedido(item,item?.id));
  if(new Set(pedidos.map(item=>item.id)).size!==pedidos.length)throw new ConsultaContractError();
  return Object.freeze({...p,pedidos:Object.freeze(pedidos)});
}
