import {RegistrationBusy} from '../../../core/services/registration-busy.service';
import {Component, DestroyRef, ElementRef, Injectable, computed, effect, inject, input, signal, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {AuthService, AdminResponse} from '../../../core/services/auth.service';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {accountForm, validateForm} from '../../auth/auth-form.utils';
import {accessProblem, uncertainRegistration} from '../../auth/access-problem';
@Injectable({providedIn:'root'})
export class AdminReceipt {private token='';private value:AdminResponse|null=null;save(token:string,value:AdminResponse):void{this.token=token;this.value=value;}read(token:string):AdminResponse|null{if(token!==this.token){this.value=null;this.token='';}return this.value;}}
@Component({selector:'rp-admin-view',imports:[ReactiveFormsModule,RouterLink,MatButtonModule,MatFormFieldModule,MatInputModule,WorkspaceShell],templateUrl:'./admin-view.html',styleUrls:['../../../layouts/auth-layout/auth-forms.css','./admin-view.css']})
export class AdminView {
 readonly result=input(false);readonly auth=inject(AuthService);readonly receipt=inject(AdminReceipt);readonly confirmed=computed(()=>this.result()?this.receipt.read(this.auth.session()?.accessToken||''):null);readonly restaurant=signal<RestauranteResponse|null>(null);readonly form=accountForm();readonly busy=inject(RegistrationBusy).busy;readonly uncertain=signal(false);readonly problem=signal('');private readonly router=inject(Router);private readonly destroyRef=inject(DestroyRef);private readonly catalog=inject(CatalogoService);private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 constructor(){this.destroyRef.onDestroy(()=>this.busy.set(false));effect(()=>{const s=this.auth.session();untracked(()=>{if(s?.role==='DUENO'&&s.restauranteId)this.catalog.restaurante(s.restauranteId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{if(s.accessToken===this.auth.session()?.accessToken)this.restaurant.set(r);},error:()=>{}});});});}
 submit():void {const session=this.auth.session();if(this.busy()||this.uncertain()||session?.role!=='DUENO'||!validateForm(this.form,this.host))return;const v=this.form.getRawValue();this.busy.set(true);this.problem.set('');this.form.disable({emitEvent:false});this.auth.createAdmin({nombreCompleto:v.nombre.trim(),correo:v.correo.trim().toLowerCase(),password:v.password}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{this.receipt.save(session.accessToken,r);this.form.controls.password.reset();this.busy.set(false);void this.router.navigate(['/dueno/administradores/nuevo'],{queryParams:{vista:'dueno-administrador-creado'}});},error:e=>{this.busy.set(false);this.uncertain.set(uncertainRegistration(e));if(!this.uncertain())this.form.enable({emitEvent:false});this.problem.set(accessProblem(e));}});}
}
