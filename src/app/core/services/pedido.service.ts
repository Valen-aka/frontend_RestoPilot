import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {confirmedPedido, PedidoProtocolError, PedidoRequest, PedidoResponse, EstadoPedido} from '../models/pedido-api.model';

import {CocinaPage, readCocinaPage, readCocinaPedido} from '../models/cocina-api.model';
import {PedidosPage, readPedido, readPedidosPage} from '../models/pedido-query.model';
import {confirmedAdjustment} from '../../pages/operacion/pedido-management-ui/pedido-management.model';

@Injectable({providedIn: 'root'})
export class PedidoService {
  private readonly http = inject(HttpClient);
  ajustar(original:PedidoResponse,request:PedidoRequest):Observable<PedidoResponse> {
    const body:PedidoRequest={restauranteId:original.restauranteId,tipoEntrega:request.tipoEntrega,mesaId:request.mesaId,direccionEntrega:request.direccionEntrega,detalles:request.detalles.map(d=>({platoId:d.platoId,cantidad:d.cantidad,notas:d.notas}))};
    return this.http.put<unknown>(environment.apiUrl.replace(/\/$/,'')+'/pedidos/'+original.id,body,{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==200)throw new Error('No se pudo verificar el ajuste.');
      return confirmedAdjustment(response.body,original,body);
    }));
  }
  cancelarAdministrativo(id:number):Observable<void> {
    return this.http.delete(environment.apiUrl.replace(/\/$/,'')+'/pedidos/'+id,{observe:'response',timeout:20000}).pipe(map(response=>{
      if(response.status!==204)throw new Error('No se pudo verificar la cancelación.');
    }));
  }
  obtener(id:number):Observable<PedidoResponse> {
    return this.http.get<unknown>(environment.apiUrl.replace(/\/$/,'')+'/pedidos/'+id,{timeout:20000})
      .pipe(map(value=>readPedido(value,id)));
  }
  propios(page:number,size:number):Observable<PedidosPage> {
    const params=new HttpParams().set('page',page).set('size',size).append('sort','fechaCreacion,desc').append('sort','id,desc');
    return this.http.get<unknown>(environment.apiUrl.replace(/\/$/,'')+'/pedidos/me',{params,timeout:20000})
      .pipe(map(readPedidosPage));
  }
  pendientesCocina(page:number,size:number):Observable<CocinaPage> {
    const params=new HttpParams().set('page',page).set('size',size);
    return this.http.get<unknown>(environment.apiUrl.replace(/\/$/,'')+'/pedidos/pendientes',{params,timeout:20000})
      .pipe(map(value=>readCocinaPage(value,page,size)));
  }
  cambiarEstado(id:number,nuevoEstado:EstadoPedido):Observable<PedidoResponse> {
    const params=new HttpParams().set('nuevoEstado',nuevoEstado);
    return this.http.patch<unknown>(environment.apiUrl.replace(/\/$/,'')+'/pedidos/'+id+'/estado',null,
      {params,observe:'response',timeout:20000}).pipe(map(response=>{
        if(response.status!==200)throw new Error('Confirmación de estado incompatible.');
        const order=readCocinaPedido(response.body,id);
        if(order.estado!==nuevoEstado)throw new Error('No pudimos verificar el estado confirmado.');
        return order;
      }));
  }
  crear(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<unknown>(environment.apiUrl.replace(/\/$/, '') + '/pedidos', request,
      {observe: 'response', timeout: 20000}).pipe(map(response => {
        if (response.status !== 201) throw new PedidoProtocolError();
        return confirmedPedido(response.body, request);
      }));
  }
}
