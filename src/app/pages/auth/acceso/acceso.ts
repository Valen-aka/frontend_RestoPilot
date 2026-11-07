import {Component, DestroyRef, ElementRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../../core/services/auth.service';
import {safeReturn} from '../../../core/models/auth-navigation.model';
import {passwordBytes,validateForm,nonBlank} from '../auth-form.utils';
import {accessProblem} from '../access-problem';
import {environment} from '../../../../environments/environment';
@Component({selector:'rp-acceso',imports:[ReactiveFormsModule,RouterLink,MatInputModule,MatFormFieldModule,MatButtonModule],templateUrl:'./acceso.html',styleUrls:['../../../layouts/auth-layout/auth-forms.css','./acceso.css']})
export class AccesoPage {
 readonly auth=inject(AuthService);readonly router=inject(Router);readonly route=inject(ActivatedRoute);private readonly destroyRef=inject(DestroyRef);private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 readonly form=new FormGroup({correo:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.email,Validators.maxLength(100)]}),password:new FormControl('',{nonNullable:true,validators:[Validators.required,nonBlank,passwordBytes]})});readonly busy=signal(false);readonly notice=signal('');
 readonly confirmEmail=this.route.snapshot.queryParamMap.get('registro')==='confirmar-correo';
 readonly confirmationReturn=this.route.snapshot.queryParamMap.get('registro')==='confirmacion-recibida';
 readonly confirmationInvalid=this.route.snapshot.queryParamMap.get('motivo')==='enlace-confirmacion-invalido';
 readonly needsConfirmation=signal(false);readonly resending=signal(false);readonly resendCooldown=signal(false);readonly resendNotice=signal('');readonly supabase=environment.transport==='supabase';private resendTimer?:ReturnType<typeof setTimeout>;
 constructor(){this.destroyRef.onDestroy(()=>clearTimeout(this.resendTimer));}
 resend():void {
  const email=this.form.controls.correo;email.markAsTouched();
  if(email.invalid){this.host.nativeElement.querySelector<HTMLInputElement>('#correo')?.focus();return;}
  if(this.busy()||this.resending()||this.resendCooldown())return;
  this.resending.set(true);this.resendNotice.set('');this.resendCooldown.set(true);
  this.resendTimer=setTimeout(()=>this.resendCooldown.set(false),60000);
  this.auth.resendConfirmation(email.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.resending.set(false);this.resendNotice.set('Si existe un registro pendiente para ese correo, recibirás un enlace de confirmación. Revisa también spam.');},error:e=>{this.resending.set(false);this.resendNotice.set(e?.status===429?'Espera un minuto antes de solicitar otro mensaje.':'No pudimos confirmar el envío. Revisa la conexión o vuelve a intentarlo más tarde.');}});
 }
 readonly expired=this.route.snapshot.queryParamMap.get('motivo')==='sesion-expirada';
 submit():void {if(this.busy()||this.resending()||!validateForm(this.form,this.host))return;this.busy.set(true);this.notice.set('');const value=this.form.getRawValue();this.form.disable({emitEvent:false});this.auth.login(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{this.form.controls.password.reset();this.busy.set(false);void this.router.navigateByUrl(safeReturn(r.rol,this.route.snapshot.queryParamMap.get('returnUrl')));},error:e=>{this.busy.set(false);this.form.enable({emitEvent:false});this.form.controls.password.reset();this.needsConfirmation.set(e?.error?.code==='email_not_confirmed');this.notice.set(accessProblem(e,true));setTimeout(()=>this.host.nativeElement.querySelector<HTMLInputElement>('#password')?.focus(),0);}});}
}
