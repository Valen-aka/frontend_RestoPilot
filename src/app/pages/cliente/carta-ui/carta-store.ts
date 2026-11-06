import {DestroyRef, Injectable, computed, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {forkJoin, of, Subscription} from 'rxjs';
import {API_SESSION, activeClientSession} from '../../../core/auth/api-session';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {CategoriaResponse, PlatoResponse, RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {CarritoStore} from '../carrito-ui/carrito-store';
import {validQuantity} from '../../../core/models/pedido-api.model';

export function cartaId(value:string|null):number|null {
  if(value===null)return null;
  return /^[1-9]\d*$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):NaN;
}
export function checkDish(p:PlatoResponse,restaurantId:number):PlatoResponse {
  if(!p||!Number.isSafeInteger(p.id)||p.id<=0||p.restauranteId!==restaurantId||!Number.isSafeInteger(p.categoriaId)||p.categoriaId<=0||
    typeof p.nombre!=='string'||!p.nombre.trim()||typeof p.precio!=='number'||!Number.isFinite(p.precio)||p.precio<0||typeof p.disponible!=='boolean'||
    ['descripcion','ingredientes','alergenos','imagenUrl'].some(k=>p[k as keyof PlatoResponse]!=null&&typeof p[k as keyof PlatoResponse]!=='string'))throw Error('Los datos del plato no son válidos.');
  return p;
}
@Injectable()
export class CartaStore {
  readonly session=inject(API_SESSION);
  readonly cart=inject(CarritoStore);
  private readonly api=inject(CatalogoService);
  private query?:Subscription;
  private selection?:Subscription;
  private generation=0;
  private key='';
  readonly state=signal<'loading'|'ready'|'error'>('loading');
  readonly problem=signal('');
  readonly selectionProblem=signal('');
  readonly busy=signal(false);
  readonly restaurants=signal<readonly RestauranteResponse[]>([]);
  readonly restaurant=signal<RestauranteResponse|null>(null);
  readonly dishes=signal<readonly PlatoResponse[]>([]);
  readonly categories=signal<readonly CategoriaResponse[]>([]);
  readonly dish=signal<PlatoResponse|null>(null);
  readonly hasSession=computed(()=>activeClientSession(this.session()));
  constructor(){inject(DestroyRef).onDestroy(()=>{this.generation++;this.query?.unsubscribe();this.selection?.unsubscribe();});}
  load(restaurantRaw:string|null,dishRaw:string|null,detail:boolean,force=false):void {
    const session=this.session(),key=[session?.accessToken??'',session?.role,restaurantRaw,dishRaw,detail].join('|');
    if(!force&&key===this.key)return;this.key=key;const generation=++this.generation;
    this.query?.unsubscribe();this.selection?.unsubscribe();this.busy.set(false);this.selectionProblem.set('');
    this.restaurant.set(null);this.dish.set(null);this.dishes.set([]);this.categories.set([]);this.restaurants.set([]);this.problem.set('');
    if(!activeClientSession(session)){this.fail('Inicia sesión como cliente para consultar la carta.');return;}
    const rid=cartaId(restaurantRaw),pid=cartaId(dishRaw);
    if(Number.isNaN(rid)||(detail&&(rid===null||pid===null||Number.isNaN(pid)))){this.fail('El restaurante o el plato de la URL no es válido.');return;}
    this.state.set('loading');
    this.query=forkJoin({restaurants:this.api.restaurantes(),restaurant:rid?this.api.restaurante(rid):of(null),
      dishes:rid&&!detail?this.api.platos(rid):of([] as readonly PlatoResponse[]),categories:rid?this.api.categorias(rid):of([] as readonly CategoriaResponse[]),
      dish:detail&&pid?this.api.obtenerPlato(pid):of(null)}).subscribe({next:data=>{
        if(generation!==this.generation)return;
        try {
          if(rid&&!data.restaurants.some(r=>r.id===rid))throw Error('No se encontró el restaurante seleccionado.');
          const dishes=data.dishes.map(p=>checkDish(p,rid!));const dish=data.dish?checkDish(data.dish,rid!):null;
          if(dish&&dish.id!==pid)throw Error('La respuesta no corresponde al plato solicitado.');
          this.restaurants.set(data.restaurants);this.restaurant.set(data.restaurant);this.dishes.set(dishes);this.categories.set(data.categories);this.dish.set(dish);this.state.set('ready');
        }catch {this.fail('La respuesta del restaurante no corresponde a esta consulta.');}
      },error:cause=>{if(generation===this.generation)this.fail(cause instanceof HttpErrorResponse&&cause.status===404?'No se encontró el plato o restaurante solicitado.':
        cause instanceof HttpErrorResponse&&[401,403].includes(cause.status)?'No tienes acceso a esta consulta. Inicia sesión como cliente.':'No pudimos consultar la carta. Puedes volver a intentarlo.');}});
  }
  private fail(message:string):void {this.problem.set(message);this.state.set('error');}
  add(quantity:number,notes:string,replace:boolean,onReady:()=>void):void {
    if(this.busy())return;this.selectionProblem.set('');const r=this.restaurant(),p=this.dish(),draft=this.cart.draft();
    if(!this.hasSession()||!r||!p||!p.disponible||!r.activo||!r.abierto||this.state()!=='ready'){this.selectionProblem.set('El plato o restaurante no está disponible para preparar un pedido.');return;}
    if(!validQuantity(quantity)||notes.length>255){this.selectionProblem.set('Revisa la cantidad y las notas del plato.');return;}
    if(draft&&draft.restaurantId!==r.id&&!replace){this.selectionProblem.set('Confirma si deseas reemplazar el carrito de otro restaurante.');return;}
    const previous=draft?.restaurantId===r.id?draft.lines:[];
    const same=previous.find(l=>l.id===p.id),amount=(same?.quantity??0)+quantity;
    if(!validQuantity(amount)){this.selectionProblem.set('La cantidad acumulada no es válida.');return;}
    const details=previous.filter(l=>l.id!==p.id).map(l=>({platoId:l.id,cantidad:l.quantity!,notas:l.notes??null}));
    details.push({platoId:p.id,cantidad:amount,notas:notes.trim()||same?.notes||null});
    const generation=this.generation;this.busy.set(true);
    this.selection=this.cart.prepareSelection(r.id,details).subscribe({next:()=>{if(generation===this.generation){this.busy.set(false);onReady();}},error:()=>{if(generation===this.generation){this.busy.set(false);this.selectionProblem.set(this.cart.error()||'No se pudo preparar la selección. Actualiza la carta antes de volver a intentarlo.');}}});
  }
}
