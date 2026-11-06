import {Component, ElementRef, inject} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormErrors} from '../../../components/form-errors/form-errors';
import {accountForm, fieldErrors, validateForm} from '../auth-form.utils';

@Component({selector: 'rp-registro-cliente', imports: [ ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule, FormErrors], templateUrl: './registro-cliente.html', styleUrls: ['../../../layouts/auth-layout/auth-forms.css', './registro-cliente.css']})
export class RegistroClientePage {
  readonly form = accountForm();
  readonly errors = fieldErrors;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  submit() {
    validateForm(this.form, this.host);
  }
}
