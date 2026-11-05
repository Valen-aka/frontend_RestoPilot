import {PedidoResponse, positiveId} from './pedido-api.model';
import {ConsultaContractError, readPedido} from './pedido-query.model';

export interface CocinaPedido extends PedidoResponse {
  readonly complejidadMaxima?: 'ALTA'|'MEDIA'|'BAJA'|null;
  readonly tiempoPreparacionMaximoMinutos?: number|null;
}
export interface CocinaPage {
  readonly content: readonly CocinaPedido[];
  readonly totalElements:number;
  readonly totalPages:number;
  readonly number:number;
  readonly size:number;
}
export function readCocinaPedido(value:unknown,id:number):CocinaPedido {
  const p=readPedido(value,id) as CocinaPedido;
  if(p.complejidadMaxima!=null && !['ALTA','MEDIA','BAJA'].includes(p.complejidadMaxima))throw new ConsultaContractError();
  if(p.tiempoPreparacionMaximoMinutos!=null &&
    (!Number.isSafeInteger(p.tiempoPreparacionMaximoMinutos)||p.tiempoPreparacionMaximoMinutos<0))throw new ConsultaContractError();
  return p;
}
export function readCocinaPage(value:unknown,page:number,size:number):CocinaPage {
  if(!value||typeof value!=='object')throw new ConsultaContractError();
  const p=value as CocinaPage;
  if(!Array.isArray(p.content)||p.number!==page||p.size!==size||
    !Number.isSafeInteger(p.totalElements)||p.totalElements<0||
    !Number.isSafeInteger(p.totalPages)||p.totalPages!==Math.ceil(p.totalElements/size)||
    p.content.length!==Math.min(size,Math.max(0,p.totalElements-page*size)))throw new ConsultaContractError();
  const ids=new Set<number>();
  const content=p.content.map(order=>{
    if(!order||!positiveId(order.id)||ids.has(order.id))throw new ConsultaContractError();
    ids.add(order.id);const result=readCocinaPedido(order,order.id);
    if(!['PENDIENTE','EN_PREPARACION'].includes(result.estado))throw new ConsultaContractError();
    return result;
  });
  return Object.freeze({...p,content:Object.freeze(content)});
}
