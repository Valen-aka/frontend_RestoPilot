import {roleAllows} from '../models/auth-navigation.model';
import {Injectable, effect, inject, untracked} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
@Injectable({providedIn:'root'})
export class SessionBoundary {
 private readonly auth=inject(AuthService);private readonly router=inject(Router);private hadSession=false;
 constructor(){effect(()=>{const session=this.auth.session();untracked(()=>{const old=this.hadSession;this.hadSession=!!session;if(session&&/^\/(cliente|operacion|dueno)(?:[/?#]|$)/.test(this.router.url)&&!roleAllows(session.role,this.router.url.split(/[?#]/)[0])){void this.router.navigate(['/estado/403']);return;}if(old&&!session&&/^\/(cliente|operacion|dueno)(?:[/?#]|$)/.test(this.router.url)){const reason=this.auth.endedBy(),url=this.router.url;void this.router.navigate(['/auth/login'],{queryParams:reason==='manual'?{}:{motivo:'sesion-expirada',returnUrl:url}});}});});}
}
