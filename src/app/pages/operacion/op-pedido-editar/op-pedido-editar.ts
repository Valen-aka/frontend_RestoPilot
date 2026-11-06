import {OperationalPreviewStore} from '../operational-preview/operational-preview-store';
import {Component, ElementRef, inject, signal} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

const wholeQuantity:ValidatorFn = control => Number.isInteger(control.value) ? null : {integer: true};

@Component({selector:'rp-op-pedido-editar',imports:[WorkspaceShell,ReactiveFormsModule,RouterLink,CurrencyPipe,MatButtonModule,MatInputModule,MatSelectModule,MatTableModule],templateUrl:'./op-pedido-editar.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./op-pedido-editar.css']})
export class OpPedidoEditarPage {
 readonly store=inject(OperationalPreviewStore);
 readonly columns=['plato','cantidad','precio','subtotal','acciones'];
 readonly form=new FormGroup({
  lomo:new FormControl(this.store.items().find(item=>item.key==='lomo')?.quantity ?? 0,{nonNullable:true,validators:[Validators.required,Validators.min(0),Validators.max(99),wholeQuantity]}),
  aji:new FormControl(this.store.items().find(item=>item.key==='aji')?.quantity ?? 0,{nonNullable:true,validators:[Validators.required,Validators.min(0),Validators.max(99),wholeQuantity]}),
  modalidad:new FormControl(this.store.modalidad(),{nonNullable:true,validators:[Validators.required]}),
  mesa:new FormControl(this.store.mesa(),{nonNullable:true,validators:[Validators.maxLength(30)]}),
  direccion:new FormControl(this.store.direccion(),{nonNullable:true,validators:[Validators.maxLength(255)]})
 },{validators:control=>{
  const value=control.value;
  if(!(Number(value.lomo)>0 || Number(value.aji)>0)) return {emptyOrder:true};
  if(value.modalidad==='SALON'&&!value.mesa?.trim()) return {tableRequired:true};
  if(value.modalidad==='DELIVERY'&&!value.direccion?.trim()) return {addressRequired:true};
  return null;
 }});
 readonly notice=signal('');
 readonly submitted=signal(false);
 private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 get items(){return [
  {key:'lomo' as const,name:'Lomo saltado',quantity:this.form.controls.lomo.value,price:38},
  {key:'aji' as const,name:'Ají de gallina',quantity:this.form.controls.aji.value,price:28}
 ].filter(item=>item.quantity>0);}
 get total(){return this.items.reduce((sum,item)=>sum+item.quantity*item.price,0);}
 remove(key:'lomo'|'aji'){if(this.store.blocked())return;this.form.controls[key].setValue(0);this.notice.set('');}
 save(){
  if(this.store.blocked()){this.notice.set('Este pedido ya no puede modificarse.');return;}
  this.submitted.set(true);this.form.markAllAsTouched();this.notice.set('');
  if(this.form.invalid){this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid')?.focus();return;}
  const v=this.form.getRawValue(), items=this.items.map(item=>({...item}));
  if(this.store.adjust(items,v.modalidad,v.mesa,v.direccion)){this.notice.set('Los cambios se guardaron correctamente.');}
 }
}
