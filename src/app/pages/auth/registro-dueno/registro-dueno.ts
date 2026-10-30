import {Component, ElementRef, inject, signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormErrors} from '../../../components/form-errors/form-errors';
import {accountForm, fieldErrors, validateForm} from '../auth-form.utils';

@Component({selector: 'rp-registro-dueno', imports: [ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule, FormErrors], templateUrl: './registro-dueno.html', styleUrls: ['../../../layouts/auth-layout/auth-forms.css', './registro-dueno.css']})
export class RegistroDuenoPage {
  readonly form = accountForm();
  readonly errors = fieldErrors;
  readonly notice = signal('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  submit() {
    this.notice.set('');
    if (!validateForm(this.form, this.host)) return;
    this.form.controls.password.reset();
    void this.router.navigate(['/auth/restaurante']);
  }
}
