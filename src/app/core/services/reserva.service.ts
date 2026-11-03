import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {readReserva, ReservaContractError, ReservaResponse} from '../models/reserva-api.model';

@Injectable({providedIn:'root'})
export class ReservaService {
  private readonly http=inject(HttpClient);
  private readonly url=environment.apiUrl.replace(/\/$/,'')+'/reservas';
  obtener(id:number):Observable<ReservaResponse> {
    return this.http.get<unknown>(this.url+'/'+id,{timeout:20000}).pipe(map(value=>readReserva(value,id)));
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
