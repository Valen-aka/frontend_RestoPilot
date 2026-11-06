import {MesaResponse} from './catalogo-api.model';
import {positiveId} from './pedido-api.model';
export interface MesaRequest {readonly numero:number;readonly capacidad:number;readonly coordenadaX:number;readonly coordenadaY:number;}
export class MesaContractError extends Error {constructor(){super('No se pudo verificar la respuesta de mesas.');}}
export const mesaInteger=(v:unknown):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>0&&v<=2147483647;
export const mesaRequestValid=(r:MesaRequest):boolean=>mesaInteger(r.numero)&&mesaInteger(r.capacidad)&&typeof r.coordenadaX==='number'&&Number.isFinite(r.coordenadaX)&&typeof r.coordenadaY==='number'&&Number.isFinite(r.coordenadaY);
export function readMesa(value:unknown,restaurantId:number,id?:number):MesaResponse {
 const p=value as MesaResponse;
 if(!p||!positiveId(p.id)||(id!==undefined&&p.id!==id)||p.restauranteId!==restaurantId||typeof p.restauranteNombre!=='string'||!mesaInteger(p.numero)||!mesaInteger(p.capacidad)||typeof p.activo!=='boolean'||
   [p.coordenadaX,p.coordenadaY].some(v=>v!==null&&(typeof v!=='number'||!Number.isFinite(v))))throw new MesaContractError();
 return Object.freeze({...p});
}
export function readMesas(value:unknown,restaurantId:number):readonly MesaResponse[] {
 if(!Array.isArray(value))throw new MesaContractError();const rows=value.map(v=>readMesa(v,restaurantId));
 if(new Set(rows.map(r=>r.id)).size!==rows.length||new Set(rows.map(r=>r.numero)).size!==rows.length)throw new MesaContractError();
 return Object.freeze(rows);
}
export interface MesaPoint {readonly key:string;readonly x:number;readonly y:number;readonly mesas:readonly MesaResponse[];}
/** Posición relativa; no impone unidades ni modifica las coordenadas del servidor. */
export function projectMesas(rows:readonly MesaResponse[]):readonly MesaPoint[] {
 const located=rows.filter(r=>r.coordenadaX!==null&&r.coordenadaY!==null),groups=new Map<string,MesaResponse[]>();
 for(const r of located){const key=r.coordenadaX+'|'+r.coordenadaY;groups.set(key,[...(groups.get(key)??[]),r]);}
 const xs=located.map(r=>r.coordenadaX!),ys=located.map(r=>r.coordenadaY!);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const position=(v:number,min:number,max:number)=>{if(max===min)return 50;const scale=Math.max(Math.abs(min),Math.abs(max),Number.MIN_VALUE),low=min/scale,span=max/scale-low;return span>0?16+68*((v/scale-low)/span):50;};
 return Array.from(groups,([key,mesas])=>({key,x:position(mesas[0].coordenadaX!,minX,maxX),y:position(mesas[0].coordenadaY!,minY,maxY),mesas}));
}
