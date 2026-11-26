import {Injectable, effect, inject, signal} from '@angular/core';
import {API_SESSION} from '../../core/auth/api-session';
import {CatalogoService} from '../../core/services/catalogo.service';
import type {RestauranteResponse} from '../../core/models/catalogo-api.model';

/** Identidad compartida del panel. Se limpia al cambiar de sesión. */
@Injectable({providedIn:'root'})
export class WorkspaceContext {
 private readonly session=inject(API_SESSION);
 private readonly catalogo=inject(CatalogoService);
 readonly state=signal<'idle'|'loading'|'ready'|'error'>('idle');
 private readonly revision=signal(0);
 reload():void{this.revision.update(value=>value+1);}
 readonly restaurant=signal<RestauranteResponse|null>(null);
 navigationScroll=0;
 constructor(){effect(onCleanup=>{
  const session=this.session();this.revision();this.restaurant.set(null);this.state.set('idle');this.navigationScroll=0;
  const id=session?.restauranteId;
  if(!session||!id||!['DUENO','ADMINISTRADOR'].includes(session.role))return;
  const token=session.accessToken;this.state.set('loading');
  const subscription=this.catalogo.restaurante(id).subscribe({next:r=>{if(this.session()?.accessToken===token){if(r.id!==id){this.state.set('error');return;}this.restaurant.set(r);this.state.set('ready');}},error:()=>{if(this.session()?.accessToken===token)this.state.set('error');}});
  onCleanup(()=>subscription.unsubscribe());
 });}
}
