import {DestroyRef, Injectable, computed, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {concatMap, forkJoin, map, Observable, of, Subscription} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {ReservaService} from '../../../core/services/reserva.service';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {ReservaResponse, ReservaContractError, parseReservaId} from '../../../core/models/reserva-api.model';
import {MesaDisponible} from '../../../core/models/reserva-query.model';
import {AgendaFilters, ReservaUpdate, availabilityKey, canManageReserva, ownReserva, validFilters, validUpdate} from '../../../core/models/reserva-agenda.model';
export type AgendaMode='agenda'|'detail'|'edit'|'cancel';
@Injectable({providedIn:'root'})
export class AgendaStore {
 readonly session=inject(API_SESSION);private readonly api=inject(ReservaService);private readonly catalog=inject(CatalogoService);
 private request?:Subscription;private availabilityRequest?:Subscription;private generation=0;private availabilityGeneration=0;private owner='';
 readonly mode=signal<AgendaMode>('agenda');readonly rawId=signal<string|null>(null);readonly filters=signal<AgendaFilters>({fecha:'',estado:''});
 readonly restaurant=signal<RestauranteResponse|null>(null);readonly rows=signal<readonly ReservaResponse[]>([]);readonly selected=signal<ReservaResponse|null>(null);
 readonly state=signal<'loading'|'ready'|'error'>('loading');readonly busy=signal(false);readonly uncertain=signal(false);readonly problem=signal('');readonly notice=signal('');
 readonly availability=signal<readonly MesaDisponible[]>([]);readonly availabilityState=signal<'idle'|'loading'|'ready'|'error'>('idle');readonly availabilityProblem=signal('');readonly checkedKey=signal('');
 readonly hasSession=computed(()=>activeOperationSession(this.session()));
 readonly canWrite=computed(()=>this.hasSession()&&this.owner===this.session()?.accessToken&&this.state()==='ready'&&!this.busy()&&!this.uncertain());
 readonly canManage=computed(()=>this.canWrite()&&canManageReserva(this.selected()));
 constructor(){inject(DestroyRef).onDestroy(()=>{this.generation++;this.request?.unsubscribe();this.availabilityRequest?.unsubscribe();});}
 load(mode:AgendaMode,rawId:string|null,filters:AgendaFilters):void {
  const session=this.session();if(this.busy()&&activeOperationSession(session)&&session.accessToken===this.owner)return;
  const generation=++this.generation;this.request?.unsubscribe();this.invalidateAvailability();this.busy.set(false);this.problem.set('');
  if(this.owner!==(session?.accessToken??''))this.notice.set('');this.owner=session?.accessToken??'';this.mode.set(mode);this.rawId.set(rawId);this.filters.set(filters);this.rows.set([]);this.selected.set(null);this.restaurant.set(null);this.uncertain.set(false);
  if(!activeOperationSession(session)){this.state.set('error');this.problem.set('Necesitas una sesión de dueño o administrador con restaurante asignado.');return;}
  const id=parseReservaId(rawId);if(mode!=='agenda'&&!id){this.state.set('error');this.problem.set('Selecciona una reserva con un ID válido. No se reutiliza otra reserva.');return;}
  if(!validFilters(filters)){this.state.set('error');this.problem.set('La fecha o el estado del filtro no son válidos.');return;}
  this.state.set('loading');
  this.request=forkJoin({restaurant:this.catalog.restaurante(session.restauranteId),list:mode==='agenda'?this.api.agenda(filters,session.restauranteId):of(null),selected:mode!=='agenda'&&id?this.api.obtener(id).pipe(map(r=>ownReserva(r,id,session.restauranteId))):of(null)}).subscribe({next:data=>{
   if(generation!==this.generation)return;this.restaurant.set(data.restaurant);this.rows.set(data.list?.reservas??[]);this.selected.set(data.selected);this.state.set('ready');
  },error:cause=>{if(generation!==this.generation)return;this.state.set('error');this.problem.set(this.errorMessage(cause));}});
 }
 refresh():void {this.load(this.mode(),this.rawId(),this.filters());}
 invalidateAvailability():void {this.availabilityGeneration++;this.availabilityRequest?.unsubscribe();this.availability.set([]);this.checkedKey.set('');this.availabilityState.set('idle');this.availabilityProblem.set('');}
 checkAvailability(request:ReservaUpdate):void {
  const session=this.session();if(!activeOperationSession(session)||!this.canManage()||!validUpdate({...request,mesaId:request.mesaId||1})||request.restauranteId!==session.restauranteId)return;
  this.invalidateAvailability();const generation=this.availabilityGeneration;this.availabilityState.set('loading');
  this.availabilityRequest=this.api.disponibilidadPara(request).subscribe({next:data=>{if(generation!==this.availabilityGeneration||this.owner!==this.session()?.accessToken)return;this.availability.set(data.mesas);this.checkedKey.set(availabilityKey(request));this.availabilityState.set('ready');},error:cause=>{if(generation!==this.availabilityGeneration)return;this.availabilityState.set('error');this.availabilityProblem.set(this.errorMessage(cause));}});
 }
 save(request:ReservaUpdate,onReady:()=>void):void {
  const selected=this.selected();if(!this.canManage()||!selected||!validUpdate(request)||request.restauranteId!==selected.restauranteId||this.availabilityState()!=='ready'||this.checkedKey()!==availabilityKey(request))return;
  const table=this.availability().find(m=>m.mesaId===request.mesaId);if(!table||table.capacidad<request.numeroComensales||!table.disponible&&table.mesaId!==selected.mesaId)return;
  this.mutate(this.api.reprogramar(selected,request),'Reserva reprogramada. Está pendiente de una nueva evaluación.',onReady);
 }
 cancel(reason:string,onReady:()=>void):void {const r=this.selected();if(!this.canManage()||!r||reason.length>300)return;this.mutate(this.api.cancelarAdministrativa(r,reason),'Reserva cancelada. Se conserva su historial.',onReady);}
 evaluate(estado:'CONFIRMADA'|'RECHAZADA',reason:string,onReady:()=>void):void {const r=this.selected();if(!this.canWrite()||!r||r.estado!=='PENDIENTE'||r.llegadaRegistradaEn||reason.length>300||estado==='RECHAZADA'&&!reason.trim())return;this.mutate(this.api.evaluarAdministrativa(r,estado,estado==='RECHAZADA'?reason.trim():null),estado==='CONFIRMADA'?'Reserva confirmada.':'Reserva rechazada.',onReady);}
 private mutate(operation:Observable<ReservaResponse>,notice:string,onReady:()=>void):void {
  const session=this.session(),selected=this.selected();if(!activeOperationSession(session)||!selected)return;
  const generation=++this.generation;this.request?.unsubscribe();this.invalidateAvailability();this.busy.set(true);this.problem.set('');this.notice.set('');let confirmed=false;
  this.request=operation.pipe(concatMap(result=>{confirmed=true;return forkJoin({selected:this.api.obtener(result.id).pipe(map(r=>ownReserva(r,result.id,session.restauranteId))),list:this.api.agenda(this.filters(),session.restauranteId)});})).subscribe({next:data=>{
    if(generation!==this.generation)return;this.selected.set(data.selected);this.rows.set(data.list.reservas);this.busy.set(false);this.state.set('ready');this.notice.set(notice);onReady();
  },error:cause=>{
    if(generation!==this.generation)return;const http=cause instanceof HttpErrorResponse?cause:null;
    if(http&&[401,403,404].includes(http.status)){this.busy.set(false);this.selected.set(null);this.rows.set([]);this.state.set('error');this.problem.set(this.errorMessage(cause));return;}
    if(!confirmed&&http&&[400,409].includes(http.status)){
      const business=this.errorMessage(cause);this.request=this.api.obtener(selected.id).pipe(map(r=>ownReserva(r,selected.id,session.restauranteId))).subscribe({next:r=>{if(generation!==this.generation)return;this.selected.set(r);this.busy.set(false);this.state.set('ready');this.problem.set(business+' Situación actual: '+r.estado+'.');},error:()=>{if(generation!==this.generation)return;this.busy.set(false);this.uncertain.set(true);this.state.set('error');this.problem.set(business+' No pudimos comprobar la situación actual. Vuelve a consultar antes de enviar.');}});return;
    }
    this.busy.set(false);this.uncertain.set(true);this.state.set('error');this.problem.set(confirmed?'El servidor confirmó el cambio, pero no pudimos actualizar la consulta. Revisa la situación actual antes de enviar otra operación.':'No pudimos confirmar el resultado. Consulta la situación actual antes de volver a enviar; la operación podría haberse registrado.');
  }});
 }
 private errorMessage(cause:unknown):string {
  if(cause instanceof ReservaContractError)return 'La respuesta de reservas no corresponde a esta consulta.';
  if(cause instanceof HttpErrorResponse){if([401,403].includes(cause.status))return 'No tienes permiso para consultar o gestionar esta reserva.';if(cause.status===404)return 'No se encontró la reserva solicitada.';if([400,409].includes(cause.status)&&typeof cause.error?.mensaje==='string'&&cause.error.mensaje.length<=600)return cause.error.mensaje;}
  return 'No pudimos completar la consulta. Vuelve a intentarlo.';
 }
}
