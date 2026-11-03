import {inject, InjectionToken, Signal} from '@angular/core';

import {AuthService} from '../services/auth.service';

/** Adaptar desde la sesión real de autenticación; nunca desde un usuario de muestra. */
export interface ApiSession {
  readonly subject: string;
  readonly role: string;
  readonly accessToken: string;
  readonly expiresAt: number;
  readonly restauranteId?: number | null;
}
/** El módulo auth provee una signal derivada de su sesión. No almacena credenciales. */
export const API_SESSION = new InjectionToken<Signal<ApiSession | null>>('API_SESSION', {
  providedIn: 'root', factory: () => inject(AuthService).session
});
export function activeClientSession(session: ApiSession | null): session is ApiSession {
  return !!session && !!session.subject && session.role === 'CLIENTE' &&
    !!session.accessToken.trim() && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now();
}

/** La autorización definitiva y la pertenencia al local se comprueban en el backend. */
export function activeOperationSession(session: ApiSession | null): session is ApiSession & {restauranteId:number} {
  return !!session && !!session.subject && ['ADMINISTRADOR','DUENO'].includes(session.role) &&
    !!session.accessToken.trim() && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now() &&
    typeof session.restauranteId === 'number' && Number.isSafeInteger(session.restauranteId) && session.restauranteId > 0;
}
