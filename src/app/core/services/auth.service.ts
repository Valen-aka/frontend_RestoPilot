import {DestroyRef, Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {defer, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import type {ApiSession} from '../auth/api-session';
import type {AuthResponse, LoginRequest} from '../models/auth.model';
import {positiveId} from '../models/pedido-api.model';

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly current = signal<ApiSession | null>(null);
  private expiryTimer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  readonly session = this.current.asReadonly();

  constructor() {inject(DestroyRef).onDestroy(() => clearTimeout(this.expiryTimer));}
  login(request: LoginRequest): Observable<AuthResponse> {
    return defer(() => {
      this.logout();
      const generation = this.generation;
      return this.http.post<unknown>(environment.apiUrl.replace(/\/$/, '') + '/auth/login', request, {timeout: 20000})
        .pipe(map(value => {
          if (generation !== this.generation) throw new Error('Este intento de acceso ya no está vigente.');
          const response = value as AuthResponse;
          if (!response || !positiveId(response.id) || typeof response.nombreCompleto !== 'string' ||
              typeof response.correo !== 'string' || !['CLIENTE','ADMINISTRADOR','DUENO'].includes(response.rol) ||
              typeof response.token !== 'string' || response.token.split('.').length !== 3) throw new Error('La respuesta de acceso no es válida.');
          let claims: Record<string, unknown>;
          try {
            const encoded = response.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const bytes = Uint8Array.from(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')), c => c.charCodeAt(0));
            claims = JSON.parse(new TextDecoder().decode(bytes));
          } catch {throw new Error('No pudimos interpretar la sesión recibida.');}
          const expiresAt = typeof claims['exp'] === 'number' ? claims['exp'] * 1000 : 0;
          if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || claims['userId'] !== response.id ||
              claims['sub'] !== response.correo || claims['rol'] !== response.rol) throw new Error('La sesión recibida no es válida o ya expiró.');
          const restaurant = response.restauranteId ?? null;
          const claimRestaurant = claims['restauranteId'] ?? null;
          if ((restaurant !== null && !positiveId(restaurant)) || restaurant !== claimRestaurant) {
            throw new Error('El restaurante de la sesión no es válido.');
          }
          // Se obtiene solo del login HTTP. Leer claims no verifica la firma; el backend autoriza cada petición.
          this.current.set(Object.freeze({subject: String(response.id), role: response.rol,
            accessToken: response.token, expiresAt, restauranteId: restaurant}));
          this.scheduleExpiry(expiresAt);
          return response;
        }));
    });
  }
  logout(): void {this.generation++; clearTimeout(this.expiryTimer); this.current.set(null);}
  private scheduleExpiry(expiresAt: number): void {
    clearTimeout(this.expiryTimer);
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {this.logout(); return;}
    this.expiryTimer = setTimeout(() => this.scheduleExpiry(expiresAt), Math.min(remaining, 2147483647));
  }
}
