import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription, switchMap, map} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {PedidoService} from '../../../core/services/pedido.service';
import {PagoService} from '../../../core/services/pago.service';
import {PedidoResponse, positiveId} from '../../../core/models/pedido-api.model';
import {parsePedidoId} from '../../../core/models/pedido-query.model';
import {PagoRequest, PagoResponse} from '../../../core/models/pago-api.model';

export function paymentId(raw:string|null):number|null {
  if(raw===null)return null;
  return parsePedidoId(raw)??NaN;
}
export function paymentProblem(error:unknown):string {
  if(error instanceof HttpErrorResponse){
    if(error.status===401)return 'Tu sesión terminó. Inicia sesión nuevamente.';
    if(error.status===403)return 'No tienes permiso para gestionar este pedido.';
    if(error.status===404)return 'No se encontró el pedido o su registro de pago.';
    if(error.status===409)return 'El pedido ya tiene un pago confirmado. Consulta su estado actualizado.';
    if(error.status===400&&typeof error.error?.mensaje==='string')return error.error.mensaje;
  }
  return 'No pudimos completar la consulta. Revisa la conexión y vuelve a intentarlo.';
}

/** Conserva el bloqueo de una escritura aunque cambie la variante o se abandone la página. */
@Injectable({providedIn:'root'})
export class PagosStore {
  readonly session=inject(API_SESSION);
  private readonly pedidos=inject(PedidoService);
  private readonly pagos=inject(PagoService);
  private readonly destroyRef=inject(DestroyRef);
  private query?:Subscription;
  private write?:Subscription;
  private epoch=0;
  private requested:number|null=null;
  private readonly identity=signal('');
  private readonly rawOrder=signal<PedidoResponse|null>(null);
  private readonly rawPayment=signal<PagoResponse|null>(null);
  readonly order=computed(()=>this.identity()===this.session()?.accessToken&&activeOperationSession(this.session())?this.rawOrder():null);
  readonly payment=computed(()=>this.order()?this.rawPayment():null);
  readonly state=signal<'idle'|'loading'|'ready'|'error'>('idle');
  readonly problem=signal('');
  readonly savingId=signal<number|null>(null);
  readonly uncertainIds=signal<ReadonlySet<number>>(new Set());
  readonly hasSession=computed(()=>activeOperationSession(this.session()));
  readonly locked=computed(()=>this.order()?.estado==='CANCELADO'||this.payment()?.estado==='PAGADO');
  constructor(){
    effect(()=>{this.session();untracked(()=>{
      this.epoch++;this.query?.unsubscribe();this.write?.unsubscribe();this.savingId.set(null);
      this.uncertainIds.set(new Set());this.rawOrder.set(null);this.rawPayment.set(null);this.problem.set('');this.state.set('idle');
      if(this.requested!==null)this.load(this.requested);
    });});
    this.destroyRef.onDestroy(()=>{this.query?.unsubscribe();this.write?.unsubscribe();});
  }
  isUncertain(id:number|null):boolean{return id!==null&&this.uncertainIds().has(id);}
  load(id:number|null,reconcile=false):void {
    if(reconcile&&this.savingId()!==null)return;
    this.requested=id;this.query?.unsubscribe();this.rawOrder.set(null);this.rawPayment.set(null);this.problem.set('');
    if(id===null){this.state.set('idle');return;}
    if(!positiveId(id)){this.state.set('error');this.problem.set('Indica un identificador de pedido válido.');return;}
    const session=this.session(),epoch=this.epoch;
    if(!activeOperationSession(session)){this.state.set('error');this.problem.set('Necesitas una sesión de dueño o administrador vigente.');return;}
    this.identity.set(session.accessToken);this.state.set('loading');
    this.query=this.pedidos.obtener(id).pipe(switchMap(order=>this.pagos.consultar(id,order.total).pipe(map(payment=>({order,payment}))))).subscribe({
      next:({order,payment})=>{
        if(epoch!==this.epoch||this.requested!==id||session.accessToken!==this.session()?.accessToken)return;
        if(order.restauranteId!==session.restauranteId){this.state.set('error');this.problem.set('El pedido no pertenece a tu restaurante.');return;}
        if(payment.estado==='PAGADO'&&(!payment.metodo||!payment.fechaPago||(payment.metodo!=='EFECTIVO'&&!payment.codigoReferencia?.trim()))){this.state.set('error');this.problem.set('El servidor devolvió un pago confirmado incompleto. Vuelve a consultar.');return;}
        this.rawOrder.set(order);this.rawPayment.set(payment);this.state.set('ready');
        if(reconcile||payment.estado==='PAGADO')this.clearUncertain(id);
      },
      error:error=>{if(epoch===this.epoch&&this.requested===id&&session.accessToken===this.session()?.accessToken){this.state.set('error');this.problem.set(paymentProblem(error));}}
    });
  }
  submit(request:PagoRequest,onConfirmed:()=>void):void {
    const order=this.order(),session=this.session(),epoch=this.epoch;
    if(!order||this.state()!=='ready'||!activeOperationSession(session)||order.restauranteId!==session.restauranteId||
      this.locked()||this.savingId()!==null||this.isUncertain(order.id)||request.monto!==order.total||request.monto<=0||!Number.isFinite(request.monto)||!['PENDIENTE','PAGADO'].includes(request.estado)||!['YAPE','PLIN','TARJETA','EFECTIVO'].includes(request.metodo)||
      (request.codigoReferencia?.length??0)>100||(request.estado==='PAGADO'&&request.metodo!=='EFECTIVO'&&!request.codigoReferencia?.trim()))return;
    this.savingId.set(order.id);this.problem.set('');
    // Se establece antes del envío para impedir repetir al cambiar de ruta.
    this.uncertainIds.update(ids=>new Set([...ids,order.id]));
    this.write=this.pagos.registrar(order.id,request).subscribe({next:payment=>{
      if(epoch!==this.epoch||session.accessToken!==this.session()?.accessToken)return;
      this.savingId.set(null);this.clearUncertain(order.id);
      if(this.requested===order.id){this.rawPayment.set(payment);this.problem.set('');onConfirmed();}
    },error:error=>{
      if(epoch!==this.epoch||session.accessToken!==this.session()?.accessToken)return;
      this.savingId.set(null);
      if(error instanceof HttpErrorResponse&&error.status>=400&&error.status<500&&error.status!==408)this.clearUncertain(order.id);
      if(this.requested===order.id)this.problem.set(this.isUncertain(order.id)?
        'No pudimos confirmar la respuesta. El pago podría haberse registrado. Consulta el estado antes de volver a enviarlo.':paymentProblem(error));
    }});
  }
  private clearUncertain(id:number):void {this.uncertainIds.update(ids=>{const next=new Set(ids);next.delete(id);return next;});}
}
