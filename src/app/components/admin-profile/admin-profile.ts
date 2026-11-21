import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {environment} from '../../../environments/environment';
import {jwtClaims} from '../../core/services/supabase-auth.transport';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'rp-admin-profile',
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css',
})
export class AdminProfile {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialogRef<AdminProfile>);
  private readonly initialSession = this.auth.session();

  readonly name = new FormControl(this.initialSession?.nombreCompleto ?? '', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)],
  });
  readonly editing = signal(false);
  readonly email = this.getEmail();
  readonly saving = signal(false);
  readonly error = signal('');

  private getEmail(): string {
    const token = this.initialSession?.accessToken;
    if (!token) return '';
    try {
      const claims = jwtClaims(token);
      const email = this.initialSession?.authUserId ? claims['email'] : claims['sub'];
      return typeof email === 'string' ? email : '';
    } catch {
      return '';
    }
  }

  save(): void {
    this.name.markAsTouched();
    if (this.name.invalid || this.saving()) return;

    const session = this.auth.session();
    if (!session?.authUserId || (session.role !== 'ADMINISTRADOR' && session.role !== 'DUENO') ||
        session.expiresAt <= Date.now() || session.accessToken !== this.initialSession?.accessToken) {
      this.error.set('Inicia sesión como dueño o administrador para editar tu perfil.');
      return;
    }

    const name = this.name.value.trim();
    if (name === session.nombreCompleto) {
      this.dialog.close();
      return;
    }

    const {url, publishableKey} = environment.supabase;
    this.error.set('');
    this.saving.set(true);
    this.dialog.disableClose = true;
    this.http.post<unknown>(url.replace(/\/$/, '') + '/rest/v1/rpc/rp_update_workspace_profile',
      {p_nombre_completo: name}, {
        headers: {apikey: publishableKey, Authorization: 'Bearer ' + session.accessToken},
        timeout: 20000,
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: savedName => {
          if (savedName !== name || this.auth.session()?.accessToken !== session.accessToken) {
            this.fail('No pudimos confirmar el cambio. Vuelve a iniciar sesión para consultar tu perfil.');
            return;
          }
          this.auth.updateName(name);
          this.dialog.close(true);
        },
        error: cause => {
          this.fail(cause instanceof HttpErrorResponse && [401, 403].includes(cause.status)
            ? 'Tu sesión ya no permite editar el perfil.'
            : 'No pudimos guardar el nombre. Intenta nuevamente.');
        },
      });
  }

  private fail(message: string): void {
    this.dialog.disableClose = false;
    this.saving.set(false);
    this.error.set(message);
  }
}
