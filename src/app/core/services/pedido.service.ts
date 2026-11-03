import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {confirmedPedido, PedidoProtocolError, PedidoRequest, PedidoResponse} from '../models/pedido-api.model';

@Injectable({providedIn: 'root'})
export class PedidoService {
  private readonly http = inject(HttpClient);
  crear(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<unknown>(environment.apiUrl.replace(/\/$/, '') + '/pedidos', request,
      {observe: 'response', timeout: 20000}).pipe(map(response => {
        if (response.status !== 201) throw new PedidoProtocolError();
        return confirmedPedido(response.body, request);
      }));
  }
}
