import {positiveId} from './pedido-api.model';
import {localDateTime} from './pedido-query.model';
export type EstadoReserva='PENDIENTE'|'CONFIRMADA'|'RECHAZADA'|'CANCELADA'|'EXPIRADA'|'COMPLETADA';
export interface ReservaResponse {
  readonly id:number;readonly mesaId:number;readonly mesaNumero:number;readonly restauranteId:number;readonly restauranteNombre:string;
  readonly clienteId:number;readonly clienteNombre:string;readonly fecha:string;readonly horaInicio:string;readonly horaFin:string;
  readonly numeroComensales:number;readonly estado:EstadoReserva;readonly notas:string|null;readonly creadoEn:string;
  readonly motivoRechazo:string|null;readonly llegadaRegistradaEn:string|null;readonly completadaEn:string|null;readonly expiradaEn:string|null;
  readonly mensaje?:string|null;readonly fechaHoraServidor?:string|null;readonly puedeRegistrarLlegada?:boolean;readonly puedeCompletar?:boolean;
}
export class ReservaContractError extends Error {constructor(){super('La respuesta de la reserva no es compatible con el contrato.');}}
const text=(v:unknown):v is string=>typeof v==='string'&&!!v.trim();
const nullableText=(v:unknown):boolean=>v===null||typeof v==='string';
const stamp=(v:unknown):boolean=>v===null||localDateTime(v);
export function parseReservaId(value:unknown):number|undefined {
  if(positiveId(value))return value;
  if(typeof value!=='string'||! /^[1-9]\d*$/.test(value))return undefined;
  const id=Number(value);return positiveId(id)?id:undefined;
}
export function reservaTime(value:string):string {return value.length===5?value+':00':value;}
const time=(value:unknown):value is string=>typeof value==='string'&&/^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?$/.test(value)&&localDateTime('2000-01-01T'+reservaTime(value));
export function readReserva(value:unknown,id:number):ReservaResponse {
  if(!value||typeof value!=='object')throw new ReservaContractError();
  const r=value as ReservaResponse;
  if(r.id!==id||!positiveId(r.id)||!positiveId(r.restauranteId)||!text(r.restauranteNombre)||!positiveId(r.clienteId)||!text(r.clienteNombre)||
    !positiveId(r.mesaId)||!positiveId(r.mesaNumero)||!positiveId(r.numeroComensales)||r.numeroComensales>2147483647||
    typeof r.fecha!=='string'||! /^\d{4}-\d{2}-\d{2}$/.test(r.fecha)||!localDateTime(r.fecha+'T00:00:00')||!time(r.horaInicio)||!time(r.horaFin)||
    reservaTime(r.horaInicio)>=reservaTime(r.horaFin)||!['PENDIENTE','CONFIRMADA','RECHAZADA','CANCELADA','EXPIRADA','COMPLETADA'].includes(r.estado)||
    !nullableText(r.notas)||!nullableText(r.motivoRechazo)||!localDateTime(r.creadoEn)||!stamp(r.llegadaRegistradaEn)||!stamp(r.completadaEn)||!stamp(r.expiradaEn)||
    !(r.mensaje==null||typeof r.mensaje==='string'))throw new ReservaContractError();
  if(r.estado==='COMPLETADA'&&(!r.llegadaRegistradaEn||!r.completadaEn))throw new ReservaContractError();
  if(r.completadaEn&&(r.estado!=='COMPLETADA'||!r.llegadaRegistradaEn||r.completadaEn<r.llegadaRegistradaEn))throw new ReservaContractError();
  const controls=[r.fechaHoraServidor,r.puedeRegistrarLlegada,r.puedeCompletar];
  if(controls.some(v=>v!==undefined)){
    if(!localDateTime(r.fechaHoraServidor)||typeof r.puedeRegistrarLlegada!=='boolean'||typeof r.puedeCompletar!=='boolean')throw new ReservaContractError();
    if(r.puedeRegistrarLlegada&&(r.estado!=='CONFIRMADA'||r.llegadaRegistradaEn!==null||r.puedeCompletar))throw new ReservaContractError();
    if(r.puedeCompletar&&(r.estado!=='CONFIRMADA'||!r.llegadaRegistradaEn))throw new ReservaContractError();
  }
  return Object.freeze({...r});
}
