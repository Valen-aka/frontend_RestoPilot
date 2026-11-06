import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ReporteQuery, ReporteResponse, readReporte, validReporteQuery} from '../models/reporte-api.model';
@Injectable({providedIn:'root'})
export class ReporteService {
 private readonly http=inject(HttpClient);private readonly url=environment.apiUrl.replace(/\/$/,'')+'/reportes';
 consultar(query:ReporteQuery,pagos=false):Observable<ReporteResponse> {
  if(!validReporteQuery(query)||pagos&&query.tipo!=='PAGOS')throw new Error('Revisa el período y tipo de reporte.');
  let params=new HttpParams().set('fechaInicio',query.fechaInicio).set('fechaFin',query.fechaFin);if(!pagos)params=params.set('tipo',query.tipo);
  return this.http.get<unknown>(this.url+(pagos?'/pagos':'/operativos'),{params,timeout:20000}).pipe(map(value=>readReporte(value,query.tipo)));
 }
}
