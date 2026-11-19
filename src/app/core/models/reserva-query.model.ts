import {positiveId} from './pedido-api.model';
import {readReserva, ReservaResponse, ReservaContractError} from './reserva-api.model';
export interface ReservaList {readonly mensaje:string;readonly reservas:readonly ReservaResponse[];}
export interface ReservaPage extends ReservaList {readonly pagina:number;readonly tamano:number;readonly total:number;readonly paginas:number;}
export function readReservaPage(value:unknown):ReservaPage {
  const list=readReservaList(value),page=value as Partial<ReservaPage>;
  if(!Number.isSafeInteger(page.pagina)||!Number.isSafeInteger(page.tamano)||!Number.isSafeInteger(page.total)||!Number.isSafeInteger(page.paginas)
    ||page.pagina!<0||page.tamano!<1||page.total!<0||page.paginas!==Math.ceil(page.total!/page.tamano!)
    ||list.reservas.length>page.tamano!||((page.pagina!>=page.paginas!)&&list.reservas.length>0))throw new ReservaContractError();
  return {...list,pagina:page.pagina!,tamano:page.tamano!,total:page.total!,paginas:page.paginas!};
}
export interface MesaDisponible {
  readonly mesaId:number;readonly numero:number;readonly capacidad:number;readonly disponible:boolean;
  readonly coordenadaX?:number;readonly coordenadaY?:number;
}
export interface ReservaDisponibilidad {readonly mensaje:string;readonly mesas:readonly MesaDisponible[];}
export function readReservaList(value:unknown):ReservaList {
  if(!value||typeof value!=='object')throw new ReservaContractError();
  const p=value as ReservaList;if(typeof p.mensaje!=='string'||!Array.isArray(p.reservas))throw new ReservaContractError();
  const ids=new Set<number>();const reservas=p.reservas.map(r=>{
    if(!r||!positiveId(r.id)||ids.has(r.id))throw new ReservaContractError();ids.add(r.id);return readReserva(r,r.id);
  });return Object.freeze({...p,reservas:Object.freeze(reservas)});
}
export function readReservaDisponibilidad(value:unknown):ReservaDisponibilidad {
  if(!value||typeof value!=='object')throw new ReservaContractError();
  const p=value as ReservaDisponibilidad;if(typeof p.mensaje!=='string'||!Array.isArray(p.mesas))throw new ReservaContractError();
  const ids=new Set<number>();const mesas=p.mesas.map(m=>{
    if(!m||!positiveId(m.mesaId)||ids.has(m.mesaId)||!positiveId(m.numero)||!positiveId(m.capacidad)||typeof m.disponible!=='boolean')throw new ReservaContractError();
    ids.add(m.mesaId);return Object.freeze({...m});
  });return Object.freeze({...p,mesas:Object.freeze(mesas)});
}
