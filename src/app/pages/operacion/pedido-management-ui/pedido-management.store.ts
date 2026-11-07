import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription, forkJoin, switchMap, map, of} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {PedidoService} from '../../../core/services/pedido.service';
import {PagoService} from '../../../core/services/pago.service';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {PedidoRequest, PedidoResponse} from '../../../core/models/pedido-api.model';
import {parsePedidoId} from '../../../core/models/pedido-query.model';
import {PagoResponse} from '../../../core/models/pago-api.model';
import {PlatoResponse, MesaResponse, RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {matchesAdjustment} from './pedido-management.model';

@Injectable({providedIn:'root'})
export class PedidoManagementStore {
 private readonly session=inject(API_SESSION);private readonly pedidos=inject(PedidoService);private readonly pagos=inject(PagoService);private readonly catalogo=inject(CatalogoService);
 private readonly owner=signal('');private version=0;private query?:Subscription;private mutation?:Subscription;private selected:number|null=null;private needsCatalog=true;
 private readonly orderValue=signal<PedidoResponse|null>(null);private readonly paymentValue=signal<PagoResponse|null>(null);readonly order=computed(()=>this.owner()===this.sessionKey()?this.orderValue():null);readonly payment=computed(()=>this.owner()===this.sessionKey()?this.paymentValue():null);readonly dishes=signal<readonly PlatoResponse[]>([]);readonly tables=signal<readonly MesaResponse[]>([]);readonly restaurant=signal<RestauranteResponse|null>(null);
 readonly state=signal<'loading'|'ready'|'error'>('loading');readonly busy=signal(false);readonly uncertain=signal(false);readonly problem=signal('');readonly notice=signal('');
 private expected:PedidoRequest|'cancel'|null=null;private readonly unresolved=new Map<number,PedidoRequest|'cancel'>();
 readonly sessionKey=computed(()=>{const s=this.session();return activeOperationSession(s)?s.subject+':'+s.restauranteId+':'+s.accessToken:'';});
 readonly blocked=computed(()=>!this.order()||this.order()?.estado!=='PENDIENTE'||this.payment()?.estado==='PAGADO');
 readonly canMutate=computed(()=>!!this.sessionKey()&&this.state()==='ready'&&!this.blocked()&&!this.busy()&&!this.uncertain());
 constructor(){effect(()=>{const key=this.sessionKey();untracked(()=>{if(this.owner()!==key){this.unresolved.clear();this.clear();}});});inject(DestroyRef).onDestroy(()=>this.clear());}
 private clear():void {this.version++;this.query?.unsubscribe();this.mutation?.unsubscribe();this.selected=null;this.owner.set('');this.orderValue.set(null);this.paymentValue.set(null);this.dishes.set([]);this.tables.set([]);this.restaurant.set(null);this.busy.set(false);this.uncertain.set(false);this.expected=null;this.problem.set('');this.notice.set('');this.state.set('loading');}
 load(raw:unknown,needsCatalog=true):void {
  if(this.busy())return;this.needsCatalog=needsCatalog;
  const id=parsePedidoId(raw),key=this.sessionKey();if(this.owner()!==key){this.unresolved.clear();this.clear();}else if(this.selected!==id)this.clear();
  this.owner.set(key);this.selected=id;this.expected=id===null?null:this.unresolved.get(id)??null;this.uncertain.set(this.expected!==null);const version=++this.version;this.query?.unsubscribe();this.problem.set('');this.state.set('loading');
  if(!key){this.fail(new HttpErrorResponse({status:401}));return;}if(id===null){this.problem.set('Selecciona un pedido válido desde la lista de pedidos.');this.state.set('error');return;}
  const session=this.session()!;const current=()=>version===this.version&&key===this.sessionKey();
  this.query=this.pedidos.obtener(id).pipe(switchMap(order=>{
   if(order.restauranteId!==session.restauranteId)throw new HttpErrorResponse({status:403});
   return this.pagos.consultar(id,order.total).pipe(switchMap(payment=>{
    if(!needsCatalog||order.estado!=='PENDIENTE'||payment.estado==='PAGADO')return of({order,payment,restaurant:null as RestauranteResponse|null,dishes:[] as readonly PlatoResponse[],tables:[] as readonly MesaResponse[]});
    return this.catalogo.restaurante(order.restauranteId).pipe(switchMap(restaurant=>forkJoin([this.catalogo.platos(order.restauranteId),restaurant.tieneAtencionFisica?this.catalogo.mesasPropias(order.restauranteId):of([] as readonly MesaResponse[])]).pipe(map(([dishes,tables])=>({order,payment,restaurant,dishes,tables})))));
   }));
  })).subscribe({next:r=>{if(!current())return;this.orderValue.set(r.order);this.paymentValue.set(r.payment);this.restaurant.set(r.restaurant);this.dishes.set(r.dishes);this.tables.set(r.tables);this.state.set('ready');
   if(this.uncertain()&&this.expected&&(this.expected==='cancel'?r.order.estado==='CANCELADO':matchesAdjustment(r.order,this.expected))){this.unresolved.delete(r.order.id);this.uncertain.set(false);this.expected=null;this.notice.set('El estado consultado confirma la operación.');}
  },error:e=>{if(current())this.fail(e);}});
 }
 save(request:PedidoRequest):void {const order=this.order();if(!order||!this.canMutate())return;this.mutate(request,this.pedidos.ajustar(order,request));}
 cancel():void {const order=this.order();if(!order||!this.canMutate())return;this.mutate('cancel',this.pedidos.cancelarAdministrativo(order.id));}
 private mutate(expected:PedidoRequest|'cancel',operation:import('rxjs').Observable<unknown>):void {
  const order=this.order()!,key=this.sessionKey(),version=++this.version;this.query?.unsubscribe();this.busy.set(true);this.problem.set('');this.notice.set('');this.expected=expected;
  const current=()=>version===this.version&&key===this.sessionKey();let writeConfirmed=false;
  this.mutation=operation.pipe(switchMap(()=>{writeConfirmed=true;return this.pedidos.obtener(order.id);}),switchMap(confirmed=>{
   if(confirmed.restauranteId!==order.restauranteId||confirmed.clienteId!==order.clienteId||(expected==='cancel'?confirmed.estado!=='CANCELADO':!matchesAdjustment(confirmed,expected)))throw new Error('No se pudo confirmar el resultado de la operación.');
   return this.pagos.consultar(order.id,confirmed.total).pipe(map(payment=>({order:confirmed,payment})));
  })).subscribe({next:r=>{if(!current())return;this.orderValue.set(r.order);this.paymentValue.set(r.payment);this.busy.set(false);this.unresolved.delete(order.id);this.uncertain.set(false);this.expected=null;this.notice.set(expected==='cancel'?'Pedido cancelado. Se conserva su historial y su pago.':'Pedido actualizado. Total y pago consultados en el servidor.');},error:e=>{if(!current())return;this.busy.set(false);const knownRejection=e instanceof HttpErrorResponse&&e.status>=400&&e.status<500&&e.status!==408;const unknown=writeConfirmed||!knownRejection;this.uncertain.set(unknown);if(unknown)this.unresolved.set(order.id,expected);else this.expected=null;this.problem.set(unknown?'No pudimos confirmar el resultado. Consulta el pedido antes de intentar otra operación.':this.message(e));}});
 }
 verify():void {this.load(this.selected,this.needsCatalog);}
 allowRetryAfterReview():void {if(this.state()!=='ready'||!this.uncertain())return;if(this.selected!==null)this.unresolved.delete(this.selected);this.uncertain.set(false);this.expected=null;this.problem.set('');this.notice.set('Verificación manual confirmada. Revisa los datos actuales antes de enviar.');}
 private fail(error:unknown):void {this.orderValue.set(null);this.paymentValue.set(null);this.restaurant.set(null);this.dishes.set([]);this.tables.set([]);this.state.set('error');this.problem.set(this.message(error));}
 private message(error:unknown):string {if(error instanceof HttpErrorResponse){if(error.status===401)return 'La sesión ya no está vigente. Inicia sesión nuevamente.';if(error.status===403)return 'No tienes permiso para gestionar este pedido.';if(error.status===404)return 'No se encontró el pedido o su pago.';if([400,409].includes(error.status))return typeof error.error?.mensaje==='string'?error.error.mensaje:'El pedido cambió o no cumple las condiciones. Actualiza la consulta.';}return 'No pudimos consultar el pedido. Comprueba la conexión y vuelve a intentarlo.';}
}
