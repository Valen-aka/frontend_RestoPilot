import {PreviewOperation} from '../../../components/preview-operation/preview-operation';
import {PreviewPanel} from '../../../components/preview-operation/preview-panel';
import {Component, ElementRef, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
@Component({
  selector: 'rp-dueno-administrador-nuevo',
  imports: [PreviewPanel, WorkspaceShell, RouterLink, MatButtonModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './dueno-administrador-nuevo.html',
  styleUrls: ['../../../components/workspace-shell/workspace-pages.css', './dueno-administrador-nuevo.css'],
})
export class DuenoAdministradorNuevoPage {
  readonly form = new FormGroup({
    nombre: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.maxLength(150), control => !control.value.trim() ? {required: true} : null]}),
    correo: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(100)]}),
    password: new FormControl('', {nonNullable: true, validators: [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&._\-#]).{8,}$/),
      control => new TextEncoder().encode(control.value).length > 72 ? {passwordBytes: true} : null,
    ]}),
  });
  readonly notice = signal('');
  readonly preview = new PreviewOperation();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  error(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if (!control.touched || !control.errors) return '';
    if (control.hasError('required')) return 'Completa este campo.';
    if (control.hasError('email')) return 'Ingresa un correo electrónico válido.';
    if (control.hasError('passwordBytes')) return 'La contraseña no puede superar 72 bytes UTF-8.';
    if (control.hasError('minlength') || control.hasError('pattern')) return 'Usa 8 caracteres o más con letra, número y un carácter especial (@$!%*?&._-#).';
    if (control.hasError('maxlength')) return name === 'nombre' ? 'El nombre no puede superar 150 caracteres.' : 'El correo no puede superar 100 caracteres.';
    return 'Revisa este campo.';
  }
  submit(): void {
    if (this.preview.busy()) return;
    this.preview.reset(); this.notice.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const invalid = (Object.keys(this.form.controls) as (keyof typeof this.form.controls)[]).find(name => this.form.controls[name].invalid);
      if (invalid) this.host.nativeElement.querySelector<HTMLInputElement>(`[formControlName="${invalid}"]`)?.focus();
      return;
    }
    this.preview.run(() => this.form.controls.password.reset());
  }
}
