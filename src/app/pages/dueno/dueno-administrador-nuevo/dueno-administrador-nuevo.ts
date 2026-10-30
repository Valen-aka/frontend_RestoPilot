import {Component, ElementRef, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
@Component({
  selector: 'rp-dueno-administrador-nuevo',
  imports: [WorkspaceShell, RouterLink, MatButtonModule, ReactiveFormsModule, MatInputModule],
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
    this.notice.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const invalid = (Object.keys(this.form.controls) as (keyof typeof this.form.controls)[]).find(name => this.form.controls[name].invalid);
      if (invalid) this.host.nativeElement.querySelector<HTMLInputElement>(`[formControlName="${invalid}"]`)?.focus();
      return;
    }
    this.notice.set('Los datos tienen un formato válido. No se creó un administrador: el servicio de administración todavía no está conectado.');
    this.form.controls.password.reset();
  }
}
