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
@Component({selector:'rp-acceso',imports:[ReactiveFormsModule,RouterLink,MatInputModule,MatFormFieldModule,MatButtonModule],templateUrl:'./acceso.html',styleUrls:['../../../layouts/auth-layout/auth-forms.css','./acceso.css']})
export class AccesoPage {
 readonly auth=inject(AuthService);readonly router=inject(Router);readonly route=inject(ActivatedRoute);private readonly destroyRef=inject(DestroyRef);private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 readonly form=new FormGroup({correo:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.email,Validators.maxLength(100)]}),password:new FormControl('',{nonNullable:true,validators:[Validators.required,nonBlank,passwordBytes]})});readonly busy=signal(false);readonly notice=signal('');
 readonly confirmEmail=this.route.snapshot.queryParamMap.get('registro')==='confirmar-correo';
 readonly expired=this.route.snapshot.queryParamMap.get('motivo')==='sesion-expirada';
 submit():void {if(this.busy()||!validateForm(this.form,this.host))return;this.busy.set(true);this.notice.set('');const value=this.form.getRawValue();this.form.disable({emitEvent:false});this.auth.login(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{this.form.controls.password.reset();this.busy.set(false);void this.router.navigateByUrl(safeReturn(r.rol,this.route.snapshot.queryParamMap.get('returnUrl')));},error:e=>{this.busy.set(false);this.form.enable({emitEvent:false});this.form.controls.password.reset();this.notice.set(accessProblem(e,true));setTimeout(()=>this.host.nativeElement.querySelector<HTMLInputElement>('#password')?.focus(),0);}});}
}
