import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {API_SESSION} from '../auth/api-session';
export const reservaConsultaGuard:CanActivateFn=(route,state)=>{
  if(route.routeConfig?.path==='reserva'&&!['cliente-reserva-expirada','cliente-reserva-completada','op-reserva-expirada'].includes(route.queryParamMap.get('vista')||''))return true;
  const s=inject(API_SESSION)();
  return s&&s.accessToken.trim()&&s.expiresAt>Date.now()?true:inject(Router).createUrlTree(['/auth/login'],{queryParams:{returnUrl:state.url}});
};
