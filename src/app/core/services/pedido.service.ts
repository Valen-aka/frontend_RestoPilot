import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {confirmedPedido, PedidoProtocolError, PedidoRequest, PedidoResponse} from '../models/pedido-api.model';

import {CocinaPage, readCocinaPage} from '../models/cocina-api.model';
import {PedidosPage, readPedido, readPedidosPage} from '../models/pedido-query.model';

@Injectable({providedIn: 'root'})
export class PedidoService {
  private readonly http = inject(HttpClient);
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
  crear(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<unknown>(environment.apiUrl.replace(/\/$/, '') + '/pedidos', request,
      {observe: 'response', timeout: 20000}).pipe(map(response => {
        if (response.status !== 201) throw new PedidoProtocolError();
        return confirmedPedido(response.body, request);
      }));
  }
}
