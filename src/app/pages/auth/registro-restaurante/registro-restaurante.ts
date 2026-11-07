import {EmailConfirmationRequired} from '../../../core/services/supabase-auth.transport';
import {RegistrationBusy} from '../../../core/services/registration-busy.service';
import {Component, DestroyRef, ElementRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {AuthService} from '../../../core/services/auth.service';
import {OwnerDraftService} from '../../../core/services/owner-draft.service';
import {validateForm, nonBlank} from '../auth-form.utils';
import {accessProblem, uncertainRegistration, applyRegistrationErrors} from '../access-problem';
@Component({selector:'rp-registro-restaurante',imports:[ReactiveFormsModule,RouterLink,MatButtonModule,MatInputModule,MatFormFieldModule,MatSelectModule],templateUrl:'./registro-restaurante.html',styleUrl:'../../../layouts/auth-layout/auth-forms.css'})
export class RegistroRestaurantePage {
 readonly draft=inject(OwnerDraftService);readonly hasAccount=!!this.draft.read();readonly busy=inject(RegistrationBusy).busy;readonly uncertain=signal(false);readonly problem=signal('');private readonly auth=inject(AuthService);private readonly router=inject(Router);private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);private readonly destroyRef=inject(DestroyRef);
 readonly form=new FormGroup({nombre:new FormControl('',{nonNullable:true,validators:[Validators.required,nonBlank,Validators.maxLength(150)]}),direccion:new FormControl('',{nonNullable:true,validators:[Validators.required,nonBlank,Validators.maxLength(255)]}),telefono:new FormControl('',{nonNullable:true,validators:[Validators.required,nonBlank,Validators.maxLength(20)]}),horaApertura:new FormControl('',{nonNullable:true,validators:Validators.required}),horaCierre:new FormControl('',{nonNullable:true,validators:Validators.required}),tieneAtencionFisica:new FormControl(true,{nonNullable:true}),aceptaDelivery:new FormControl(true,{nonNullable:true})},{validators:c=>c.value.horaApertura&&c.value.horaCierre&&c.value.horaApertura>=c.value.horaCierre?{horario:true}:null});
 constructor(){this.destroyRef.onDestroy(()=>this.busy.set(false));}
 submit():void {if(this.busy()||this.uncertain())return;const account=this.draft.read();if(!account){this.problem.set('Completa primero los datos de tu cuenta.');return;}if(!validateForm(this.form,this.host))return;this.busy.set(true);this.form.disable({emitEvent:false});this.auth.registerOwner({...account,restaurante:this.form.getRawValue()}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.draft.clear();this.busy.set(false);void this.router.navigate(['/dueno/bienvenida']);},error:e=>{this.busy.set(false);if(e instanceof EmailConfirmationRequired){this.draft.clear();void this.router.navigate(['/auth/login'],{queryParams:{registro:'confirmar-correo'}});return;}this.uncertain.set(uncertainRegistration(e));if(!this.uncertain())this.form.enable({emitEvent:false});applyRegistrationErrors(this.form,e,{'restaurante.nombre':'nombre','restaurante.direccion':'direccion','restaurante.telefono':'telefono','restaurante.horaApertura':'horaApertura','restaurante.horaCierre':'horaCierre'});this.problem.set(accessProblem(e));}});}
}
