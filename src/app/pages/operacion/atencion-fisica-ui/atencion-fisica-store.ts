import {DestroyRef, Injectable, computed, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {concatMap, Subscription} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {AtencionFisicaResponse} from '../../../core/models/atencion-fisica.model';
import {ReservaService} from '../../../core/services/reserva.service';
@Injectable({providedIn:'root'})
export class AtencionFisicaStore {
  readonly session=inject(API_SESSION);private readonly api=inject(ReservaService);
  private request?:Subscription;private generation=0;private owner='';
  readonly data=signal<AtencionFisicaResponse|null>(null);
  readonly state=signal<'loading'|'ready'|'error'>('loading');readonly busy=signal(false);readonly uncertain=signal(false);
  readonly problem=signal('');readonly notice=signal('');readonly hasSession=computed(()=>activeOperationSession(this.session()));
  readonly canChange=computed(()=>this.hasSession()&&this.state()==='ready'&&!!this.data()&&!this.busy()&&!this.uncertain());
  constructor(){inject(DestroyRef).onDestroy(()=>{this.generation++;this.request?.unsubscribe();});}
  load():void {
    const session=this.session();if(this.busy()&&activeOperationSession(session)&&this.owner===session.accessToken)return;
    const generation=++this.generation;this.request?.unsubscribe();this.busy.set(false);this.problem.set('');
    const owner=session?.accessToken??'';if(owner!==this.owner){this.data.set(null);this.notice.set('');this.uncertain.set(false);}this.owner=owner;
    if(!activeOperationSession(session)){this.state.set('error');this.data.set(null);this.problem.set('Necesitas una sesión de dueño o administrador con restaurante asignado.');return;}
    this.state.set('loading');
    this.request=this.api.moduloPropio(session.restauranteId).subscribe({next:data=>{if(generation!==this.generation)return;this.data.set(data);this.uncertain.set(false);this.state.set('ready');},error:cause=>{if(generation!==this.generation)return;this.state.set('error');this.problem.set(cause instanceof HttpErrorResponse&&[401,403].includes(cause.status)?'No tienes permiso para consultar esta configuración.':'No pudimos consultar la configuración. Vuelve a intentarlo.');}});
  }
  change(enabled:boolean,onReady:()=>void):void {
    const session=this.session(),before=this.data();if(!this.canChange()||!activeOperationSession(session)||!before||before.restauranteId!==session.restauranteId||before.habilitado===enabled)return;
    const generation=++this.generation;this.request?.unsubscribe();this.busy.set(true);this.problem.set('');this.notice.set('');let confirmed=false;
    this.request=this.api.cambiarModulo(enabled,session.restauranteId).pipe(concatMap(data=>{confirmed=true;if(generation===this.generation)this.data.set(data);return this.api.moduloPropio(session.restauranteId);})).subscribe({next:data=>{
      if(generation!==this.generation)return;this.data.set(data);this.busy.set(false);this.state.set('ready');this.uncertain.set(false);
      this.notice.set(data.habilitado===enabled?(enabled?'Atención física habilitada.':'Atención física pausada. Las reservas anteriores se conservan.'):'La configuración cambió durante la actualización. Se muestra el estado actual.');onReady();
    },error:cause=>{if(generation!==this.generation)return;this.busy.set(false);
      const http=cause instanceof HttpErrorResponse?cause:null;const unknown=!confirmed&&(!http||http.status===0||http.status>=500);
      this.uncertain.set(unknown);this.state.set(confirmed||unknown?'error':'ready');
      this.problem.set(confirmed?'El servidor confirmó el cambio, pero no pudimos actualizar la consulta. Consulta el estado actual.':unknown?'No pudimos confirmar el resultado del cambio. Consulta el estado actual antes de volver a enviarlo.':http?.status===403?'No tienes permiso para cambiar esta configuración.':'El servidor rechazó el cambio. La configuración no se modificó.');
    }});
  }
}
