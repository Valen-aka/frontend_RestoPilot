import {inject} from '@angular/core';
import {CanActivateFn, CanDeactivateFn, Router} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {API_SESSION, activeClientSession} from '../auth/api-session';
import {ReservaService} from '../services/reserva.service';
import {CarritoStore} from '../../pages/cliente/carrito-ui/carrito-store';
import {AtencionFisicaStore} from '../../pages/operacion/atencion-fisica-ui/atencion-fisica-store';
export const atencionPendingGuard:CanDeactivateFn<unknown>=()=>{const store=inject(AtencionFisicaStore);return !store.hasSession()||!store.busy();};
export const reservaFisicaGuard:CanActivateFn=(route,state)=>{
  const router=inject(Router);if(!activeClientSession(inject(API_SESSION)()))return router.createUrlTree(['/auth/login'],{queryParams:{returnUrl:state.url}});
  if(route.queryParamMap.get('vista')==='cliente-reservas-deshabilitadas')return true;
  const raw=route.queryParamMap.get('restauranteId');const restaurantId=raw===null?inject(CarritoStore).draft()?.restaurantId: /^[1-9]\d*$/.test(raw)?Number(raw):NaN;
  const blocked=()=>router.createUrlTree(['/cliente/reservar'],{queryParams:{vista:'cliente-reservas-deshabilitadas',restauranteId:raw??restaurantId??null}});
  if(!Number.isSafeInteger(restaurantId)||!restaurantId||restaurantId<1)return blocked();
  if(raw===null){const next=router.parseUrl(state.url);next.queryParams['restauranteId']=restaurantId;return next;}
  return inject(ReservaService).moduloRestaurante(restaurantId).pipe(map(status=>status.habilitado||blocked()),catchError(()=>of(blocked())));
};
