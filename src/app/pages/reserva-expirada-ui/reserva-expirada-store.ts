import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {API_SESSION, activeClientSession, activeOperationSession} from '../../core/auth/api-session';
import {ReservaService} from '../../core/services/reserva.service';
import {ReservaResponse, readReserva} from '../../core/models/reserva-api.model';
import {readReservaList, readReservaDisponibilidad} from '../../core/models/reserva-query.model';
import {ExpiryContext} from './reserva-expirada.model';
import {expiryReservation} from './reserva-expirada-api.adapter';

@Injectable({providedIn:'root'})
export class ReservaExpiradaStore {
  private readonly session=inject(API_SESSION);
  private readonly api=inject(ReservaService);
  private readonly context=signal<ExpiryContext>('client');
  private readonly owner=signal('');
  private readonly listValue=signal<readonly ReservaResponse[]>([]);
  private readonly detailValue=signal<ReservaResponse|null>(null);
  private readonly state=signal<'loading'|'ready'|'error'|'stale'>('loading');
  private request?:Subscription;
  private availabilityRequest?:Subscription;
  private version=0;
  private availabilityVersion=0;
  private availabilityRequested=false;
  private mode:'history'|'detail'='history';
  private selectedId?:number;
  readonly sessionKey=computed(()=>{const s=this.session();return s?s.subject+':'+s.role+':'+s.restauranteId+':'+s.accessToken:'';});
  readonly hasSession=computed(()=>this.context()==='client'?activeClientSession(this.session()):activeOperationSession(this.session()));
  private readonly key=computed(()=>this.hasSession()?this.context()+':'+this.sessionKey():'');
  private readonly owned=computed(()=>!!this.key()&&this.owner()===this.key());
  readonly rows=computed(()=>this.owned()?this.listValue().map(expiryReservation):[]);
  readonly rawSelected=computed(()=>this.owned()?this.detailValue():null);
  readonly selected=computed(()=>{const r=this.rawSelected();return r?expiryReservation(r):undefined;});
  readonly queryState=computed(()=>this.hasSession()?this.state():'error');
  readonly issue=signal('');
  readonly problem=computed(()=>!this.hasSession()?'Acceso restringido. Inicia sesión con el perfil correspondiente a esta consulta.':this.state()==='error'?this.issue():'');
  readonly refreshing=signal(false);
  readonly restaurantName=computed(()=>this.rawSelected()?.restauranteNombre||this.rows()[0]?.restaurant||'Restaurante de la sesión');
  readonly restaurantId=computed(()=>{const s=this.session();return activeOperationSession(s)?s.restauranteId:null;});
  readonly availabilityState=signal<'idle'|'loading'|'ready'|'error'>('idle');
  private readonly availableValue=signal<boolean|null>(null);
  readonly available=computed(()=>this.owned()?this.availableValue():null);
  readonly availabilityIssue=signal('');

  constructor(){
    effect(()=>{const key=this.key();untracked(()=>{if(key!==this.owner())this.clear();});});
    inject(DestroyRef).onDestroy(()=>this.clear());
  }
  private resetAvailability():void {
    this.availabilityVersion++;this.availabilityRequest?.unsubscribe();this.availableValue.set(null);
    this.availabilityState.set('idle');this.availabilityIssue.set('');
  }
  private clear():void {
    this.version++;this.request?.unsubscribe();this.resetAvailability();this.availabilityRequested=false;
    this.owner.set('');this.listValue.set([]);this.detailValue.set(null);this.state.set('loading');this.refreshing.set(false);this.issue.set('');
  }
  private authorize(r:ReservaResponse):void {
    const s=this.session();
    if(this.context()==='client'?(!activeClientSession(s)||String(r.clienteId)!==s.subject):
      (!activeOperationSession(s)||r.restauranteId!==s.restauranteId))throw new HttpErrorResponse({status:403});
  }
  load(context:ExpiryContext,mode:'history'|'detail',id?:number):void {
    const repeatAvailability=this.context()===context&&this.mode===mode&&this.selectedId===id&&this.availabilityRequested;
    this.context.set(context);this.mode=mode;this.selectedId=id;this.resetAvailability();this.availabilityRequested=repeatAvailability;
    if(!this.hasSession()){this.clear();return;}
    const key=this.key(),version=++this.version;
    const keep=this.owner()===key&&(mode==='history'?this.listValue().length>0:this.detailValue()?.id===id);
    this.request?.unsubscribe();this.owner.set(key);this.issue.set('');
    if(!keep){this.listValue.set([]);this.detailValue.set(null);}
    if(mode==='detail'&&(!Number.isSafeInteger(id)||!id||id<1)){
      this.detailValue.set(null);this.state.set('error');this.issue.set('Selecciona una reserva válida para consultarla.');this.refreshing.set(false);return;
    }
    this.state.set(keep?'ready':'loading');this.refreshing.set(true);
    const current=()=>version===this.version&&key===this.key();
    if(mode==='history'){
      const request=context==='client'?this.api.propias():this.api.restaurante();
      this.request=request.subscribe({next:value=>{
        if(!current())return;
        try{const result=readReservaList(value);result.reservas.forEach(r=>this.authorize(r));this.listValue.set(result.reservas);this.detailValue.set(null);this.state.set('ready');this.refreshing.set(false);}
        catch(error){this.fail(error,false);}
      },error:error=>{if(current())this.fail(error,keep);}});
    }else{
      this.request=this.api.obtener(id!).subscribe({next:value=>{
        if(!current())return;
        try{const result=readReserva(value,id!);this.authorize(result);this.detailValue.set(result);this.state.set('ready');this.refreshing.set(false);
          if(repeatAvailability&&result.estado==='EXPIRADA')this.consultAvailability();
        }catch(error){this.fail(error,false);}
      },error:error=>{if(current())this.fail(error,keep);}});
    }
  }
  refresh():void {if(!this.refreshing())this.load(this.context(),this.mode,this.selectedId);}
  private fail(error:unknown,keep:boolean):void {
    const status=error instanceof HttpErrorResponse?error.status:0,restricted=[400,401,403,404].includes(status);
    if(restricted||!keep){this.listValue.set([]);this.detailValue.set(null);}
    this.resetAvailability();this.state.set(keep&&!restricted?'stale':'error');this.refreshing.set(false);
    this.issue.set(status===401?'La sesión expiró. Inicia sesión nuevamente.':status===403?'No tienes acceso a estas reservas.':
      [400,404].includes(status)?'La reserva no está disponible para esta consulta.':'No pudimos completar la consulta. Puedes volver a intentarlo.');
  }
  consultAvailability():void {
    const reservation=this.rawSelected();
    if(!reservation||reservation.estado!=='EXPIRADA'||this.queryState()!=='ready'||this.refreshing()||this.availabilityState()==='loading')return;
    this.availabilityRequested=true;const version=++this.availabilityVersion,key=this.key(),id=reservation.id;
    this.availabilityRequest?.unsubscribe();this.availableValue.set(null);this.availabilityIssue.set('');this.availabilityState.set('loading');
    const current=()=>version===this.availabilityVersion&&key===this.key()&&this.rawSelected()?.id===id;
    this.availabilityRequest=this.api.disponibilidad(reservation).subscribe({next:value=>{
      if(!current())return;
      try{
        const result=readReservaDisponibilidad(value),mesa=result.mesas.find(m=>m.mesaId===reservation.mesaId);
        if(!mesa||mesa.capacidad<reservation.numeroComensales)throw new Error('Mesa no disponible en la consulta');
        this.availableValue.set(mesa.disponible);this.availabilityState.set('ready');
      }catch{this.availabilityFailed();}
    },error:()=>{if(current())this.availabilityFailed();}});
  }
  private availabilityFailed():void {
    this.availableValue.set(null);this.availabilityState.set('error');
    this.availabilityIssue.set('No pudimos verificar la disponibilidad de esta mesa. Puedes volver a consultarla.');
  }
}
