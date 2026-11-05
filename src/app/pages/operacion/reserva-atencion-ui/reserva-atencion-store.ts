import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {ReservaService} from '../../../core/services/reserva.service';
import {ReservaResponse, readReserva} from '../../../core/models/reserva-api.model';
import {AttendanceAction, AttendanceCommand, AttendanceResult, reservationVersion} from './reserva-atencion.model';
import {attendanceReservation} from './reserva-atencion-api.adapter';

@Injectable({providedIn:'root'})
export class ReservaAtencionStore {
  private readonly session=inject(API_SESSION);
  private readonly api=inject(ReservaService);
  private readonly value=signal<ReservaResponse|null>(null);
  private readonly owner=signal('');
  private readonly state=signal<'ready'|'loading'|'error'|'stale'>('loading');
  private readRequest?:Subscription;
  private mutation?:Subscription;
  private readVersion=0;
  private actionVersion=0;
  private resolveAction?: (result:AttendanceResult)=>void;
  readonly sessionKey=computed(()=>{const s=this.session();return activeOperationSession(s)?s.subject+':'+s.restauranteId+':'+s.accessToken:'';});
  readonly hasSession=computed(()=>!!this.sessionKey());
  readonly selectedId=signal<number|undefined>(undefined);
  readonly current=computed(()=>this.sessionKey()&&this.owner()===this.sessionKey()&&this.value()?.id===this.selectedId()?this.value():null);
  readonly selected=computed(()=>{const r=this.current();return r?attendanceReservation(r):undefined;});
  readonly now=computed(()=>{const time=this.current()?.fechaHoraServidor;return time?time+'-05:00':undefined;});
  readonly restaurantName=computed(()=>this.current()?.restauranteNombre||'Restaurante de la sesión');
  readonly restaurantId=computed(()=>{const s=this.session();return activeOperationSession(s)?s.restauranteId:null;});
  readonly queryState=computed(()=>this.hasSession()?this.state():'error');
  readonly issue=signal('');
  readonly problem=computed(()=>!this.hasSession()?'Acceso restringido. Necesitas una sesión de dueño o administrador con restaurante asignado.':this.state()==='error'?this.issue():'');
  readonly refreshing=signal(false);
  readonly busy=signal(false);
  readonly verificationId=signal<number|null>(null);
  readonly feedback=signal<{kind:'success'|'error';id:number;text:string}|undefined>(undefined);

  constructor(){
    effect(()=>{const key=this.sessionKey();untracked(()=>{if(key!==this.owner())this.clear();});});
    inject(DestroyRef).onDestroy(()=>this.clear());
  }
  private clear():void {
    this.readVersion++;this.actionVersion++;this.readRequest?.unsubscribe();this.mutation?.unsubscribe();
    this.resolveAction?.({ok:false,reservations:[],reason:'La sesión cambió.'});this.resolveAction=undefined;
    this.value.set(null);this.owner.set('');this.feedback.set(undefined);this.verificationId.set(null);
    this.busy.set(false);this.refreshing.set(false);this.issue.set('');this.state.set('loading');
  }
  load(id:number|undefined):void {
    this.selectedId.set(id);
    const session=this.session();if(!activeOperationSession(session)){this.clear();return;}
    const key=this.sessionKey(),version=++this.readVersion;
    const keep=this.owner()===key&&this.value()?.id===id;
    this.readRequest?.unsubscribe();this.owner.set(key);this.issue.set('');if(!keep)this.value.set(null);
    if(!Number.isSafeInteger(id)||!id||id<1){this.state.set('error');this.issue.set('Selecciona una reserva válida para consultarla.');this.refreshing.set(false);return;}
    this.state.set(keep?'ready':'loading');this.refreshing.set(true);
    const current=()=>version===this.readVersion&&key===this.sessionKey();
    this.readRequest=this.api.obtener(id).subscribe({next:value=>{
      if(!current())return;
      try{this.accept(value,id);this.state.set('ready');this.refreshing.set(false);}catch(error){this.fail(error,false);}
    },error:error=>{if(current())this.fail(error,keep);}});
  }
  private accept(value:ReservaResponse,id:number):ReservaResponse {
    const reservation=readReserva(value,id),session=this.session();
    if(!activeOperationSession(session)||reservation.restauranteId!==session.restauranteId)throw new HttpErrorResponse({status:403});
    if(this.selectedId()===id)this.value.set(reservation);
    return reservation;
  }
  refresh():void {
    if(this.busy()||this.refreshing())return;
    if(this.verificationId()!==null){this.verifyPending();return;}
    this.load(this.selectedId());
  }
  actionProblem(action:AttendanceAction):string {
    const r=this.current();if(!r)return 'Consulta la reserva antes de realizar una acción.';
    if(r.estado!=='CONFIRMADA')return 'Esta reserva no admite cambios de atención.';
    if(r.fechaHoraServidor==null||typeof r.puedeRegistrarLlegada!=='boolean'||typeof r.puedeCompletar!=='boolean')return 'No pudimos verificar si esta acción está disponible. Actualiza la reserva.';
    if(action==='arrival')return r.llegadaRegistradaEn?'La llegada ya está registrada.':r.puedeRegistrarLlegada?'':'La llegada no está disponible. Actualiza la reserva para consultar su situación.';
    return !r.llegadaRegistradaEn?'Registra la llegada antes de completar la atención.':r.puedeCompletar?'':'La atención todavía no puede completarse. Actualiza la reserva cuando corresponda.';
  }
  private fail(error:unknown,keep:boolean):void {
    const status=error instanceof HttpErrorResponse?error.status:0,restricted=[400,401,403,404].includes(status);
    if(restricted||!keep)this.value.set(null);
    if(restricted)this.feedback.set(undefined);
    this.state.set(keep&&!restricted?'stale':'error');this.refreshing.set(false);
    this.issue.set(status===400?'La reserva no está disponible para esta consulta.':status===401?'La sesión expiró. Inicia sesión nuevamente.':status===403?'No tienes acceso a las reservas de este restaurante.':status===404?'La reserva no está disponible.':'No pudimos completar la consulta. Puedes volver a intentarlo.');
  }
  private finish(result:AttendanceResult):void {
    const resolve=this.resolveAction;this.resolveAction=undefined;this.busy.set(false);resolve?.(result);
  }
  apply(command:AttendanceCommand):Promise<AttendanceResult> {
    const original=this.current(),reservation=this.selected();
    if(!['arrival','complete'].includes(command.action)||this.resolveAction||!this.hasSession()||this.refreshing()||this.verificationId()!==null||this.queryState()!=='ready'||
      !original||!reservation||command.id!==original.id||command.expectedVersion!==reservationVersion(reservation)||this.actionProblem(command.action)){
      const reason='La acción ya no está disponible. Consulta la reserva antes de continuar.';
      if(!this.resolveAction){this.busy.set(false);this.feedback.set({id:command.id,kind:'error',text:reason});}
      return Promise.resolve({ok:false,reservations:[],reason});
    }
    const version=++this.actionVersion,key=this.sessionKey();this.busy.set(true);this.feedback.set(undefined);
    const current=()=>version===this.actionVersion&&key===this.sessionKey();
    return new Promise(resolve=>{
      this.resolveAction=resolve;
      const request=command.action==='arrival'?this.api.registrarLlegada(command.id):this.api.completar(command.id);
      this.mutation=request.subscribe({next:value=>{
        if(!current())return;
        try{
          const updated=readReserva(value,command.id);
          if(command.action==='arrival'?(updated.estado!=='CONFIRMADA'||!updated.llegadaRegistradaEn||updated.completadaEn!==null):
            (updated.estado!=='COMPLETADA'||!updated.completadaEn||updated.llegadaRegistradaEn!==original.llegadaRegistradaEn))throw new Error('Confirmación incompatible');
          this.accept(updated,command.id);
          this.feedback.set({id:command.id,kind:'success',text:command.action==='arrival'?'Llegada registrada. La reserva continúa Confirmada.':'Atención completada. La finalización quedó registrada.'});
          this.finish({ok:true,reservations:[attendanceReservation(updated)],reservation:attendanceReservation(updated)});
        }catch(error){
          if(error instanceof HttpErrorResponse&&error.status===403){this.fail(error,false);this.finish({ok:false,reservations:[],reason:this.issue()});return;}
          this.verify(command.id,version,key,'No pudimos verificar la confirmación del cambio.');
        }
      },error:error=>{
        if(!current())return;
        const status=error instanceof HttpErrorResponse?error.status:0;
        if([401,403,404].includes(status)){this.fail(error,false);this.finish({ok:false,reservations:[],reason:this.issue()});return;}
        this.verify(command.id,version,key,[400,409].includes(status)?'El servidor rechazó la operación. Se consultará la situación actual.':'El resultado del cambio es incierto. No repitas la operación hasta verificarlo.');
      }});
    });
  }
  private verify(id:number,version:number,key:string,message:string):void {
    this.verificationId.set(id);this.feedback.set({id,kind:'error',text:message});
    const current=()=>version===this.actionVersion&&key===this.sessionKey();
    this.mutation=this.api.obtener(id).subscribe({next:value=>{
      if(!current())return;
      try{
        const updated=this.accept(value,id);this.verificationId.set(null);this.issue.set('');this.state.set('ready');
        this.feedback.set({id,kind:'error',text:message+' Situación consultada: '+attendanceReservation(updated).status+(updated.llegadaRegistradaEn?', con llegada registrada.':'.')});
        this.finish({ok:false,reservations:[attendanceReservation(updated)],reason:message});
      }catch(error){this.verificationFailed(id,message,error);}
    },error:error=>{if(current())this.verificationFailed(id,message,error);}});
  }
  private verificationFailed(id:number,message:string,error:unknown):void {
    if(error instanceof HttpErrorResponse&&[400,401,403,404].includes(error.status)){
      this.fail(error,false);this.verificationId.set(null);
    }else{
      this.feedback.set({id,kind:'error',text:message+' La consulta también falló. Usa «Verificar situación» antes de otra acción.'});
    }
    this.finish({ok:false,reservations:[],reason:'El resultado sigue sin verificar.'});
  }
  verifyPending():void {
    const id=this.verificationId();if(id===null||this.busy()||!this.hasSession())return;
    this.busy.set(true);this.verify(id,++this.actionVersion,this.sessionKey(),'Se volvió a consultar el resultado de la operación.');
  }
}
