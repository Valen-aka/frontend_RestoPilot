import {Component, DestroyRef, ElementRef, effect, inject, input, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {EstadoPago, MetodoPago} from '../../../core/models/pago-api.model';
import {PagosStore, paymentId} from './pagos-store';

@Component({selector:'rp-pagos-view',imports:[RouterLink,ReactiveFormsModule,DatePipe,MatButtonModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatProgressSpinnerModule,WorkspaceShell],templateUrl:'./pagos-view.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./pagos-view.css']})
export class PagosView {
  readonly mode=input<'search'|'form'|'detail'>('search');
  readonly store=inject(PagosStore);
  private readonly route=inject(ActivatedRoute);
  private readonly router=inject(Router);
  private readonly destroyRef=inject(DestroyRef);
  private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
  readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
  readonly methods:ReadonlyArray<{value:MetodoPago;label:string}>=[{value:'YAPE',label:'Yape'},{value:'PLIN',label:'Plin'},{value:'TARJETA',label:'Tarjeta'},{value:'EFECTIVO',label:'Efectivo'}];
  readonly searchForm=new FormGroup({numero:new FormControl('',{nonNullable:true,validators:[Validators.required,c=>Number.isSafeInteger(paymentId(c.value.trim().replace(/^#/,'')))?null:{id:true}]})});
  readonly form=new FormGroup({
    monto:new FormControl<number|null>(null,{validators:[Validators.required,Validators.min(.01),c=>c.value!==null&&(!Number.isFinite(c.value)||Math.abs(c.value*100-Math.round(c.value*100))>1e-6||c.value!==this.store.order()?.total)?{monto:true}:null]}),
    metodo:new FormControl<MetodoPago>('YAPE',{nonNullable:true,validators:[Validators.required,c=>this.methods.some(m=>m.value===c.value)?null:{metodo:true}]}),
    referencia:new FormControl('',{nonNullable:true,validators:Validators.maxLength(100)}),
    estado:new FormControl<EstadoPago>('PAGADO',{nonNullable:true,validators:[Validators.required,c=>['PENDIENTE','PAGADO'].includes(c.value)?null:{estado:true}]})
  },{validators:c=>c.value.estado==='PAGADO'&&c.value.metodo!=='EFECTIVO'&&!c.value.referencia?.trim()?{referencia:true}:null});
  constructor(){
    effect(()=>{const id=paymentId(this.params().get('pedidoId'));untracked(()=>{this.searchForm.controls.numero.setValue(id&&Number.isFinite(id)?String(id):'');this.store.load(id);});});
    effect(()=>{const order=this.store.order();untracked(()=>{if(order){const p=this.store.payment();this.form.reset({monto:order.total,metodo:p?.metodo??'YAPE',referencia:p?.codigoReferencia??'',estado:'PAGADO'});}});});
    effect(()=>{const saving=this.store.savingId()!==null;untracked(()=>{if(saving)this.form.disable({emitEvent:false});else this.form.enable({emitEvent:false});});});
  }
  get id():number|null{return paymentId(this.params().get('pedidoId'));}
  get canSubmit():boolean{return this.store.state()==='ready'&&!!this.store.order()&&!this.store.locked()&&this.store.savingId()===null&&!this.store.isUncertain(this.id);}
  get needsReference():boolean{return this.form.controls.estado.value==='PAGADO'&&this.form.controls.metodo.value!=='EFECTIVO';}
  money(value:number):string{return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(value);}
  methodLabel(value:MetodoPago|null):string{return this.methods.find(m=>m.value===value)?.label??'Sin elegir';}
  search():void {
    this.searchForm.markAllAsTouched();if(this.searchForm.invalid){this.host.nativeElement.querySelector<HTMLInputElement>('#numero-pedido')?.focus();return;}
    const id=paymentId(this.searchForm.controls.numero.value.trim().replace(/^#/,''));
    if(id===this.id)this.store.load(id);else void this.router.navigate(['/operacion/pagos'],{queryParams:{pedidoId:id}});
  }
  reload(reconcile=false):void {this.store.load(this.id,reconcile);}
  submit():void {
    if(!this.canSubmit)return;
    this.form.controls.monto.updateValueAndValidity();this.form.markAllAsTouched();
    if(this.form.invalid){this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid,mat-select.ng-invalid')?.focus();return;}
    const value=this.form.getRawValue(),id=this.id;
    this.store.submit({monto:value.monto!,metodo:value.metodo,codigoReferencia:value.referencia.trim()||null,estado:value.estado},()=>{
      if(!this.destroyRef.destroyed&&this.id===id)void this.router.navigate(['/operacion/pago/registrar'],{queryParams:{pedidoId:id,vista:'op-pago-confirmado'}});
    });
  }
}
