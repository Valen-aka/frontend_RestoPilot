import {Component, DestroyRef, ElementRef, computed, effect, inject, input, untracked} from '@angular/core';
import {toSignal, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CurrencyPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {TipoEntrega, validQuantity, PedidoRequest} from '../../../core/models/pedido-api.model';
import {OpPedidoCancelarDialog} from '../../../dialogs/op-pedido-cancelar/op-pedido-cancelar-dialog';
import {PedidoManagementStore} from './pedido-management.store';

const newLine=(platoId:number,cantidad:number,notas:string|null)=>new FormGroup({platoId:new FormControl(platoId,{nonNullable:true}),cantidad:new FormControl(cantidad,{nonNullable:true,validators:[Validators.required,c=>validQuantity(c.value)?null:{cantidad:true}]}),notas:new FormControl(notas??'',{nonNullable:true,validators:Validators.maxLength(255)})});
@Component({selector:'rp-pedido-management-view',imports:[RouterLink,ReactiveFormsModule,CurrencyPipe,MatButtonModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatProgressSpinnerModule,WorkspaceShell],templateUrl:'./pedido-management-view.html',styleUrl:'./pedido-management-view.css'})
export class PedidoManagementView {
 readonly mode=input<'edit'|'cancel'|'blocked'>('edit');readonly store=inject(PedidoManagementStore);private readonly route=inject(ActivatedRoute);private readonly dialog=inject(MatDialog);private readonly destroyRef=inject(DestroyRef);private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
 readonly form=new FormGroup({tipoEntrega:new FormControl<TipoEntrega>('RECOGER',{nonNullable:true}),mesaId:new FormControl<number|null>(null),direccionEntrega:new FormControl('',{nonNullable:true,validators:Validators.maxLength(255)}),detalles:new FormArray<ReturnType<typeof newLine>>([])},{validators:control=>{
  const v=control.getRawValue(),lines=v.detalles??[];if(!lines.length)return {empty:true};
  if(lines.some((line:{platoId:number})=>!this.store.dishes().some(p=>p.id===line.platoId&&p.disponible)))return {plato:true};
  if(v.tipoEntrega==='SALON'&&(!this.store.restaurant()?.tieneAtencionFisica||!this.store.tables().some(t=>t.id===v.mesaId&&t.activo)))return {mesa:true};
  if(v.tipoEntrega==='DELIVERY'&&(!this.store.restaurant()?.aceptaDelivery||!v.direccionEntrega?.trim()))return {delivery:true};return null;
 }});
 readonly selectedDish=new FormControl<number|null>(null);
 readonly formValue=toSignal(this.form.valueChanges,{initialValue:this.form.value});
 readonly estimated=computed(()=>{this.formValue();return this.form.controls.detalles.controls.reduce((sum,line)=>sum+(this.store.dishes().find(d=>d.id===line.controls.platoId.value)?.precio??0)*line.controls.cantidad.value,0);});
 readonly available=computed(()=>this.store.dishes().filter(d=>d.disponible));
 readonly modalities:readonly TipoEntrega[]=['SALON','DELIVERY','LLEVAR','RECOGER'];
 readonly labels:Record<TipoEntrega,string>={SALON:'Salón',DELIVERY:'Delivery',LLEVAR:'Para llevar',RECOGER:'Recoger'};
 constructor(){
  effect(()=>{const id=this.params().get('pedidoId'),needsCatalog=this.mode()!=='cancel';this.store.sessionKey();untracked(()=>this.store.load(id,needsCatalog));});
  effect(()=>{const order=this.store.order();untracked(()=>{if(!order)return;this.form.controls.detalles.clear({emitEvent:false});for(const line of order.detalles)this.form.controls.detalles.push(newLine(line.platoId,line.cantidad,line.notas),{emitEvent:false});this.form.patchValue({tipoEntrega:order.tipoEntrega,mesaId:order.mesaId,direccionEntrega:order.direccionEntrega??''});this.form.markAsPristine();this.form.markAsUntouched();});});
  effect(()=>{const disabled=!this.store.canMutate();untracked(()=>{if(disabled){this.form.disable({emitEvent:false});this.selectedDish.disable({emitEvent:false});}else{this.form.enable({emitEvent:false});this.selectedDish.enable({emitEvent:false});}});});
 }
 dishName(id:number):string{return this.store.dishes().find(d=>d.id===id)?.nombre??this.store.order()?.detalles.find(d=>d.platoId===id)?.nombrePlatoSnapshot??'Plato no disponible';}
 add():void {if(!this.store.canMutate())return;const id=this.selectedDish.value;if(!id||!this.available().some(p=>p.id===id))return;const existing=this.form.controls.detalles.controls.find(d=>d.controls.platoId.value===id);if(existing)existing.controls.cantidad.setValue(existing.controls.cantidad.value+1);else this.form.controls.detalles.push(newLine(id,1,null));this.selectedDish.reset();}
 remove(index:number):void {if(this.store.canMutate())this.form.controls.detalles.removeAt(index);}
 save():void {this.form.markAllAsTouched();this.form.updateValueAndValidity();if(this.form.invalid){this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid,textarea.ng-invalid,mat-select.ng-invalid')?.focus();return;}const order=this.store.order();if(!order||!this.store.canMutate())return;const v=this.form.getRawValue();const request:PedidoRequest={restauranteId:order.restauranteId,tipoEntrega:v.tipoEntrega,mesaId:v.tipoEntrega==='SALON'?v.mesaId:null,direccionEntrega:v.tipoEntrega==='DELIVERY'?v.direccionEntrega.trim():null,detalles:v.detalles.map(d=>({platoId:d.platoId,cantidad:d.cantidad,notas:d.notas.trim()||null}))};this.store.save(request);}
 confirm():void {const order=this.store.order();if(!order||!this.store.canMutate())return;const key=this.store.sessionKey();this.dialog.open(OpPedidoCancelarDialog,{data:{pedidoId:order.id},width:'30rem',maxWidth:'calc(100vw - 2rem)',autoFocus:'first-tabbable',restoreFocus:true,ariaLabelledBy:'cancel-order-title',ariaDescribedBy:'cancel-order-description'}).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok=>{if(ok===true&&key===this.store.sessionKey()&&order.id===this.store.order()?.id)this.store.cancel();});}
}
