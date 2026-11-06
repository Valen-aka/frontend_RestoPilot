import {PreviewOperation} from '../../../components/preview-operation/preview-operation';
import {PreviewPanel} from '../../../components/preview-operation/preview-panel';
import {Component, ElementRef, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormErrors} from '../../../components/form-errors/form-errors';
import {fieldErrors, nonBlank, passwordBytes, validateForm} from '../auth-form.utils';

@Component({selector: 'rp-acceso-error', imports: [PreviewPanel, ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule, FormErrors], templateUrl: './acceso-error.html', styleUrls: ['../../../layouts/auth-layout/auth-forms.css', './acceso-error.css']})
export class AccesoErrorPage {
  readonly form = new FormGroup({
    correo: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(100)]}),
    password: new FormControl('', {nonNullable: true, validators: [Validators.required, nonBlank, passwordBytes]}),
  });
  readonly errors = fieldErrors;
  readonly notice = signal('');
  readonly preview = new PreviewOperation();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  submit() {
    if (this.preview.busy()) return;
    this.notice.set('');
    this.preview.reset();
    if (!validateForm(this.form, this.host)) return;
    this.preview.run(() => {this.form.controls.password.reset();});
  }
}
