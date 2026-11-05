import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, CanDeactivateFn, Router} from '@angular/router';
import {API_SESSION} from '../auth/api-session';
import {ReservaAtencionStore} from '../../pages/operacion/reserva-atencion-ui/reserva-atencion-store';
const attention=(route:ActivatedRouteSnapshot)=>route.routeConfig?.path!=='reserva'||route.queryParamMap.get('vista')==='op-reserva-completada';
export const reservaAtencionGuard:CanActivateFn=(route,state)=>{
  if(!attention(route))return true;
  const s=inject(API_SESSION)();
  return s&&s.accessToken.trim()&&s.expiresAt>Date.now()?true:inject(Router).createUrlTree(['/auth/login'],{queryParams:{returnUrl:state.url}});
};
export const reservaPendingGuard:CanDeactivateFn<unknown>=(_component,route)=>{
  if(!attention(route))return true;
  const store=inject(ReservaAtencionStore);return !store.hasSession()||!store.busy();
};
