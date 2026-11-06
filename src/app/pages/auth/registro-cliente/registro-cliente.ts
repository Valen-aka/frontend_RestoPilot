import {PreviewOperation} from '../../../components/preview-operation/preview-operation';
import {PreviewPanel} from '../../../components/preview-operation/preview-panel';
import {Component, ElementRef, inject, signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormErrors} from '../../../components/form-errors/form-errors';
import {accountForm, fieldErrors, validateForm} from '../auth-form.utils';

@Component({selector: 'rp-registro-cliente', imports: [PreviewPanel, ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule, FormErrors], templateUrl: './registro-cliente.html', styleUrls: ['../../../layouts/auth-layout/auth-forms.css', './registro-cliente.css']})
export class RegistroClientePage {
  readonly form = accountForm();
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
