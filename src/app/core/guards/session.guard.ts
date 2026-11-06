import {RegistrationBusy} from '../services/registration-busy.service';
import {inject} from '@angular/core';
import {CanActivateChildFn, CanDeactivateFn, Router} from '@angular/router';
import {API_SESSION, activeOperationSession} from '../auth/api-session';
import {roleAllows} from '../models/auth-navigation.model';
export const sessionGuard:CanActivateChildFn=(_route,state)=>{
 const session=inject(API_SESSION)(),router=inject(Router);
 if(!session||!session.accessToken.trim()||session.expiresAt<=Date.now())return router.createUrlTree(['/auth/login'],{queryParams:{returnUrl:state.url}});
 const path=state.url.split(/[?#]/)[0];if(!roleAllows(session.role,path)||session.role!=='CLIENTE'&&!activeOperationSession(session))return router.createUrlTree(['/estado/403']);return true;
};

export const registrationPendingGuard:CanDeactivateFn<unknown>=(_component,route)=>{const busy=inject(RegistrationBusy).busy();return !busy||(route.routeConfig?.path==='administradores/nuevo'&&!inject(API_SESSION)());};
