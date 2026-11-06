import {EstadoReserva, ReservaContractError, ReservaResponse, readReserva, reservaTime} from './reserva-api.model';
import {localDateTime} from './pedido-query.model';
import {ReservaList, readReservaList} from './reserva-query.model';
export const reservaEstados:readonly EstadoReserva[]=['PENDIENTE','CONFIRMADA','RECHAZADA','CANCELADA','EXPIRADA','COMPLETADA'];
export interface AgendaFilters {readonly fecha:string;readonly estado:string;}
export interface ReservaUpdate {readonly mesaId:number;readonly restauranteId:number;readonly fecha:string;readonly horaInicio:string;readonly horaFin:string;readonly numeroComensales:number;readonly notas:string|null;}
export const agendaDate=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&localDateTime(v+'T00:00:00');
export const agendaTime=(v:unknown):v is string=>typeof v==='string'&&/^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?$/.test(v)&&localDateTime('2000-01-01T'+reservaTime(v));
export const validFilters=(f:AgendaFilters)=>(!f.fecha||agendaDate(f.fecha))&&(!f.estado||reservaEstados.includes(f.estado as EstadoReserva));
export const canManageReserva=(r:ReservaResponse|null)=>!!r&&['PENDIENTE','CONFIRMADA'].includes(r.estado)&&r.llegadaRegistradaEn===null;
export function ownReserva(value:unknown,id:number,restaurantId:number):ReservaResponse {const r=readReserva(value,id);if(r.restauranteId!==restaurantId)throw new ReservaContractError();return r;}
export function readAgenda(value:unknown,restaurantId:number,f:AgendaFilters):ReservaList {
 const result=readReservaList(value);if(!validFilters(f)||result.reservas.some(r=>r.restauranteId!==restaurantId||(!!f.fecha&&r.fecha!==f.fecha)||(!!f.estado&&r.estado!==f.estado)))throw new ReservaContractError();return result;
}
export function validUpdate(r:ReservaUpdate):boolean {return Number.isSafeInteger(r.mesaId)&&r.mesaId>0&&Number.isSafeInteger(r.restauranteId)&&r.restauranteId>0&&agendaDate(r.fecha)&&agendaTime(r.horaInicio)&&agendaTime(r.horaFin)&&reservaTime(r.horaInicio)<reservaTime(r.horaFin)&&Number.isInteger(r.numeroComensales)&&r.numeroComensales>0&&r.numeroComensales<=2147483647&&(r.notas===null||typeof r.notas==='string'&&r.notas.length<=500);}
export function availabilityKey(r:Pick<ReservaUpdate,'restauranteId'|'fecha'|'horaInicio'|'horaFin'|'numeroComensales'>):string {return [r.restauranteId,r.fecha,reservaTime(r.horaInicio),reservaTime(r.horaFin),r.numeroComensales].join('|');}
export function confirmedReprogramacion(value:unknown,original:ReservaResponse,request:ReservaUpdate):ReservaResponse {
 const r=ownReserva(value,original.id,original.restauranteId);
 if(!validUpdate(request)||r.clienteId!==original.clienteId||r.estado!=='PENDIENTE'||r.llegadaRegistradaEn!==null||r.mesaId!==request.mesaId||r.fecha!==request.fecha||reservaTime(r.horaInicio)!==reservaTime(request.horaInicio)||reservaTime(r.horaFin)!==reservaTime(request.horaFin)||r.numeroComensales!==request.numeroComensales||(r.notas??'')!==(request.notas??''))throw new ReservaContractError();return r;
}
export function confirmedEstado(value:unknown,original:ReservaResponse,estado:EstadoReserva):ReservaResponse {
 const r=ownReserva(value,original.id,original.restauranteId);if(r.clienteId!==original.clienteId||r.estado!==estado||r.mesaId!==original.mesaId||r.fecha!==original.fecha||reservaTime(r.horaInicio)!==reservaTime(original.horaInicio)||reservaTime(r.horaFin)!==reservaTime(original.horaFin)||r.numeroComensales!==original.numeroComensales)throw new ReservaContractError();return r;
}
