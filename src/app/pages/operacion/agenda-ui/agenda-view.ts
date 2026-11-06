import {Component, DestroyRef, DOCUMENT, computed, effect, inject, input, untracked} from '@angular/core';
import {toSignal, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {AuthService} from '../../../core/services/auth.service';
import {AgendaMode, AgendaStore} from './agenda-store';
import {ReservaUpdate, agendaDate, agendaTime, availabilityKey, reservaEstados, validUpdate} from '../../../core/models/reserva-agenda.model';
import {OpReservaCancelarDialog} from '../../../dialogs/op-reserva-cancelar/op-reserva-cancelar-dialog';
@Component({selector:'rp-agenda-view',imports:[RouterLink,ReactiveFormsModule,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatTableModule,MatProgressSpinnerModule,WorkspaceShell],templateUrl:'./agenda-view.html',styleUrl:'./agenda-view.css'})
export class AgendaView {
 readonly mode=input<AgendaMode>('agenda');readonly store=inject(AgendaStore);readonly router=inject(Router);
 private readonly route=inject(ActivatedRoute);private readonly auth=inject(AuthService);private readonly document=inject(DOCUMENT);private readonly destroyRef=inject(DestroyRef);private readonly dialog=inject(MatDialog);private returnFocus=false;private dialogRef?:MatDialogRef<OpReservaCancelarDialog,string|false>;
 readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});readonly estados=reservaEstados;readonly columns=['id','cliente','fecha','mesa','comensales','estado','acciones'];
 readonly query=computed(()=>({fecha:this.params().get('fecha')||null,estado:this.params().get('estado')||null}));
 readonly filterForm=new FormGroup({fecha:new FormControl('',{nonNullable:true,validators:c=>!c.value||agendaDate(c.value)?null:{fecha:true}}),estado:new FormControl('',{nonNullable:true})});
 readonly editForm=new FormGroup({fecha:new FormControl('',{nonNullable:true,validators:[Validators.required,c=>agendaDate(c.value)?null:{fecha:true}]}),horaInicio:new FormControl('',{nonNullable:true,validators:[Validators.required,c=>agendaTime(c.value)?null:{hora:true}]}),horaFin:new FormControl('',{nonNullable:true,validators:[Validators.required,c=>agendaTime(c.value)?null:{hora:true}]}),numeroComensales:new FormControl<number|null>(null,[Validators.required,c=>Number.isInteger(c.value)&&c.value>0&&c.value<=2147483647?null:{entero:true}]),mesaId:new FormControl<number|null>(null,Validators.required),notas:new FormControl('',{nonNullable:true,validators:Validators.maxLength(500)})});
 readonly reason=new FormControl('',{nonNullable:true,validators:Validators.maxLength(300)});
 private readonly values=toSignal(this.editForm.valueChanges,{initialValue:this.editForm.getRawValue()});private formKey='';private availabilityInputs='';
 readonly request=computed<ReservaUpdate>(()=>{this.values();const f=this.editForm.getRawValue();return {mesaId:f.mesaId??0,restauranteId:this.store.selected()?.restauranteId??0,fecha:f.fecha,horaInicio:f.horaInicio,horaFin:f.horaFin,numeroComensales:f.numeroComensales??0,notas:f.notas||null};});
 readonly periodValid=computed(()=>validUpdate({...this.request(),mesaId:1}));
 readonly matchingAvailability=computed(()=>this.store.availabilityState()==='ready'&&this.store.checkedKey()===availabilityKey(this.request()));
 readonly canSave=computed(()=>{const r=this.request(),m=this.store.availability().find(m=>m.mesaId===r.mesaId);return this.store.canManage()&&validUpdate(r)&&this.matchingAvailability()&&!!m&&m.capacidad>=r.numeroComensales&&(m.disponible||m.mesaId===this.store.selected()?.mesaId);});
 readonly title=computed(()=>({agenda:'Las próximas mesas de tu servicio',detail:'Detalle de la reserva',edit:'Reprogramar una reserva',cancel:'Cancelar reserva'}[this.mode()]));
 constructor(){
  effect(()=>{const mode=this.mode(),params=this.params();this.store.session();untracked(()=>this.store.load(mode,params.has('reservaId')?params.get('reservaId'):params.get('id'),{fecha:params.get('fecha')||'',estado:params.get('estado')||''}));});
  effect(()=>{const mode=this.mode(),r=this.store.selected(),state=this.store.state(),token=this.store.session()?.accessToken,filters=this.store.filters();untracked(()=>{
   if(state!=='ready')return;if(mode==='agenda'){this.filterForm.reset(filters,{emitEvent:false});const id=this.document.defaultView?.history.state?.expiredReturnId;if(!this.returnFocus&&Number.isSafeInteger(id)){this.returnFocus=true;setTimeout(()=>{if(!this.destroyRef.destroyed)this.document.getElementById('expiry-row-'+id)?.focus();},0);}}
   if(this.document.defaultView?.history.state?.agendaFocus===true)setTimeout(()=>{if(!this.destroyRef.destroyed)this.document.getElementById('agenda-heading')?.focus();},0);
   const key=[token,mode,r?.id].join('|');if(mode==='edit'&&r&&key!==this.formKey){this.formKey=key;this.availabilityInputs='';this.editForm.reset({fecha:r.fecha,horaInicio:r.horaInicio,horaFin:r.horaFin,numeroComensales:r.numeroComensales,mesaId:r.mesaId,notas:r.notas||''});}
  });});
  this.editForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(()=>{const r=this.requestFromForm(),key=availabilityKey(r);if(this.availabilityInputs&&key!==this.availabilityInputs){this.store.invalidateAvailability();this.editForm.controls.mesaId.setValue(null,{emitEvent:false});}this.availabilityInputs=key;});
  effect(()=>{const busy=this.store.busy();untracked(()=>busy?this.editForm.disable({emitEvent:false}):this.editForm.enable({emitEvent:false}));});
  effect(()=>{const token=this.store.session()?.accessToken;untracked(()=>{if(this.dialogRef&&this.dialogToken!==token)this.dialogRef.close(false);});});
  this.destroyRef.onDestroy(()=>this.dialogRef?.close(false));
 }
 private dialogToken?:string;
 private requestFromForm():ReservaUpdate {const f=this.editForm.getRawValue();return {mesaId:f.mesaId??0,restauranteId:this.store.selected()?.restauranteId??0,fecha:f.fecha,horaInicio:f.horaInicio,horaFin:f.horaFin,numeroComensales:f.numeroComensales??0,notas:f.notas||null};}
 applyFilters(clear=false):void {if(clear)this.filterForm.reset({fecha:'',estado:''});this.filterForm.markAllAsTouched();if(this.filterForm.invalid)return;const f=this.filterForm.getRawValue();void this.router.navigate(['/operacion/reservas'],{queryParams:{fecha:f.fecha||null,estado:f.estado||null}});}
 checkAvailability():void {this.editForm.markAllAsTouched();if(this.periodValid())this.store.checkAvailability(this.request());}
 save():void {this.editForm.markAllAsTouched();if(this.canSave())this.store.save(this.request(),()=>this.backToDetail());}
 backToDetail():void {const id=this.store.selected()?.id;if(id)void this.router.navigate(['/operacion/reserva'],{queryParams:{...this.query(),reservaId:id},state:{agendaFocus:true}});}
 cancel():void {const r=this.store.selected();if(!r||!this.store.canManage()||this.dialogRef)return;this.dialogToken=this.store.session()?.accessToken;
  this.dialogRef=this.dialog.open(OpReservaCancelarDialog,{data:r,width:'32rem',maxWidth:'calc(100vw - 2rem)',autoFocus:'first-tabbable',restoreFocus:true,ariaLabel:'Cancelar reserva #'+r.id});
  this.dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(reason=>{this.dialogRef=undefined;if(typeof reason==='string'&&this.dialogToken===this.store.session()?.accessToken)this.store.cancel(reason,()=>this.backToDetail());});
 }
 evaluate(estado:'CONFIRMADA'|'RECHAZADA'):void {if(this.reason.invalid)return;this.store.evaluate(estado,this.reason.value,()=>this.backToDetail());}
 logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
}
