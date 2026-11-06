import {Component, computed, effect, inject, input, untracked} from '@angular/core';
import {toSignal, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DestroyRef} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatChipsModule} from '@angular/material/chips';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {AuthService} from '../../../core/services/auth.service';
import {CartaStore, cartaId} from './carta-store';
import {PlatoImagen} from './plato-imagen';
import {CambioRestauranteDialog} from './cambio-restaurante-dialog';
import {validQuantity} from '../../../core/models/pedido-api.model';

@Component({selector:'rp-carta-view',providers:[CartaStore],imports:[RouterLink,ReactiveFormsModule,MatButtonModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatChipsModule,MatCardModule,MatProgressSpinnerModule,WorkspaceShell,PlatoImagen],templateUrl:'./carta-view.html',styleUrl:'./carta-view.css'})
export class CartaView {
  readonly mode=input<'list'|'detail'>('list');readonly store=inject(CartaStore);readonly router=inject(Router);
  private readonly route=inject(ActivatedRoute);private readonly destroyRef=inject(DestroyRef);private readonly dialog=inject(MatDialog);private readonly auth=inject(AuthService);
  readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
  readonly category=computed(()=>cartaId(this.params().get('categoriaId')));
  readonly rows=computed(()=>this.store.dishes().filter(p=>this.category()===null||p.categoriaId===this.category()));
  readonly categoryInvalid=computed(()=>this.category()!==null&&(Number.isNaN(this.category())||!this.store.categories().some(c=>c.id===this.category())));
  readonly query=computed(()=>({restauranteId:this.store.restaurant()?.id??this.params().get('restauranteId'),categoriaId:this.params().get('categoriaId')}));
  readonly canAdd=computed(()=>this.store.hasSession()&&this.store.state()==='ready'&&!!this.store.dish()?.disponible&&!!this.store.restaurant()?.activo&&!!this.store.restaurant()?.abierto&&!this.store.busy());
  readonly form=new FormGroup({cantidad:new FormControl(1,{nonNullable:true,validators:[Validators.required,Validators.min(1),c=>validQuantity(c.value)?null:{entera:true}]}),notas:new FormControl('',{nonNullable:true,validators:[Validators.maxLength(255)]})});
  constructor(){effect(()=>{const p=this.params(),mode=this.mode();this.store.session();untracked(()=>{this.form.reset({cantidad:1,notas:''});this.store.load(p.get('restauranteId'),p.get('platoId'),mode==='detail');});});}
  money(value:number):string{return new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(value);}
  refresh():void {const p=this.params();this.store.load(p.get('restauranteId'),p.get('platoId'),this.mode()==='detail',true);}
  chooseRestaurant(id:number):void {void this.router.navigate(['/cliente/carta'],{queryParams:{restauranteId:id}});}
  chooseCategory(id:number|null):void {void this.router.navigate(['/cliente/carta'],{queryParams:{restauranteId:this.store.restaurant()?.id,categoriaId:id}});}
  logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
  add():void {
    this.form.markAllAsTouched();if(this.form.invalid||!this.canAdd())return;
    const draft=this.store.cart.draft(),rid=this.store.restaurant()?.id;
    if(draft&&draft.restaurantId!==rid){this.dialog.open(CambioRestauranteDialog,{maxWidth:'calc(100vw - 2rem)',width:'28rem',restoreFocus:true}).afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok=>{if(ok===true)this.confirmAdd(true);});}
    else this.confirmAdd(false);
  }
  private confirmAdd(replace:boolean):void {const v=this.form.getRawValue();this.store.add(v.cantidad,v.notas,replace,()=>void this.router.navigate(['/cliente/carrito']));}
}
