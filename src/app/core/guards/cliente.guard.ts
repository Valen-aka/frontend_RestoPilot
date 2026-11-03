import {inject} from '@angular/core';
import {CanActivateChildFn, Router} from '@angular/router';
import {API_SESSION, activeClientSession} from '../auth/api-session';

export const clienteGuard: CanActivateChildFn = (_route, state) => {
  return activeClientSession(inject(API_SESSION)()) || inject(Router).createUrlTree(['/auth/login'],
    {queryParams: {returnUrl: state.url}});
};
