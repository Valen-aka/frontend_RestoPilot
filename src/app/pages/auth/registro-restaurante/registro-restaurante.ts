import {PreviewOperation} from '../../../components/preview-operation/preview-operation';
import {PreviewPanel} from '../../../components/preview-operation/preview-panel';
import {Component, ElementRef, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormErrors} from '../../../components/form-errors/form-errors';
import {fieldErrors, nonBlank, validateForm} from '../auth-form.utils';

@Component({selector: 'rp-registro-restaurante', imports: [PreviewPanel, ReactiveFormsModule, RouterLink, MatInputModule, MatButtonModule, FormErrors], templateUrl: './registro-restaurante.html', styleUrls: ['../../../layouts/auth-layout/auth-forms.css', './registro-restaurante.css']})
export class RegistroRestaurantePage {
  readonly form = new FormGroup({
    nombre: new FormControl('', {nonNullable: true, validators: [Validators.required, nonBlank, Validators.maxLength(150)]}),
    direccion: new FormControl('', {nonNullable: true, validators: [Validators.required, nonBlank, Validators.maxLength(255)]}),
    telefono: new FormControl('', {nonNullable: true, validators: [Validators.required, nonBlank, Validators.maxLength(20)]}),
    apertura: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    cierre: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    salon: new FormControl(true, {nonNullable: true}),
    delivery: new FormControl(true, {nonNullable: true}),
  }, {validators: control => {
    const {apertura, cierre} = control.value;
    return apertura && cierre && apertura >= cierre ? {horario: true} : null;
  }});
  readonly errors = fieldErrors;
  readonly notice = signal('');
  readonly preview = new PreviewOperation();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  submit() {
    if (this.preview.busy()) return;
    this.notice.set('');
    this.preview.reset();
    if (!validateForm(this.form, this.host)) {
      if (this.form.hasError('horario') && Object.values(this.form.controls).every(control => control.valid)) this.host.nativeElement.querySelector<HTMLInputElement>('#cierre')?.focus();
      return;
    }
    this.preview.run(() => {});
  }
}
