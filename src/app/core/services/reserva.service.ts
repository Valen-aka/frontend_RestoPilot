import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ReservaList, ReservaDisponibilidad, readReservaList, readReservaDisponibilidad} from '../models/reserva-query.model';
import {readReserva, ReservaContractError, ReservaResponse} from '../models/reserva-api.model';

@Injectable({providedIn:'root'})
export class ReservaService {
  private readonly http=inject(HttpClient);
  private readonly url=environment.apiUrl.replace(/\/$/,'')+'/reservas';
  obtener(id:number):Observable<ReservaResponse> {
    return this.http.get<unknown>(this.url+'/'+id,{timeout:20000}).pipe(map(value=>readReserva(value,id)));
  }
  propias():Observable<ReservaList> {
    return this.http.get<unknown>(this.url+'/me',{timeout:20000}).pipe(map(readReservaList));
  }
  restaurante():Observable<ReservaList> {
    return this.http.get<unknown>(this.url,{timeout:20000}).pipe(map(readReservaList));
  }
  disponibilidad(r:ReservaResponse):Observable<ReservaDisponibilidad> {
    const params=new HttpParams().set('restauranteId',r.restauranteId).set('fecha',r.fecha)
      .set('horaInicio',r.horaInicio).set('horaFin',r.horaFin).set('numeroComensales',r.numeroComensales);
    return this.http.get<unknown>(this.url+'/disponibilidad',{params,timeout:20000}).pipe(map(readReservaDisponibilidad));
  }
  registrarLlegada(id:number):Observable<ReservaResponse> {return this.cambiar(id,'llegada');}
  completar(id:number):Observable<ReservaResponse> {return this.cambiar(id,'completar');}
  private cambiar(id:number,action:string):Observable<ReservaResponse> {
    return this.http.patch<unknown>(this.url+'/'+id+'/'+action,null,{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==200)throw new ReservaContractError();
      return readReserva(response.body,id);
    }));
  }
}
