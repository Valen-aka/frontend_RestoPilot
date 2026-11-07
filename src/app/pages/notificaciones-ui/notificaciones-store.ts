import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {API_SESSION} from '../../core/auth/api-session';
import {Notificacion} from '../../core/models/notificacion-api.model';
import {NotificacionService} from '../../core/services/notificacion.service';

@Injectable()
export class NotificacionesStore {
  private readonly session=inject(API_SESSION);
  private readonly service=inject(NotificacionService);
  private request?:Subscription;
  private generation=0;
  private readonly owner=signal('');
  private readonly identity=computed(()=>{const s=this.session();return s?s.subject+':'+s.accessToken:'';});
  private readonly messageValues=signal<readonly Notificacion[]>([]);
  private readonly totalValue=signal(0);
  readonly state=signal<'loading'|'ready'|'empty'|'error'|'unauthenticated'|'forbidden'|'not-found'>('loading');
  readonly messages=computed(()=>this.owner()===this.identity()?this.messageValues():[]);
  readonly total=computed(()=>this.owner()===this.identity()?this.totalValue():0);
  readonly page=signal(0);
  readonly size=signal(5);
  readonly problem=signal('');
  constructor(){
    effect(()=>{this.session();untracked(()=>this.load(0));});
    inject(DestroyRef).onDestroy(()=>{this.generation++;this.request?.unsubscribe();});
  }
  load(page=this.page(),size=this.size()):void {
    if(!Number.isSafeInteger(page)||page<0||![5,10,20].includes(size))return;
    this.request?.unsubscribe();const generation=++this.generation;
    this.messageValues.set([]);this.totalValue.set(0);this.owner.set(this.identity());this.problem.set('');this.page.set(page);this.size.set(size);
    const session=this.session();
    if(!session||!session.accessToken.trim()||session.expiresAt<=Date.now()||!['CLIENTE','ADMINISTRADOR','DUENO'].includes(session.role)){
      this.state.set('unauthenticated');return;
    }
    this.state.set('loading');
    const current=()=>generation===this.generation&&session.accessToken===this.session()?.accessToken&&session.subject===this.session()?.subject;
    this.request=this.service.consultar(session.subject,page,size).subscribe({
      next:result=>{
        if(!current())return;
        if(result.totalElements>0&&page>=result.totalPages){this.load(0,size);return;}
        this.messageValues.set(result.content);this.totalValue.set(result.totalElements);
        this.state.set(result.totalElements?'ready':'empty');
      },
      error:error=>{
        if(!current())return;
        const status=error instanceof HttpErrorResponse?error.status:null;
        this.state.set(status===401?'unauthenticated':status===403?'forbidden':status===404?'not-found':'error');
        this.problem.set(status===0?'No pudimos conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.':'No pudimos consultar tus notificaciones. Vuelve a intentarlo.');
      }
    });
  }
}
