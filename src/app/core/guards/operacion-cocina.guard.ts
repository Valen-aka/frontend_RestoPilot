import {CocinaStore} from '../../pages/operacion/cocina-ui/cocina-store';
import {inject} from '@angular/core';
import {CanActivateFn, CanDeactivateFn, Router} from '@angular/router';
import {API_SESSION} from '../auth/api-session';

export const operacionCocinaGuard: CanActivateFn = (_route, state) => {
  const session=inject(API_SESSION)();
  if(!session || !session.accessToken.trim() || session.expiresAt<=Date.now()) {
    return inject(Router).createUrlTree(['/auth/login'], {queryParams:{returnUrl:state.url}});
  }
  // La vista explica el acceso restringido sin consultar datos para otros roles/local ausente.
  return true;
};

export const cocinaPendingGuard:CanDeactivateFn<unknown>=()=>{
  const store=inject(CocinaStore);return !store.hasSession()||!store.actionBusy();
};
