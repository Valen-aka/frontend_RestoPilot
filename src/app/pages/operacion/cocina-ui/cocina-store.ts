import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {PedidoService} from '../../../core/services/pedido.service';
import {KitchenCommand, KitchenOrder, KitchenTransition} from './cocina.model';
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
    inject(DestroyRef).onDestroy(()=>this.request?.unsubscribe());
  }
  private clear():void {
    this.version++;this.request?.unsubscribe();this.entries.set([]);this.detail.set(undefined);this.owner.set('');
    this.total.set(0);this.lastSelectedId.set(undefined);this.actionMessage.set(undefined);this.refreshing.set(false);
    this.issue.set('');this.state.set('loading');
  }
  findOrder(id:number|undefined):KitchenOrder|undefined {
    return this.currentDetail()?.id===id?this.currentDetail():this.orders().find(order=>order.id===id);
  }
  loadQueue(page=this.page(),size=this.size()):void {
    this.mode='queue';this.selectedId=undefined;
    if(!Number.isSafeInteger(page)||page<0||![10,20,50].includes(size))return;
    const s=this.session();if(!activeOperationSession(s)){this.clear();return;}
    const key=this.sessionKey(),version=++this.version;
    const keep=this.owner()===key&&page===this.page()&&size===this.size()&&this.entries().length>0;
    this.request?.unsubscribe();this.owner.set(key);this.detail.set(undefined);this.issue.set('');
    if(!keep)this.entries.set([]);
    this.page.set(page);this.size.set(size);this.state.set(keep?'ready':'loading');this.refreshing.set(true);
    const current=()=>version===this.version&&key===this.sessionKey();
    this.request=this.pedidos.pendientesCocina(page,size).subscribe({next:result=>{
      if(!current())return;
      if(result.content.some(p=>p.restauranteId!==s.restauranteId)){this.fail(new HttpErrorResponse({status:403}),false);return;}
      if(!result.content.length&&page>0){this.loadQueue(Math.max(0,result.totalPages-1),size);return;}
      try {this.entries.set(result.content.map(kitchenOrder));}catch(error){this.fail(error,false);return;}
      this.total.set(result.totalElements);this.state.set('ready');this.refreshing.set(false);
    },error:error=>{if(current())this.fail(error,keep);}});
  }
  loadDetail(id:number|undefined):void {
    this.mode='detail';this.selectedId=id;
    const s=this.session();if(!activeOperationSession(s)){this.clear();return;}
    const key=this.sessionKey(),version=++this.version;
    const keep=this.owner()===key&&this.detail()?.id===id;
    this.request?.unsubscribe();this.owner.set(key);this.entries.set([]);this.issue.set('');
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
  refresh():void {if(!this.refreshing()){if(this.mode==='queue')this.loadQueue();else this.loadDetail(this.selectedId);}}
  private fail(error:unknown,keep:boolean):void {
    const status=error instanceof HttpErrorResponse?error.status:0;
    const restricted=[401,403,404].includes(status);
    if(restricted||!keep){this.entries.set([]);this.detail.set(undefined);this.total.set(0);}
    this.state.set(keep&&!restricted?'stale':'error');this.refreshing.set(false);
    this.issue.set(status===401?'La sesión expiró. Inicia sesión nuevamente.':status===403?'No tienes acceso a los pedidos de este restaurante.':
      status===404?'El pedido no está disponible.':'No pudimos completar la consulta. Puedes volver a intentarlo.');
  }
  /** US15 es de lectura; las mutaciones reales se conectan en US19. */
  applyTransition(_command:KitchenCommand):KitchenTransition {
    return {ok:false,orders:this.orders(),reason:'Las acciones de preparación y entrega todavía no están conectadas.'};
  }
}
