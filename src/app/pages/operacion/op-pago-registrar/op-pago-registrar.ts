import {OperationalPreviewStore} from '../operational-preview/operational-preview-store';
import {Component, ElementRef, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({selector:'rp-op-pago-registrar',imports:[WorkspaceShell,ReactiveFormsModule,RouterLink,MatInputModule,MatButtonModule],templateUrl:'./op-pago-registrar.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./op-pago-registrar.css']})
export class OpPagoRegistrarPage {
 readonly store=inject(OperationalPreviewStore);
 get total(){return this.store.total();}
 readonly methods=['Yape','Plin','Efectivo','Tarjeta'];
 readonly form=new FormGroup({
  monto:new FormControl<number|null>(null,{validators:[Validators.required,Validators.min(0.01),control=>control.value!==null && Number(control.value)!==this.total?{total:true}:null]}),
  metodo:new FormControl('Yape',{nonNullable:true,validators:[Validators.required,control=>['Yape','Plin','Efectivo','Tarjeta'].includes(control.value)?null:{metodo:true}]}),
  referencia:new FormControl('',{nonNullable:true,validators:[Validators.maxLength(100)]}),
 },{validators:control=>control.value.metodo!=='Efectivo' && !control.value.referencia?.trim()?{referencia:true}:null});
 readonly notice=signal('');
 private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 get referenceInvalid(){return this.form.controls.referencia.touched && (this.form.hasError('referencia') || this.form.controls.referencia.invalid);}
 submit(){
  if(this.store.estado()==='CANCELADO'||this.store.payment().estado==='PAGADO'){this.notice.set('Este pedido ya está cancelado o tiene un pago registrado.');return;}
  this.form.controls.monto.updateValueAndValidity();
  this.form.updateValueAndValidity();
  this.notice.set('');this.form.markAllAsTouched();
  if(this.form.invalid){
   const invalid=this.host.nativeElement.querySelector<HTMLInputElement>('input.ng-invalid,select.ng-invalid');
   if(invalid)invalid.focus();else if(this.form.hasError('referencia'))this.host.nativeElement.querySelector<HTMLInputElement>('#pago-referencia')?.focus();
   return;
  }
  this.store.pay(this.form.controls.metodo.value,this.form.controls.referencia.value.trim(),'PAGADO');
 }
}
