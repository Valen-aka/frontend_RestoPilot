import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PagoResponse} from '../models/pago-api.model';
import {readPago} from '../models/pedido-query.model';

@Injectable({providedIn:'root'})
export class PagoService {
  private readonly http=inject(HttpClient);
  consultar(pedidoId:number,total:number):Observable<PagoResponse> {
    return this.http.get<unknown>(environment.apiUrl.replace(/\/$/,'')+'/pedidos/'+pedidoId+'/pagos',{timeout:20000})
      .pipe(map(value=>readPago(value,pedidoId,total)));
  }
}
