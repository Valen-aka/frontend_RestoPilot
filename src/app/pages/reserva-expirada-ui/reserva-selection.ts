import {parseReservaId} from '../../core/models/reserva-api.model';
/** Un ID explícito inválido nunca se sustituye por el estado de navegación. */
export function reservaSelection(params: {has(name:string):boolean;get(name:string):string|null},state: Record<string,unknown>):number|undefined {
  if(params.has('reservaId'))return parseReservaId(params.get('reservaId'));
  if(params.has('id'))return parseReservaId(params.get('id'));
  return parseReservaId(state['expiredReservationId']??state['reservaId']);
}
