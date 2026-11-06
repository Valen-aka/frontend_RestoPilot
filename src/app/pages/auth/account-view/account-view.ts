import {RegistrationBusy} from '../../../core/services/registration-busy.service';
import {Component, DestroyRef, ElementRef, inject, input, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {accountForm, validateForm} from '../auth-form.utils';
import {AuthService} from '../../../core/services/auth.service';
import {OwnerDraftService} from '../../../core/services/owner-draft.service';
import {accessProblem, uncertainRegistration} from '../access-problem';
@Component({selector:'rp-account-view',imports:[ReactiveFormsModule,RouterLink,MatButtonModule,MatFormFieldModule,MatInputModule],templateUrl:'./account-view.html',styleUrl:'../../../layouts/auth-layout/auth-forms.css'})
export class AccountView {
 readonly owner=input(false);readonly form=accountForm();readonly busy=inject(RegistrationBusy).busy;readonly uncertain=signal(false);readonly problem=signal('');private readonly auth=inject(AuthService);private readonly draft=inject(OwnerDraftService);private readonly router=inject(Router);private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);private readonly destroyRef=inject(DestroyRef);
 constructor(){this.destroyRef.onDestroy(()=>this.busy.set(false));}
 submit():void {if(this.busy()||this.uncertain()||!validateForm(this.form,this.host))return;const value=this.form.getRawValue(),account={nombreCompleto:value.nombre.trim(),correo:value.correo.trim(),password:value.password};if(this.owner()){this.draft.save(account);this.form.controls.password.reset();void this.router.navigate(['/auth/restaurante']);return;}
 this.busy.set(true);this.problem.set('');this.form.disable({emitEvent:false});this.auth.register(account).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:()=>{this.form.controls.password.reset();this.busy.set(false);void this.router.navigate(['/cliente']);},error:e=>{this.busy.set(false);this.uncertain.set(uncertainRegistration(e));if(!this.uncertain())this.form.enable({emitEvent:false});this.problem.set(accessProblem(e));}});}
}
