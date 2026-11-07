import {AgendaFilters, ReservaUpdate, readAgenda, confirmedReprogramacion, confirmedEstado} from '../models/reserva-agenda.model';
import {readAtencionFisica, AtencionFisicaResponse} from '../models/atencion-fisica.model';
import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ReservaList, ReservaDisponibilidad, readReservaList, readReservaDisponibilidad} from '../models/reserva-query.model';
import {readReserva, ReservaContractError, ReservaResponse, ReservaRequest, parseReservaId, reservaTime} from '../models/reserva-api.model';

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
  consultarDisponibilidadDirecta(restauranteId:number,fecha:string,horaInicio:string,horaFin:string,numeroComensales:number):Observable<ReservaDisponibilidad> {
    const params=new HttpParams().set('restauranteId',restauranteId).set('fecha',fecha)
      .set('horaInicio',reservaTime(horaInicio)).set('horaFin',reservaTime(horaFin)).set('numeroComensales',numeroComensales);
    return this.http.get<unknown>(this.url+'/disponibilidad',{params,timeout:20000}).pipe(map(readReservaDisponibilidad));
  }
  registrarReserva(request:ReservaRequest):Observable<ReservaResponse> {
    const payload={
      mesaId:request.mesaId,
      restauranteId:request.restauranteId,
      fecha:request.fecha,
      horaInicio:reservaTime(request.horaInicio),
      horaFin:reservaTime(request.horaFin),
      numeroComensales:request.numeroComensales,
      notas:request.notas?request.notas.trim():null
    };
    return this.http.post<unknown>(this.url,payload,{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==201)throw new ReservaContractError();
      const body=response.body as {id?:unknown};
      const id=parseReservaId(body?.id);
      if(!id)throw new ReservaContractError();
      return readReserva(response.body,id);
    }));
  }
  modificarCliente(id:number,request:ReservaRequest):Observable<ReservaResponse> {
    const payload={
      mesaId:request.mesaId,
      restauranteId:request.restauranteId,
      fecha:request.fecha,
      horaInicio:reservaTime(request.horaInicio),
      horaFin:reservaTime(request.horaFin),
      numeroComensales:request.numeroComensales,
      notas:request.notas?request.notas.trim():null
    };
    return this.http.put<unknown>(this.url+'/'+id,payload,{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==200)throw new ReservaContractError();
      return readReserva(response.body,id);
    }));
  }
  cancelarCliente(id:number,motivo?:string):Observable<ReservaResponse> {
    const body=motivo&&motivo.trim().length>0?{motivo:motivo.trim()}:{};
    return this.http.patch<unknown>(this.url+'/'+id+'/cancelar',body,{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==200)throw new ReservaContractError();
      return readReserva(response.body,id);
    }));
  }
  evaluarPorId(id:number,estado:'CONFIRMADA'|'RECHAZADA',motivo?:string|null):Observable<ReservaResponse> {
    const body={estado,motivo:motivo&&motivo.trim().length>0?motivo.trim():null};
    return this.http.patch<unknown>(this.url+'/'+id+'/estado',body,{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==200)throw new ReservaContractError();
      return readReserva(response.body,id);
    }));
  }
  moduloPropio(restaurantId:number):Observable<AtencionFisicaResponse> {
    return this.http.get<unknown>(this.url+'/modulo/estado',{timeout:20000}).pipe(map(value=>readAtencionFisica(value,restaurantId)));
  }
  moduloRestaurante(restaurantId:number):Observable<AtencionFisicaResponse> {
    return this.http.get<unknown>(this.url+'/modulo/estado/restaurante/'+restaurantId,{timeout:20000}).pipe(map(value=>readAtencionFisica(value,restaurantId)));
  }
  cambiarModulo(habilitado:boolean,restaurantId:number):Observable<AtencionFisicaResponse> {
    return this.http.patch<unknown>(this.url+'/modulo/estado',{habilitado},{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==200)throw new Error('El cambio no pudo verificarse.');
      const value=readAtencionFisica(response.body,restaurantId);
      if(value.habilitado!==habilitado)throw new Error('El cambio no corresponde al estado solicitado.');
      return value;
    }));
  }
  registrarLlegada(id:number):Observable<ReservaResponse> {return this.cambiar(id,'llegada');}
  completar(id:number):Observable<ReservaResponse> {return this.cambiar(id,'completar');}

  agenda(filters:AgendaFilters,restaurantId:number):Observable<ReservaList> {
    let params=new HttpParams();if(filters.fecha)params=params.set('fecha',filters.fecha);if(filters.estado)params=params.set('estado',filters.estado);
    return this.http.get<unknown>(this.url,{params,timeout:20000}).pipe(map(value=>readAgenda(value,restaurantId,filters)));
  }
  disponibilidadPara(r:ReservaUpdate):Observable<ReservaDisponibilidad> {
    const params=new HttpParams().set('restauranteId',r.restauranteId).set('fecha',r.fecha).set('horaInicio',r.horaInicio).set('horaFin',r.horaFin).set('numeroComensales',r.numeroComensales);
    return this.http.get<unknown>(this.url+'/disponibilidad',{params,timeout:20000}).pipe(map(readReservaDisponibilidad));
  }
  reprogramar(original:ReservaResponse,request:ReservaUpdate):Observable<ReservaResponse> {
    return this.http.put<unknown>(this.url+'/'+original.id,request,{observe:'response',timeout:20000}).pipe(map(response=>{if(response.status!==200)throw new ReservaContractError();return confirmedReprogramacion(response.body,original,request);}));
  }
  cancelarAdministrativa(original:ReservaResponse,motivo:string):Observable<ReservaResponse> {
    return this.http.patch<unknown>(this.url+'/'+original.id+'/cancelar',{motivo},{observe:'response',timeout:20000}).pipe(map(response=>{if(response.status!==200)throw new ReservaContractError();return confirmedEstado(response.body,original,'CANCELADA');}));
  }
  evaluarAdministrativa(original:ReservaResponse,estado:'CONFIRMADA'|'RECHAZADA',motivo:string|null):Observable<ReservaResponse> {
    return this.http.patch<unknown>(this.url+'/'+original.id+'/estado',{estado,motivo},{observe:'response',timeout:20000}).pipe(map(response=>{if(response.status!==200)throw new ReservaContractError();return confirmedEstado(response.body,original,estado);}));
  }
  private cambiar(id:number,action:string):Observable<ReservaResponse> {
    return this.http.patch<unknown>(this.url+'/'+id+'/'+action,null,{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==200)throw new ReservaContractError();
      return readReserva(response.body,id);
    }));
  }
}
