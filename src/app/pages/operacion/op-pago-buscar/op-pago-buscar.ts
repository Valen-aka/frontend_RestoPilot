import {PreviewOperation} from '../../../components/preview-operation/preview-operation';
import {PreviewPanel} from '../../../components/preview-operation/preview-panel';
import {OperationalPreviewStore} from '../operational-preview/operational-preview-store';
import {Component, ElementRef, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({selector:'rp-op-pago-buscar',imports:[PreviewPanel,WorkspaceShell,ReactiveFormsModule,RouterLink,MatInputModule,MatButtonModule],templateUrl:'./op-pago-buscar.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./op-pago-buscar.css']})
export class OpPagoBuscarPage {
 readonly form=new FormGroup({numero:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.pattern(/^\s*#?\d{1,10}\s*$/)]})});
 readonly store=inject(OperationalPreviewStore);
 readonly preview=new PreviewOperation();
 readonly searched=signal(false);
 readonly match=signal(false);
 private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 search(){
  if(this.preview.busy())return;
  this.form.markAllAsTouched();this.searched.set(false);this.match.set(false);
  if(this.form.invalid){this.host.nativeElement.querySelector<HTMLInputElement>('#numero-pedido')?.focus();return;}
  this.preview.run(result=>{this.match.set(result==='success'&&this.form.controls.numero.value.trim().replace(/^#/,'')==='1042');this.searched.set(result==='success'||result==='empty');});
 }
}
