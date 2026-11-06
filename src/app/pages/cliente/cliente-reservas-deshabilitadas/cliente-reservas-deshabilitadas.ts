import {Component, DestroyRef, computed, effect, inject, signal, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {RouterLink, Router, ActivatedRoute} from '@angular/router';
import {forkJoin, of, Subscription} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {ReservaService} from '../../../core/services/reserva.service';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {API_SESSION, activeClientSession} from '../../../core/auth/api-session';
import {AtencionFisicaResponse} from '../../../core/models/atencion-fisica.model';
import {RestauranteResponse} from '../../../core/models/catalogo-api.model';
@Component({selector:'rp-cliente-reservas-deshabilitadas',imports:[RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatSelectModule,MatProgressSpinnerModule,WorkspaceShell],templateUrl:'./cliente-reservas-deshabilitadas.html',styleUrl:'./cliente-reservas-deshabilitadas.css'})
export class ClienteReservasDeshabilitadasPage {
 readonly session=inject(API_SESSION);private readonly api=inject(ReservaService);private readonly catalogo=inject(CatalogoService);private readonly router=inject(Router);private readonly route=inject(ActivatedRoute);private readonly destroyRef=inject(DestroyRef);
 readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});readonly hasSession=computed(()=>activeClientSession(this.session()));
 readonly status=signal<AtencionFisicaResponse|null>(null);readonly restaurants=signal<readonly RestauranteResponse[]>([]);readonly loading=signal(false);readonly problem=signal('');private query?:Subscription;private generation=0;
 constructor(){effect(()=>{this.params();this.session();untracked(()=>this.refresh());});this.destroyRef.onDestroy(()=>{this.generation++;this.query?.unsubscribe();});}
 refresh():void {const generation=++this.generation;this.query?.unsubscribe();this.status.set(null);this.restaurants.set([]);this.problem.set('');this.loading.set(false);if(!this.hasSession())return;
  const raw=this.params().get('restauranteId');const rid=raw!==null&&/^[1-9]\d*$/.test(raw)?Number(raw):null;
  const invalid=raw!==null&&(!Number.isSafeInteger(rid)||!rid);this.loading.set(true);
  this.query=forkJoin({restaurants:this.catalogo.restaurantes(),status:!invalid&&rid?this.api.moduloRestaurante(rid):of(null)}).subscribe({next:data=>{if(generation!==this.generation)return;this.restaurants.set(data.restaurants);this.status.set(data.status);this.loading.set(false);if(invalid)this.problem.set('El restaurante de la URL no es válido. Selecciona un local.');},error:()=>{if(generation!==this.generation)return;this.loading.set(false);this.problem.set('No pudimos verificar si las reservas están habilitadas. Vuelve a consultar.');}});
 }
 choose(id:number):void {void this.router.navigate(['/cliente/reservar'],{queryParams:{vista:'cliente-reservas-deshabilitadas',restauranteId:id}});}
}
