import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {PedidoService} from '../../../core/services/pedido.service';
import {KitchenCommand, KitchenOrder, KitchenTransition, NEXT_KITCHEN_STATUS, isActive} from './cocina.model';
import {EstadoPedido} from '../../../core/models/pedido-api.model';
import {kitchenOrder} from './cocina-api.adapter';

@Injectable({providedIn:'root'})
export class CocinaStore {
  private readonly session=inject(API_SESSION);
  private readonly pedidos=inject(PedidoService);
  readonly sessionKey=computed(()=>{const s=this.session();return activeOperationSession(s)?s.subject+':'+s.restauranteId+':'+s.accessToken:'';});
  private readonly owner=signal('');
  private readonly entries=signal<readonly KitchenOrder[]>([]);
  private readonly detail=signal<KitchenOrder|undefined>(undefined);
  private request?:Subscription;
  private version=0;
  private actionVersion=0;
  private mutation?:Subscription;
  private actionQueue?:Subscription;
  private completeAction?: (result:KitchenTransition)=>void;
  private readonly retainedValue=signal<KitchenOrder|undefined>(undefined);
  readonly retainedOrder=computed(()=>this.owner()===this.sessionKey()?this.retainedValue():undefined);
  readonly verificationId=signal<number|null>(null);
  readonly queueIssue=signal('');
  private mode:'queue'|'detail'='queue';
  private selectedId?:number;
  private readonly state=signal<'ready'|'loading'|'error'|'stale'>('loading');
  readonly issue=signal('');
  readonly refreshing=signal(false);
  readonly page=signal(0);
  readonly size=signal(20);
  readonly total=signal(0);
  readonly actionBusy=signal(false);
  readonly lastSelectedId=signal<number|undefined>(undefined);
  readonly actionMessage=signal<{id:number;kind:'success'|'error';text:string}|undefined>(undefined);
  readonly hasSession=computed(()=>!!this.sessionKey());
  readonly queryState=computed(()=>!this.hasSession()?'error':this.state());
  readonly problem=computed(()=>!this.hasSession()?'Acceso restringido. Necesitas una sesión de dueño o administrador con restaurante asignado.':this.issue());
  readonly orders=computed(()=>this.sessionKey()&&this.owner()===this.sessionKey()?this.entries():[]);
  readonly queue=this.orders;
  readonly displayed=this.orders;
  readonly restaurantName=computed(()=>this.orders()[0]?.restaurantName||this.currentDetail()?.restaurantName||'Restaurante de la sesión');
  readonly restaurantId=computed(()=>{const s=this.session();return activeOperationSession(s)?s.restauranteId:null;});
  readonly currentDetail=computed(()=>this.sessionKey()&&this.owner()===this.sessionKey()?this.detail():undefined);

  constructor(){
    effect(()=>{const key=this.sessionKey();untracked(()=>{if(key!==this.owner())this.clear();});});
    inject(DestroyRef).onDestroy(()=>this.clear());
  }
  private clear():void {
    this.actionVersion++;this.mutation?.unsubscribe();this.actionQueue?.unsubscribe();
    this.completeAction?.({ok:false,orders:[],reason:'La sesión de la operación cambió.'});this.completeAction=undefined;
    this.actionBusy.set(false);this.verificationId.set(null);this.queueIssue.set('');this.retainedValue.set(undefined);
    this.version++;this.request?.unsubscribe();this.entries.set([]);this.detail.set(undefined);this.owner.set('');
    this.total.set(0);this.lastSelectedId.set(undefined);this.actionMessage.set(undefined);this.refreshing.set(false);
    this.issue.set('');this.state.set('loading');
  }
  findOrder(id:number|undefined):KitchenOrder|undefined {
    return this.currentDetail()?.id===id?this.currentDetail():this.orders().find(order=>order.id===id) ?? (this.retainedOrder()?.id===id?this.retainedOrder():undefined);
  }
  loadQueue(page=this.page(),size=this.size()):void {
    this.mode='queue';this.selectedId=undefined;
    if(!Number.isSafeInteger(page)||page<0||![10,20,50].includes(size))return;
    const s=this.session();if(!activeOperationSession(s)){this.clear();return;}
    const key=this.sessionKey(),version=++this.version;
    const keep=this.owner()===key&&page===this.page()&&size===this.size()&&this.entries().length>0;
    this.request?.unsubscribe();this.owner.set(key);this.issue.set('');
    if(!keep)this.entries.set([]);
    this.page.set(page);this.size.set(size);this.state.set(keep?'ready':'loading');this.refreshing.set(true);
    const current=()=>version===this.version&&key===this.sessionKey();
    this.request=this.pedidos.pendientesCocina(page,size).subscribe({next:result=>{
      if(!current())return;
      if(result.content.some(p=>p.restauranteId!==s.restauranteId)){this.fail(new HttpErrorResponse({status:403}),false);return;}
      if(!result.content.length&&page>0){this.loadQueue(Math.max(0,result.totalPages-1),size);return;}
      try {this.entries.set(result.content.map(kitchenOrder));}catch(error){this.fail(error,false);return;}
      this.total.set(result.totalElements);this.queueIssue.set('');this.state.set('ready');this.refreshing.set(false);
      const selected=this.detail();const fresh=this.entries().find(p=>p.id===selected?.id);if(fresh)this.detail.set(fresh);
    },error:error=>{if(current())this.fail(error,keep);}});
  }
  loadDetail(id:number|undefined):void {
    this.mode='detail';this.selectedId=id;
    const s=this.session();if(!activeOperationSession(s)){this.clear();return;}
    const key=this.sessionKey(),version=++this.version;
    const keep=this.owner()===key&&this.detail()?.id===id;
    this.request?.unsubscribe();this.owner.set(key);this.issue.set('');
    if(!keep)this.detail.set(undefined);
    if(!Number.isSafeInteger(id)||!id||id<1){this.issue.set('Selecciona un pedido válido para consultarlo.');this.state.set('error');this.refreshing.set(false);return;}
    this.state.set(keep?'ready':'loading');this.refreshing.set(true);
    const current=()=>version===this.version&&key===this.sessionKey();
    this.request=this.pedidos.obtener(id).subscribe({next:p=>{
      if(!current())return;
      if(p.restauranteId!==s.restauranteId){this.fail(new HttpErrorResponse({status:403}),false);return;}
      try{this.detail.set(kitchenOrder(p));}catch(error){this.fail(error,false);return;}
      this.lastSelectedId.set(id);this.state.set('ready');this.refreshing.set(false);
    },error:error=>{if(current())this.fail(error,keep);}});
  }
  refresh():void {
    if(this.actionBusy()||this.refreshing())return;
    if(this.verificationId()!==null){this.verifyPending();return;}
    if(this.mode==='queue')this.loadQueue();else this.loadDetail(this.selectedId);
  }
  private fail(error:unknown,keep:boolean):void {
    const status=error instanceof HttpErrorResponse?error.status:0;
    const restricted=[401,403,404].includes(status);
    if(restricted||!keep){this.entries.set([]);this.detail.set(undefined);this.total.set(0);}
    if(restricted){this.retainedValue.set(undefined);this.lastSelectedId.set(undefined);}
    this.state.set(keep&&!restricted?'stale':'error');this.refreshing.set(false);
    this.issue.set(status===401?'La sesión expiró. Inicia sesión nuevamente.':status===403?'No tienes acceso a los pedidos de este restaurante.':
      status===404?'El pedido no está disponible.':'No pudimos completar la consulta. Puedes volver a intentarlo.');
  }
  canAct(id:number):boolean {
    return this.hasSession() && !this.actionBusy() && !this.refreshing() && this.verificationId()===null &&
      this.queryState()==='ready' && !this.problem() && !!this.findOrder(id);
  }
  private record(order:KitchenOrder):void {
    this.retainedValue.set(order);this.lastSelectedId.set(order.id);
    if(this.mode==='queue'||this.selectedId===order.id)this.detail.set(order);
    this.entries.update(orders=>orders.flatMap(p=>p.id===order.id?(isActive(order)?[order]:[]):[p]));
  }
  private finish(result:KitchenTransition):void {
    const resolve=this.completeAction;this.completeAction=undefined;
    this.actionBusy.set(false);resolve?.(result);
  }
  applyTransition(command:KitchenCommand):Promise<KitchenTransition> {
    const order=this.findOrder(command.id),session=this.session();
    if(this.completeAction || !activeOperationSession(session) || this.refreshing() || this.verificationId()!==null ||
      this.queryState()!=='ready' || !!this.problem() || !order || order.status!==command.expected ||
      NEXT_KITCHEN_STATUS[order.status]!==command.target){
      const reason='La acción ya no está disponible. Consulta el estado actual del pedido.';
      if(!this.completeAction){this.actionBusy.set(false);this.actionMessage.set({id:command.id,kind:'error',text:reason});}
      return Promise.resolve({ok:false,orders:this.orders(),reason});
    }
    const version=++this.actionVersion,key=this.sessionKey();
    const current=()=>version===this.actionVersion&&key===this.sessionKey();
    const targets:Record<KitchenOrder['status'],EstadoPedido>={Pendiente:'PENDIENTE','En preparación':'EN_PREPARACION',Listo:'LISTO',Entregado:'ENTREGADO',Cancelado:'CANCELADO'};
    this.actionBusy.set(true);this.actionMessage.set(undefined);this.queueIssue.set('');
    return new Promise(resolve=>{
      this.completeAction=resolve;
      this.mutation=this.pedidos.cambiarEstado(command.id,targets[command.target]).subscribe({next:value=>{
        if(!current())return;
        let updated:KitchenOrder;
        try{
          updated=kitchenOrder(value);
          if(updated.id!==command.id||updated.restaurantId!==String(session.restauranteId)||updated.status!==command.target)throw new Error('Confirmación incompatible');
        }catch{this.verifyChange(command.id,version,key,'No pudimos verificar la respuesta del cambio.');return;}
        this.record(updated);
        this.actionMessage.set({id:updated.id,kind:'success',text:'Pedido #'+updated.id+': '+updated.status+' confirmado.'});
        this.refreshAfterAction(version,key,()=>this.finish({ok:true,orders:this.orders(),order:updated}));
      },error:error=>{
        if(!current())return;
        const status=error instanceof HttpErrorResponse?error.status:0;
        if([401,403,404].includes(status)){
          this.fail(error,false);this.actionMessage.set(undefined);this.finish({ok:false,orders:[],reason:this.issue()});return;
        }
        this.verifyChange(command.id,version,key,[400,409].includes(status)?
          'El servidor rechazó el cambio. Revisa el estado actual antes de otra acción.':
          'No pudimos verificar la respuesta del cambio. No repitas la acción hasta consultar su estado.');
      }});
    });
  }
  private verifyChange(id:number,version:number,key:string,message:string):void {
    this.verificationId.set(id);this.actionMessage.set({id,kind:'error',text:message});
    const current=()=>version===this.actionVersion&&key===this.sessionKey();
    this.mutation=this.pedidos.obtener(id).subscribe({next:value=>{
      if(!current())return;
      try{
        const updated=kitchenOrder(value),session=this.session();
        if(!activeOperationSession(session)||updated.id!==id||updated.restaurantId!==String(session.restauranteId)){
          this.fail(new HttpErrorResponse({status:403}),false);this.verificationId.set(null);this.finish({ok:false,orders:[],reason:this.issue()});return;
        }
        this.record(updated);this.verificationId.set(null);this.issue.set('');this.state.set('ready');
        this.actionMessage.set({id,kind:'error',text:message+' Estado consultado: '+updated.status+'.'});
        this.refreshAfterAction(version,key,()=>this.finish({ok:false,orders:this.orders(),reason:message}));
      }catch{this.verificationFailed(id,message);}
    },error:error=>{
      if(!current())return;
      if(error instanceof HttpErrorResponse&&[401,403,404].includes(error.status)){
        this.fail(error,false);this.verificationId.set(null);this.finish({ok:false,orders:[],reason:this.issue()});return;
      }
      this.verificationFailed(id,message);
    }});
  }
  private verificationFailed(id:number,message:string):void {
    this.actionMessage.set({id,kind:'error',text:message+' La consulta también falló. Usa «Verificar estado» para recuperar la operación.'});
    this.finish({ok:false,orders:this.orders(),reason:'El resultado del cambio sigue sin verificar.'});
  }
  verifyPending():void {
    const id=this.verificationId();if(id===null||this.actionBusy()||!this.hasSession())return;
    this.actionBusy.set(true);const version=++this.actionVersion;
    this.verifyChange(id,version,this.sessionKey(),'Se volvió a consultar el resultado de la operación.');
  }
  private refreshAfterAction(version:number,key:string,done:()=>void):void {
    const current=()=>version===this.actionVersion&&key===this.sessionKey();
    const fetch=(page:number):void=>{
      this.actionQueue=this.pedidos.pendientesCocina(page,this.size()).subscribe({next:result=>{
        if(!current())return;
        const session=this.session();
        if(!activeOperationSession(session)||result.content.some(p=>p.restauranteId!==session.restauranteId)){
          this.fail(new HttpErrorResponse({status:403}),false);this.finish({ok:false,orders:[],reason:this.issue()});return;
        }
        if(!result.content.length&&page>0){fetch(Math.max(0,result.totalPages-1));return;}
        try{this.entries.set(result.content.map(kitchenOrder));}catch{this.queueIssue.set('El cambio ya fue consultado, pero la cola no pudo actualizarse. Puedes volver a consultarla.');done();return;}
        this.page.set(page);this.total.set(result.totalElements);this.queueIssue.set('');done();
      },error:error=>{
        if(!current())return;
        if(error instanceof HttpErrorResponse&&[401,403].includes(error.status)){
          this.fail(error,false);this.finish({ok:false,orders:[],reason:this.issue()});return;
        }
        this.queueIssue.set('El estado del pedido ya fue consultado, pero no se pudo actualizar la cola. Puedes volver a consultarla sin repetir el cambio.');
        done();
      }});
    };
    fetch(this.page());
  }
}
