import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {PagoRequest, PagoResponse} from '../models/pago-api.model';
import {readPago} from '../models/pedido-query.model';

@Injectable({providedIn:'root'})
export class PagoService {
  private readonly http=inject(HttpClient);
  consultar(pedidoId:number,total:number):Observable<PagoResponse> {
    return this.http.get<unknown>(environment.apiUrl.replace(/\/$/,'')+'/pedidos/'+pedidoId+'/pagos',{timeout:20000})
      .pipe(map(value=>readPago(value,pedidoId,total)));
  }
  registrar(pedidoId:number,request:PagoRequest):Observable<PagoResponse> {
    const body={monto:request.monto,metodo:request.metodo,codigoReferencia:request.codigoReferencia,estado:request.estado};
    return this.http.post<unknown>(environment.apiUrl.replace(/\/$/,'')+'/pedidos/'+pedidoId+'/pagos',body,{observe:'response',timeout:20000})
      .pipe(map(response=>{
        if(response.status!==201)throw new Error('No pudimos verificar el registro del pago.');
        const payment=readPago(response.body,pedidoId,request.monto);
        if(payment.estado!==request.estado||payment.metodo!==request.metodo||payment.codigoReferencia!==request.codigoReferencia||
          (payment.estado==='PAGADO'&&!payment.fechaPago))throw new Error('La confirmación no coincide con el pago enviado.');
        return payment;
      }));
  }
}
