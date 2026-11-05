import {Component, ElementRef, inject, signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormErrors} from '../../../components/form-errors/form-errors';
import {accountForm, fieldErrors, validateForm} from '../auth-form.utils';

@Component({selector: 'rp-registro-cliente', imports: [ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule, FormErrors], templateUrl: './registro-cliente.html', styleUrls: ['../../../layouts/auth-layout/auth-forms.css', './registro-cliente.css']})
export class RegistroClientePage {
  readonly form = accountForm();
  readonly errors = fieldErrors;
  readonly notice = signal('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  submit() {
    this.notice.set('');
    if (!validateForm(this.form, this.host)) return;
    this.notice.set('Los datos tienen un formato válido. La cuenta no se ha creado: el registro estará disponible al conectar el servicio de autenticación.');
    this.form.controls.password.reset();
  }
}
