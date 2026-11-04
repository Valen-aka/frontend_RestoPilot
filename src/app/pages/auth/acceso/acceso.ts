import {Component, DestroyRef, ElementRef, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {HttpErrorResponse} from '@angular/common/http';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs';
import {AuthService} from '../../../core/services/auth.service';
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
  readonly pending = signal(false);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private destroyed = false;
  constructor() { this.destroyRef.onDestroy(() => {this.destroyed = true;}); }
  submit() {
    if (this.pending()) return;
    this.notice.set('');
    if (!validateForm(this.form, this.host)) return;
    this.pending.set(true);
    const request = this.form.getRawValue();
    this.auth.login({correo: request.correo.trim(), password: request.password})
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => {
        this.pending.set(false); this.form.controls.password.reset();
      })).subscribe({
        next: response => {
          if (this.destroyed) return;
          const home = response.rol === 'CLIENTE' ? '/cliente' : response.rol === 'DUENO' ? '/dueno' : '/operacion';
          const requested = this.route.snapshot.queryParamMap.get('returnUrl');
          // Solo rutas internas del rol. No interpretar URLs externas ni outlets secundarios.
          const allowed = requested && /^\/(cliente|dueno|operacion)(?:[/?]|$)/.test(requested)
            && /^\/(cliente|dueno|operacion)(?:\/[a-z-]+)*$/.test(requested.split('?')[0])
            && !/[\\\x00-\x20():]/.test(requested) && (requested === home || requested.startsWith(home + '/') || requested.startsWith(home + '?'));
          void this.router.navigateByUrl(allowed ? requested : home).then(ok => {
            if (!ok && !this.destroyed) this.notice.set('La sesión está activa, pero no pudimos abrir la pantalla. Intenta entrar de nuevo.');
          }).catch(() => {if (!this.destroyed) this.notice.set('No pudimos abrir la pantalla solicitada.');});
        },
        error: error => {
          this.notice.set(error instanceof HttpErrorResponse && error.status === 401 ? 'Correo o contraseña incorrectos.' :
            error instanceof HttpErrorResponse && error.status === 403 ? 'La cuenta no tiene acceso. Consulta con el administrador.' :
            'No pudimos iniciar sesión. Revisa tu conexión e inténtalo de nuevo.');
        }
      });
  }
}
