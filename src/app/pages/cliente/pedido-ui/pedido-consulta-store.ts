import {DestroyRef, Injectable, computed, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {EMPTY, Subscription, catchError, switchMap, tap} from 'rxjs';
import {API_SESSION, activeClientSession} from '../../../core/auth/api-session';
import {PedidoService} from '../../../core/services/pedido.service';
import {PagoService} from '../../../core/services/pago.service';
import {PedidoResponse} from '../../../core/models/pedido-api.model';
import {PagoResponse} from '../../../core/models/pago-api.model';
import {QueryState} from './pedido.model';

/** Una instancia por consulta. No usa fixtures ni conserva datos de una sesión anterior. */
@Injectable()
export class PedidoConsultaStore {
  private readonly session=inject(API_SESSION);
  private readonly pedidos=inject(PedidoService);
  private readonly pagos=inject(PagoService);
  private readonly orderValue=signal<PedidoResponse|null>(null);
  private readonly paymentValue=signal<PagoResponse|null>(null);
  private readonly state=signal<QueryState>('loading');
  private readonly payState=signal<QueryState>('loading');
  private readonly ownerKey=signal('');
  private version=0;
  private request?:Subscription;
  readonly issue=signal('');
  readonly paymentIssue=signal('');
  readonly hasSession=computed(()=>activeClientSession(this.session()));
  private readonly sessionKey=computed(()=>{const s=this.session();return activeClientSession(s)?s.subject+':'+s.accessToken:'';});
  readonly order=computed(()=>this.sessionKey()&&this.sessionKey()===this.ownerKey()?this.orderValue():null);
  readonly payment=computed(()=>this.order()?this.paymentValue():null);
  readonly queryState=computed<QueryState>(()=>!this.hasSession()?'unauthenticated':
    this.sessionKey()!==this.ownerKey()?'loading':this.state());
  readonly paymentQueryState=this.payState.asReadonly();

  constructor(){inject(DestroyRef).onDestroy(()=>{this.version++;this.request?.unsubscribe();});}
  load(id:number|null,mode:'order'|'payment'):void {
    const version=++this.version;
    this.request?.unsubscribe();this.orderValue.set(null);this.paymentValue.set(null);
    this.issue.set('');this.paymentIssue.set('');this.payState.set('loading');
    const session=this.session();const key=this.sessionKey();this.ownerKey.set(key);
    if(!activeClientSession(session)){this.state.set('unauthenticated');return;}
    if(id===null){this.state.set('missing-id');return;}
    this.state.set('loading');
    const current=()=>version===this.version&&key===this.sessionKey();
    const own=(order:PedidoResponse)=>{if(String(order.clienteId)!==session.subject)throw new HttpErrorResponse({status:404});return order;};
    this.request=this.pedidos.obtener(id).pipe(switchMap(raw=>{
      if(!current())return EMPTY;
      const order=own(raw);this.orderValue.set(order);this.state.set('ready');
      if(mode==='order')return EMPTY;
      return this.pagos.consultar(id,order.total).pipe(tap(payment=>{
        if(current()){this.paymentValue.set(payment);this.payState.set('ready');}
      }),catchError(error=>{
        if(!current())return EMPTY;
        if(error instanceof HttpErrorResponse&&error.status===404){
          // Distinguir pago ausente de pedido que ya no es accesible, sin depender del mensaje libre.
          return this.pedidos.obtener(id).pipe(tap(rechecked=>{
            if(!current())return;
            this.orderValue.set(own(rechecked));this.paymentValue.set(null);this.payState.set('ready');
          }),catchError(cause=>{if(current())this.failOrder(cause);return EMPTY;}));
        }
        if(error instanceof HttpErrorResponse&&[401,403].includes(error.status)){this.failOrder(error);return EMPTY;}
        this.paymentValue.set(null);this.payState.set('error');
        this.paymentIssue.set('No pudimos consultar el pago. Puedes volver a intentarlo sin modificar el pedido.');
        return EMPTY;
      }));
    })).subscribe({error: cause=>{if(current())this.failOrder(cause);}});
  }
  private failOrder(error:unknown):void {
    this.orderValue.set(null);this.paymentValue.set(null);this.paymentIssue.set('');
    const status=error instanceof HttpErrorResponse?error.status:0;
    this.state.set(status===404?'not-found':status===403?'forbidden':status===401?'unauthenticated':'error');
    this.issue.set('No pudimos verificar la información del pedido. Intenta consultar nuevamente.');
  }
}
