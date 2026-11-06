import {localDateTime} from './pedido-query.model';
export const reporteTipos=['CONSOLIDADO','PLATOS','DEMANDA','ATENCIONES','OCUPACION','PAGOS'] as const;
export type TipoReporte=typeof reporteTipos[number];
export interface ReporteQuery {readonly fechaInicio:string;readonly fechaFin:string;readonly tipo:TipoReporte;}
export interface EstadoPagos {readonly montoTotal:number;readonly pedidosPagados:number;readonly pagosPendientes:number;readonly metodosPagoUtilizados:Readonly<Record<string,number>>;}
export interface ReporteResponse {readonly mensaje:string;readonly platosMasVendidos:readonly string[]|null;readonly horariosMayorDemanda:Readonly<Record<string,number>>|null;readonly volumenAtenciones:number|null;readonly ocupacionMesasPorcentaje:number|null;readonly estadoPagos:EstadoPagos|null;readonly pedidosAtendidos:number|null;readonly reservasCompletadas:number|null;}
export class ReporteContractError extends Error {constructor(){super('No se pudo verificar la respuesta del reporte.');}}
export const reporteDate=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&localDateTime(v+'T00:00:00');
export const isReporteTipo=(v:unknown):v is TipoReporte=>reporteTipos.includes(v as TipoReporte);
export const validReporteQuery=(q:ReporteQuery)=>reporteDate(q.fechaInicio)&&reporteDate(q.fechaFin)&&q.fechaInicio<=q.fechaFin&&isReporteTipo(q.tipo);
const count=(v:unknown):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=2147483647;
const metricKeys=['platosMasVendidos','horariosMayorDemanda','volumenAtenciones','ocupacionMesasPorcentaje','estadoPagos','pedidosAtendidos','reservasCompletadas'] as const;
export const emptyReporte=(r:ReporteResponse)=>metricKeys.every(k=>r[k]===null);
function counts(value:unknown):Readonly<Record<string,number>> {if(!value||typeof value!=='object'||Array.isArray(value))throw new ReporteContractError();const entries=Object.entries(value);if(entries.some(([k,v])=>!k.trim()||!count(v)))throw new ReporteContractError();return Object.freeze(Object.fromEntries(entries));}
export function readReporte(value:unknown,tipo:TipoReporte):ReporteResponse {
 if(!value||typeof value!=='object'||!isReporteTipo(tipo))throw new ReporteContractError();const r=value as ReporteResponse;
 if(typeof r.mensaje!=='string'||!r.mensaje.trim()||metricKeys.some(k=>!Object.hasOwn(r,k)||r[k]===undefined))throw new ReporteContractError();
 if(emptyReporte(r))return Object.freeze({...r});
 const has=(t:TipoReporte)=>tipo==='CONSOLIDADO'||tipo===t;
 for(const [key,t]of [['platosMasVendidos','PLATOS'],['horariosMayorDemanda','DEMANDA'],['volumenAtenciones','ATENCIONES'],['pedidosAtendidos','ATENCIONES'],['reservasCompletadas','ATENCIONES'],['ocupacionMesasPorcentaje','OCUPACION'],['estadoPagos','PAGOS']] as const)if(has(t)?r[key]===null:r[key]!==null)throw new ReporteContractError();
 if(r.platosMasVendidos!==null&&(!Array.isArray(r.platosMasVendidos)||r.platosMasVendidos.some(v=>typeof v!=='string'||!v.trim())))throw new ReporteContractError();
 if(r.volumenAtenciones!==null&&(!count(r.volumenAtenciones)||!count(r.pedidosAtendidos)||!count(r.reservasCompletadas)||r.volumenAtenciones!==r.pedidosAtendidos!+r.reservasCompletadas!))throw new ReporteContractError();
 if(r.ocupacionMesasPorcentaje!==null&&(typeof r.ocupacionMesasPorcentaje!=='number'||!Number.isFinite(r.ocupacionMesasPorcentaje)||r.ocupacionMesasPorcentaje<0))throw new ReporteContractError();
 const demanda=r.horariosMayorDemanda===null?null:counts(r.horariosMayorDemanda);let pagos:EstadoPagos|null=null;
 if(r.estadoPagos!==null){const p=r.estadoPagos;if(typeof p.montoTotal!=='number'||!Number.isFinite(p.montoTotal)||p.montoTotal<0||!count(p.pedidosPagados)||!count(p.pagosPendientes))throw new ReporteContractError();const methods=counts(p.metodosPagoUtilizados);if(Object.values(methods).reduce((a,b)=>a+b,0)>p.pedidosPagados)throw new ReporteContractError();pagos=Object.freeze({...p,metodosPagoUtilizados:methods});}
 return Object.freeze({...r,platosMasVendidos:r.platosMasVendidos===null?null:Object.freeze([...r.platosMasVendidos]),horariosMayorDemanda:demanda,estadoPagos:pagos});
}
