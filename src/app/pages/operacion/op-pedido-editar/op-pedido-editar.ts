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
 readonly columns=['plato','cantidad','precio','subtotal','acciones'];
 readonly form=new FormGroup({
  lomo:new FormControl(1,{nonNullable:true,validators:[Validators.required,Validators.min(0),Validators.max(99),wholeQuantity]}),
  aji:new FormControl(1,{nonNullable:true,validators:[Validators.required,Validators.min(0),Validators.max(99),wholeQuantity]}),
  modalidad:new FormControl('RECOGER',{nonNullable:true,validators:[Validators.required]}),
  mesa:new FormControl('Mesa 04',{nonNullable:true,validators:[Validators.maxLength(30)]}),
  direccion:new FormControl('',{nonNullable:true,validators:[Validators.maxLength(255)]})
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
 remove(key:'lomo'|'aji'){this.form.controls[key].setValue(0);this.notice.set('Plato retirado de la vista previa. El pedido original no se ha modificado.');}
 save(){
  this.submitted.set(true);this.form.markAllAsTouched();this.notice.set('');
  if(this.form.invalid){this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid')?.focus();return;}
  this.notice.set('Vista previa actualizada. No se guardaron cambios en el pedido: el servicio aún no está conectado.');
 }
}
