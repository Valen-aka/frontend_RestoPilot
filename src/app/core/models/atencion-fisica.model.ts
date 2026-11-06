import {positiveId} from './pedido-api.model';
export interface AtencionFisicaResponse {
  readonly restauranteId:number;readonly restauranteNombre:string;readonly habilitado:boolean;
  readonly reservasActivasPendientes:number;readonly mensaje:string;
}
export class AtencionFisicaContractError extends Error {constructor(){super('No pudimos verificar la configuración del restaurante.');}}
export function readAtencionFisica(value:unknown,restaurantId:number):AtencionFisicaResponse {
  const p=value as AtencionFisicaResponse;
  if(!p||!positiveId(restaurantId)||p.restauranteId!==restaurantId||typeof p.restauranteNombre!=='string'||!p.restauranteNombre.trim()||
    typeof p.habilitado!=='boolean'||!Number.isSafeInteger(p.reservasActivasPendientes)||p.reservasActivasPendientes<0||typeof p.mensaje!=='string')throw new AtencionFisicaContractError();
  return Object.freeze({...p});
}
