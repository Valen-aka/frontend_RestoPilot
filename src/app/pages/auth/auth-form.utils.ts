import {ElementRef} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';

export const nonBlank: ValidatorFn = control => typeof control.value === 'string' && !control.value.trim() ? {required: true} : null;
export const passwordBytes: ValidatorFn = control => new TextEncoder().encode(control.value ?? '').length > 72 ? {passwordBytes: true} : null;
export const registrationPassword = [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&._\-#]).{8,}$/), passwordBytes];
export function accountForm() {
  return new FormGroup({
    nombre: new FormControl('', {nonNullable: true, validators: [Validators.required, nonBlank, Validators.maxLength(150)]}),
    correo: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(100)]}),
    password: new FormControl('', {nonNullable: true, validators: registrationPassword}),
  });
}
export function fieldErrors(control: AbstractControl, label: string): string[] {
  if (!control.touched || !control.errors) return [];
  if (control.hasError('required')) return [`${label} es obligatorio.`];
  if (control.hasError('email')) return ['Ingresa un correo electrónico válido.'];
  if (control.hasError('passwordBytes')) return ['La contraseña no puede superar 72 bytes UTF-8.'];
  if (control.hasError('minlength') || control.hasError('pattern')) return ['Usa al menos 8 caracteres con una letra, un número y un carácter especial (@$!%*?&._-#).'];
  if (control.hasError('maxlength')) return [`${label} supera el máximo de ${control.errors['maxlength'].requiredLength} caracteres.`];
  return ['Revisa este campo.'];
}
export function validateForm(form: FormGroup, host: ElementRef<HTMLElement>): boolean {
  form.markAllAsTouched();
  if (form.valid) return true;
  const firstInvalidName = Object.keys(form.controls).find(name => form.controls[name].invalid);
  if (firstInvalidName) {
    const fields = host.nativeElement.querySelectorAll<HTMLElement>('[formControlName]');
    Array.from(fields).find(field => field.getAttribute('formControlName') === firstInvalidName)?.focus();
  }
  return false;
}
