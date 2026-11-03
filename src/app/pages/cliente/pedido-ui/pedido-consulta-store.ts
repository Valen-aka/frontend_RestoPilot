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
  private mode:'order'|'payment'='order';
  private readonly refreshingValue=signal(false);
  private readonly staleValue=signal(false);
  readonly refreshing=this.refreshingValue.asReadonly();
  readonly stale=this.staleValue.asReadonly();
  readonly refreshIssue=signal('');
  readonly refreshStatus=signal('');
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
    this.mode=mode;this.refreshingValue.set(false);this.staleValue.set(false);this.refreshIssue.set('');this.refreshStatus.set('');
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
  /** Solo vuelve a consultar el pedido propio; no solicita ninguna transición. */
  refresh():void {
    if(this.mode!=='order'||this.refreshing()||this.queryState()!=='ready')return;
    const order=this.order(),session=this.session(),key=this.sessionKey();
    if(!order||!activeClientSession(session))return;
    const version=++this.version;this.request?.unsubscribe();
    this.refreshingValue.set(true);this.refreshIssue.set('');this.refreshStatus.set('');
    const current=()=>version===this.version&&key===this.sessionKey();
    this.request=this.pedidos.obtener(order.id).subscribe({next:updated=>{
      if(!current())return;
      if(String(updated.clienteId)!==session.subject){this.failOrder(new HttpErrorResponse({status:404}));return;}
      this.orderValue.set(updated);this.staleValue.set(false);this.refreshingValue.set(false);
      this.refreshStatus.set('Consulta de seguimiento actualizada.');
    },error:error=>{
      if(!current())return;
      this.refreshingValue.set(false);
      if(error instanceof HttpErrorResponse&&[401,403,404].includes(error.status)){this.failOrder(error);return;}
      // La última respuesta válida del mismo pedido no se presenta como una consulta nueva.
      this.staleValue.set(true);
      this.refreshIssue.set('No pudimos actualizar el seguimiento. Se muestra el último estado confirmado; vuelve a intentarlo para comprobar si cambió.');
    },complete:()=>{if(current())this.refreshingValue.set(false);}});
  }

  private failOrder(error:unknown):void {
    this.refreshingValue.set(false);this.staleValue.set(false);this.refreshIssue.set('');this.refreshStatus.set('');
    this.orderValue.set(null);this.paymentValue.set(null);this.paymentIssue.set('');
    const status=error instanceof HttpErrorResponse?error.status:0;
    this.state.set(status===404?'not-found':status===403?'forbidden':status===401?'unauthenticated':'error');
    this.issue.set('No pudimos verificar la información del pedido. Intenta consultar nuevamente.');
  }
}
