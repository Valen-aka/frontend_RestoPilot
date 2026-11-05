import {Component, ElementRef, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormErrors} from '../../../components/form-errors/form-errors';
import {fieldErrors, nonBlank, passwordBytes, validateForm} from '../auth-form.utils';

@Component({selector: 'rp-acceso', imports: [ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule, FormErrors], templateUrl: './acceso.html', styleUrls: ['../../../layouts/auth-layout/auth-forms.css', './acceso.css']})
export class AccesoPage {
  readonly form = new FormGroup({
    correo: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(100)]}),
    password: new FormControl('', {nonNullable: true, validators: [Validators.required, nonBlank, passwordBytes]}),
  });
  readonly errors = fieldErrors;
  readonly notice = signal('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  submit() {
    this.notice.set('');
    if (!validateForm(this.form, this.host)) return;
    this.notice.set('Los datos tienen un formato válido. El inicio de sesión estará disponible al conectar el servicio de autenticación.');
    this.form.controls.password.reset();
  }
}
