import {Injectable, effect, inject, signal} from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {CatalogoService} from '../../core/services/catalogo.service';
import type {RestauranteResponse} from '../../core/models/catalogo-api.model';

/** Identidad compartida del panel. Se limpia al cambiar de sesión. */
@Injectable({providedIn:'root'})
export class WorkspaceContext {
 private readonly auth=inject(AuthService);
 private readonly catalogo=inject(CatalogoService);
 readonly restaurant=signal<RestauranteResponse|null>(null);
 navigationScroll=0;
 constructor(){effect(onCleanup=>{
  const session=this.auth.session();this.restaurant.set(null);this.navigationScroll=0;
  const id=session?.restauranteId;
  if(!session||!id||!['DUENO','ADMINISTRADOR'].includes(session.role))return;
  const token=session.accessToken;
  const subscription=this.catalogo.restaurante(id).subscribe({next:r=>{if(this.auth.session()?.accessToken===token)this.restaurant.set(r);},error:()=>{}});
  onCleanup(()=>subscription.unsubscribe());
 });}
}
