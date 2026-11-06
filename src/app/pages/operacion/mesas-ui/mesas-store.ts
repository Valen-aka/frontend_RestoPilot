import {DestroyRef, Injectable, computed, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {concatMap, forkJoin, of, Observable, Subscription} from 'rxjs';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {ReservaService} from '../../../core/services/reserva.service';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {MesaResponse, RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {MesaContractError, MesaRequest, mesaRequestValid} from '../../../core/models/mesas.model';
import {ReservaResponse} from '../../../core/models/reserva-api.model';
export type MesasMode='map'|'list'|'new'|'edit'|'state'|'blocked';
@Injectable({providedIn:'root'})
export class MesasStore {
 readonly session=inject(API_SESSION);private readonly api=inject(CatalogoService);private readonly reservas=inject(ReservaService);
 private request?:Subscription;private associatedRequest?:Subscription;private generation=0;private owner='';private reservationGeneration=0;
 readonly mode=signal<MesasMode>('map');readonly rawId=signal<string|null>(null);
 readonly rows=signal<readonly MesaResponse[]>([]);readonly selected=signal<MesaResponse|null>(null);readonly restaurant=signal<RestauranteResponse|null>(null);
 readonly state=signal<'loading'|'ready'|'error'>('loading');readonly busy=signal(false);readonly uncertain=signal(false);readonly problem=signal('');readonly notice=signal('');
 readonly associated=signal<readonly ReservaResponse[]>([]);readonly associatedState=signal<'idle'|'loading'|'ready'|'error'>('idle');
 readonly hasSession=computed(()=>activeOperationSession(this.session()));
 readonly canWrite=computed(()=>this.hasSession()&&this.state()==='ready'&&!this.busy()&&!this.uncertain());
 constructor(){inject(DestroyRef).onDestroy(()=>{this.generation++;this.request?.unsubscribe();this.associatedRequest?.unsubscribe();});}
 load(mode:MesasMode,rawId:string|null):void {
  const session=this.session();if(this.busy()&&activeOperationSession(session)&&session.accessToken===this.owner)return;
  const generation=++this.generation;this.request?.unsubscribe();this.associatedRequest?.unsubscribe();this.reservationGeneration++;this.busy.set(false);this.problem.set('');
  if(this.owner!==(session?.accessToken??'')){this.notice.set('');this.uncertain.set(false);}this.owner=session?.accessToken??'';this.mode.set(mode);this.rawId.set(rawId);
  this.rows.set([]);this.selected.set(null);this.restaurant.set(null);this.associated.set([]);this.associatedState.set('idle');
  if(!activeOperationSession(session)){this.state.set('error');this.problem.set('Necesitas una sesión de dueño o administrador con restaurante asignado.');return;}
  const detail=['edit','state','blocked'].includes(mode);const id=rawId!==null&&/^[1-9]\d*$/.test(rawId)?Number(rawId):NaN;
  if(detail&&(!Number.isSafeInteger(id)||id<1)){this.state.set('error');this.problem.set('Selecciona una mesa mediante un ID válido. No se reutiliza otra mesa.');return;}
  this.state.set('loading');
  this.request=forkJoin({rows:this.api.mesasPropias(session.restauranteId),restaurant:this.api.restaurante(session.restauranteId),selected:detail?this.api.obtenerMesa(id,session.restauranteId):of(null)}).subscribe({next:data=>{
    if(generation!==this.generation)return;
    if(data.selected&&!data.rows.some(r=>r.id===data.selected!.id)){this.state.set('error');this.problem.set('La mesa no pertenece al listado de tu restaurante.');return;}
    this.rows.set(data.rows);this.restaurant.set(data.restaurant);this.selected.set(data.selected);this.state.set('ready');this.uncertain.set(false);if(mode==='blocked')this.consultReservations();
  },error:cause=>{if(generation!==this.generation)return;this.state.set('error');this.problem.set(this.readError(cause));}});
 }
 refresh():void {this.load(this.mode(),this.rawId());}
 save(datos:MesaRequest,onReady:()=>void):void {if(!this.canWrite()||!mesaRequestValid(datos)){this.problem.set('Revisa el número, capacidad y ambas coordenadas.');return;}this.write(this.mode()==='new'?'create':'edit',datos,undefined,onReady);}
 change(active:boolean,onReady:()=>void):void {if(!this.canWrite()||!this.selected()||this.selected()!.activo===active)return;this.write('state',undefined,active,onReady);}
 private write(kind:'create'|'edit'|'state',datos:MesaRequest|undefined,active:boolean|undefined,onReady:()=>void):void {
  const session=this.session(),selected=this.selected();if(!activeOperationSession(session)||(kind!=='create'&&(!selected||selected.restauranteId!==session.restauranteId)))return;
  const generation=++this.generation;this.request?.unsubscribe();this.busy.set(true);this.problem.set('');this.notice.set('');let started=false,confirmed=false,result:MesaResponse;
  const beforeWrite:Observable<RestauranteResponse|null>=kind==='create'?this.api.restaurante(session.restauranteId):of(null);
  this.request=beforeWrite.pipe(concatMap(restaurant=>{
    if(restaurant&&!restaurant.tieneAtencionFisica){this.restaurant.set(restaurant);throw new Error('La atención física está pausada. No se pueden registrar nuevas mesas.');}
    started=true;return kind==='create'?this.api.crearMesa(datos!,session.restauranteId):kind==='edit'?this.api.actualizarMesa(selected!.id,datos!,session.restauranteId):this.api.cambiarEstadoMesa(selected!.id,active!,session.restauranteId);
  }),concatMap(mesa=>{confirmed=true;result=mesa;return forkJoin({rows:this.api.mesasPropias(session.restauranteId),restaurant:this.api.restaurante(session.restauranteId)});})).subscribe({next:data=>{
    if(generation!==this.generation)return;const current=data.rows.find(r=>r.id===result.id);
    if(!current){this.busy.set(false);this.state.set('error');this.problem.set('El servidor confirmó el cambio, pero la mesa no aparece en la consulta actual. Actualiza el listado.');return;}
    this.rows.set(data.rows);this.restaurant.set(data.restaurant);this.selected.set(current);this.busy.set(false);this.state.set('ready');this.uncertain.set(false);
    this.notice.set(kind==='create'?'Mesa registrada. El listado está actualizado.':kind==='edit'?'Datos de la mesa guardados. El listado está actualizado.':current.activo===active?(active?'Mesa activada.':'Mesa desactivada. Se conserva su historial.'):'El estado cambió durante la actualización. Se muestra el estado actual.');onReady();
  },error:cause=>{
    if(generation!==this.generation)return;this.busy.set(false);const http=cause instanceof HttpErrorResponse?cause:null;
    const unknown=started&&!confirmed&&(!http||http.status===0||http.status>=500);this.uncertain.set(unknown);this.state.set(confirmed||unknown?'error':'ready');
    const business=http&&[400,409].includes(http.status)&&typeof http.error?.mensaje==='string'&&http.error.mensaje.length<=500?http.error.mensaje:'';
    this.problem.set(confirmed?'El servidor confirmó el cambio, pero no pudimos actualizar el listado. Vuelve a consultar antes de realizar otra operación.':unknown?'No pudimos confirmar el resultado. Consulta el listado antes de volver a enviar; la operación podría haberse registrado.':!started&&!http?(cause as Error).message:business||this.readError(cause));
    if(selected&&business.toLowerCase().includes('reserva'))this.consultReservations();
  }});
 }
 consultReservations():void {
  const selected=this.selected(),session=this.session();if(!selected||!activeOperationSession(session))return;
  this.associatedRequest?.unsubscribe();const generation=++this.reservationGeneration,owner=session.accessToken;this.associatedState.set('loading');this.associated.set([]);
  this.associatedRequest=this.reservas.restaurante().subscribe({next:data=>{if(generation!==this.reservationGeneration||owner!==this.session()?.accessToken)return;
    if(data.reservas.some(r=>r.restauranteId!==session.restauranteId)){this.associatedState.set('error');return;}
    this.associated.set(data.reservas.filter(r=>r.mesaId===selected.id&&['PENDIENTE','CONFIRMADA'].includes(r.estado)));this.associatedState.set('ready');
  },error:()=>{if(generation===this.reservationGeneration)this.associatedState.set('error');}});
 }
 private readError(cause:unknown):string {
  if(cause instanceof MesaContractError)return 'La respuesta de mesas no corresponde a esta consulta. Vuelve a consultar.';
  if(cause instanceof HttpErrorResponse){if(cause.status===404)return 'No se encontró la mesa solicitada.';if([401,403].includes(cause.status))return 'No tienes permiso para gestionar estas mesas.';}
  return 'No pudimos completar la consulta de mesas. Vuelve a intentarlo.';
 }
}
