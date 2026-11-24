import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { defer, map, Observable, throwError } from 'rxjs';
import { activeClientSession, API_SESSION } from '../auth/api-session';
import { ClientChatRequest, ClientChatResponse, readClientChatResponse } from '../models/assistant-client.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssistantClientService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(API_SESSION);

  send(request: ClientChatRequest): Observable<ClientChatResponse> {
    return defer(() => {
      const session = this.session();
      const base = environment.assistantApiUrl?.trim().replace(/\/+$/, '');
      const mensaje = request.mensaje.trim();
      if (!base || !activeClientSession(session) || !mensaje || mensaje.length > 2000
          || !Number.isSafeInteger(request.restauranteId) || request.restauranteId <= 0) {
        return throwError(() => new Error('Consulta de asistente no válida.'));
      }
      // La identidad procede exclusivamente de API_SESSION; nunca del cuerpo del mensaje.
      return this.http.post<unknown>(base + '/cliente/chat', { mensaje, restauranteId: request.restauranteId }, {
        headers: { Authorization: 'Bearer ' + session.accessToken }, timeout: 60_000,
      }).pipe(map(readClientChatResponse));
    });
  }
}
