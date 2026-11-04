import {Component, input, inject, computed} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ClientHeader} from '../../../components/client-header/client-header';
import {ClientFooter} from '../../../components/client-footer/client-footer';
import {AuthService} from '../../../core/services/auth.service';
import {activeClientSession} from '../../../core/auth/api-session';
import {CartaPage} from './carta-page';
/** Solo composición visual: consulta y selección pertenecen a CartaPage y sus stores. */
@Component({selector:'rp-carta-view',imports:[DecimalPipe,RouterLink,ReactiveFormsModule,MatButtonModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatProgressSpinnerModule,ClientHeader,ClientFooter],templateUrl:'./carta-view.html',styleUrl:'./carta-view.css'})
export class CartaView {
 readonly page = input.required<CartaPage>();
 readonly mode = input<'inicio'|'lista'|'detalle'|'bowl'>('lista');
 readonly router = inject(Router);
 readonly auth = inject(AuthService);
 readonly signedIn = computed(()=>activeClientSession(this.auth.session()));
 readonly restaurantControl = new FormControl<number|null>(null,Validators.required);
 readonly restaurantForm = new FormGroup({restaurant: this.restaurantControl});
 readonly quantityForm = computed(()=>new FormGroup({quantity:this.page().quantity}));
 readonly category = computed(()=>this.page().store.categories().find(c=>c.id===this.page().store.categoryId()));
 readonly query = computed(()=>({restauranteId:this.page().store.restaurant()?.id??null}));
 readonly title = computed(()=>this.mode()==='inicio'?'Un buen día empieza en tu mesa':
  this.page().store.soldOut()&&this.mode()!=='bowl'?'Hoy se nos terminó':
  this.mode()==='detalle'||this.mode()==='bowl'?this.page().store.detail()?.nombre??'Detalle del plato':this.category()?.nombre??'Nuestra carta');
 readonly subtitle = computed(()=>this.mode()==='inicio'?'¿Qué se te antoja hoy?':
  this.mode()==='bowl'?'Información del plato vinculado a tu recomendación.':
  this.page().store.soldOut()?'Pero hay más favoritos por descubrir.':
  this.mode()==='detalle'?'Todo el sabor de nuestra cocina.':
  this.page().store.empty()?'Muy pronto, más para elegir.':this.category()?.descripcion??'Nuestros clásicos, a tu mesa.');
 chooseRestaurant():void {
  if(this.restaurantControl.valid&&this.restaurantControl.value!==null)this.page().chooseRestaurant(this.restaurantControl.value);
  else this.restaurantControl.markAsTouched();
 }
}
