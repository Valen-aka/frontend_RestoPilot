import {Component, ElementRef, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({selector:'rp-op-pago-buscar',imports:[WorkspaceShell,ReactiveFormsModule,RouterLink,MatInputModule,MatButtonModule],templateUrl:'./op-pago-buscar.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./op-pago-buscar.css']})
export class OpPagoBuscarPage {
 readonly form=new FormGroup({numero:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.pattern(/^\s*#?\d{1,10}\s*$/)]})});
 readonly searched=signal(false);
 readonly match=signal(false);
 private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 search(){
  this.form.markAllAsTouched();this.searched.set(false);this.match.set(false);
  if(this.form.invalid){this.host.nativeElement.querySelector<HTMLInputElement>('#numero-pedido')?.focus();return;}
  this.match.set(this.form.controls.numero.value.trim().replace(/^#/,'')==='1042');this.searched.set(true);
 }
}
