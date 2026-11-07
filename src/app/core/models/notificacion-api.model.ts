import {positiveId} from './pedido-api.model';
import {ConsultaContractError, localDateTime} from './pedido-query.model';

export interface Notificacion {
  readonly id:number;
  readonly mensaje:string;
  readonly fechaCreacion:string;
}
export interface NotificacionesPage {
  readonly content:readonly Notificacion[];
  readonly totalElements:number;
  readonly totalPages:number;
  readonly number:number;
  readonly size:number;
}

/** Supabase RPC devuelve la lista personal completa; Spring conserva Page. */
export function readNotificacionesResponse(value:unknown,subject:string,page:number,size:number,direct=false):NotificacionesPage {
  if(!direct||!Array.isArray(value))return readNotificacionesPage(value,subject,page,size);
  if(!Number.isSafeInteger(page)||page<0||!Number.isSafeInteger(size)||size<=0)throw new ConsultaContractError();
  const length=value.length,fullSize=Math.max(1,length);
  const validated=readNotificacionesPage({content:value,number:0,size:fullSize,totalElements:length,totalPages:length?1:0},subject,0,fullSize);
  return Object.freeze({content:Object.freeze(validated.content.slice(page*size,(page+1)*size)),number:page,size,totalElements:length,totalPages:Math.ceil(length/size)});
}

/** El backend limita la consulta a la cuenta autenticada; se valida también su respuesta. */
export function readNotificacionesPage(value:unknown,subject:string,page:number,size:number):NotificacionesPage {
  if(!value||typeof value!=='object'||!Number.isSafeInteger(page)||page<0||!Number.isSafeInteger(size)||size<=0)throw new ConsultaContractError();
  const p=value as NotificacionesPage;
  if(!Array.isArray(p.content)||p.number!==page||p.size!==size||
    !Number.isSafeInteger(p.totalElements)||p.totalElements<0||
    !Number.isSafeInteger(p.totalPages)||p.totalPages!==Math.ceil(p.totalElements/size)||
    p.content.length!==Math.min(size,Math.max(0,p.totalElements-page*size)))throw new ConsultaContractError();
  const seen=new Set<number>();
  let previous='';
  const content=p.content.map(item=>{
    const row=item as Notificacion&{usuarioId:unknown};
    if(!row||!positiveId(row.id)||seen.has(row.id)||!positiveId(row.usuarioId)||String(row.usuarioId)!==subject||
      typeof row.mensaje!=='string'||!row.mensaje.trim()||row.mensaje.length>500||!localDateTime(row.fechaCreacion))throw new ConsultaContractError();
    // Compare at full precision without inventing a timezone for LocalDateTime.
    const date=row.fechaCreacion.includes('.')?row.fechaCreacion.padEnd(29,'0'):row.fechaCreacion+'.000000000';
    if(previous&&date>previous)throw new ConsultaContractError();
    previous=date;seen.add(row.id);
    return Object.freeze({id:row.id,mensaje:row.mensaje,fechaCreacion:row.fechaCreacion});
  });
  return Object.freeze({content:Object.freeze(content),totalElements:p.totalElements,totalPages:p.totalPages,number:p.number,size:p.size});
}
