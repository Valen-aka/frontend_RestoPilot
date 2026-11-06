import {Component, DestroyRef, DOCUMENT, computed, effect, inject, input, untracked} from '@angular/core';
import {toSignal, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {AuthService} from '../../../core/services/auth.service';
import {MesaRequest, mesaInteger, mesaRequestValid} from '../../../core/models/mesas.model';
import {MesasMode, MesasStore} from './mesas-store';
import {PlanoMesas} from './plano-mesas';
import {OpMesaDesactivarDialog} from '../../../dialogs/op-mesa-desactivar/op-mesa-desactivar-dialog';
@Component({selector:'rp-mesas-view',imports:[RouterLink,ReactiveFormsModule,MatButtonModule,MatFormFieldModule,MatInputModule,MatCardModule,MatTableModule,MatProgressSpinnerModule,WorkspaceShell,PlanoMesas],templateUrl:'./mesas-view.html',styleUrl:'./mesas-view.css'})
export class MesasView {
 readonly mode=input<MesasMode>('map');readonly store=inject(MesasStore);readonly router=inject(Router);
 private readonly route=inject(ActivatedRoute);private readonly destroyRef=inject(DestroyRef);private readonly document=inject(DOCUMENT);private readonly dialog=inject(MatDialog);private readonly auth=inject(AuthService);
 readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
 readonly columns=['numero','capacidad','ubicacion','estado','acciones'];private formKey='';private focusRestored=false;
 readonly form=new FormGroup({numero:new FormControl<number|null>(null,[Validators.required,c=>mesaInteger(c.value)?null:{entero:true}]),capacidad:new FormControl<number|null>(null,[Validators.required,c=>mesaInteger(c.value)?null:{entero:true}]),coordenadaX:new FormControl<number|null>(null,[Validators.required,c=>typeof c.value==='number'&&Number.isFinite(c.value)?null:{finita:true}]),coordenadaY:new FormControl<number|null>(null,[Validators.required,c=>typeof c.value==='number'&&Number.isFinite(c.value)?null:{finita:true}])});
 private readonly values=toSignal(this.form.valueChanges,{initialValue:this.form.getRawValue()});
 readonly preview=computed(()=>{this.values();const value=this.form.getRawValue() as MesaRequest;return mesaRequestValid(value)?value:null;});
 readonly title=computed(()=>({map:'Un lugar para cada encuentro',list:'Todas las mesas de tu restaurante',new:'Una nueva mesa en el salón',edit:'Editar mesa',state:'Estado de la mesa',blocked:'Restricciones de la mesa'}[this.mode()]));
 constructor(){effect(()=>{const mode=this.mode(),params=this.params();this.store.session();untracked(()=>this.store.load(mode,params.has('mesaId')?params.get('mesaId'):params.get('id')));});
 effect(()=>{const state=this.store.state(),mode=this.mode(),selected=this.store.selected(),token=this.store.session()?.accessToken;untracked(()=>{
   const key=[token,mode,selected?.id].join('|');if(state==='ready'&&['new','edit'].includes(mode)&&key!==this.formKey){this.formKey=key;this.form.reset(mode==='edit'&&selected?{numero:selected.numero,capacidad:selected.capacidad,coordenadaX:selected.coordenadaX,coordenadaY:selected.coordenadaY}:{numero:null,capacidad:null,coordenadaX:null,coordenadaY:null});}
   if(state==='ready'&&mode==='list'&&!this.focusRestored){const id=this.document.defaultView?.history.state?.focusMesaId;if(Number.isSafeInteger(id))setTimeout(()=>{if(this.destroyRef.destroyed)return;const el=this.document.getElementById('mesa-state-'+id);el?.focus({preventScroll:true});this.focusRestored=!!el;},0);}
 });});
 effect(()=>{const busy=this.store.busy();untracked(()=>busy?this.form.disable({emitEvent:false}):this.form.enable({emitEvent:false}));});
 }
 save():void {this.form.markAllAsTouched();if(this.form.invalid||!this.store.canWrite())return;this.store.save(this.form.getRawValue() as MesaRequest,()=>void this.router.navigate(['/operacion/mesas/lista']));}
 changeState():void {const mesa=this.store.selected();if(!mesa||!this.store.canWrite())return;
   if(!mesa.activo){this.store.change(true,()=>this.returnToList(mesa.id));return;}
   this.dialog.open(OpMesaDesactivarDialog,{data:mesa,width:'30rem',maxWidth:'calc(100vw - 2rem)',autoFocus:'first-tabbable',restoreFocus:true,ariaLabel:'Confirmar desactivación de Mesa '+mesa.numero}).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok=>{if(ok===true)this.store.change(false,()=>this.returnToList(mesa.id));});
 }
 private returnToList(id:number):void {void this.router.navigate(['/operacion/mesas/lista'],{state:{focusMesaId:id}});}
 logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
}
