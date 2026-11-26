import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, inject, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { AssistantChat } from '../../src/app/components/assistant-chat/assistant-chat';
import { API_SESSION } from '../../src/app/core/auth/api-session';
import { ROUTES } from '../../src/app/routes/operacion/operacion.routes';

const assistantRoute = ROUTES[0].children!.find(route => route.path === 'asistente')!;

@Component({
  selector: 'rp-root',
  imports: [AssistantChat, RouterOutlet],
  template: '<router-outlet /><rp-assistant-chat />',
})
class AdminChatFixture {
  constructor() {
    Object.assign(window, { adminChatHttp: inject(HttpTestingController) });
  }
}

bootstrapApplication(AdminChatFixture, {
  providers: [
    provideRouter([{ ...assistantRoute, path: 'operacion/asistente' }]),
    provideHttpClient(), provideHttpClientTesting(),
    { provide: API_SESSION, useValue: signal({
      subject: 'qa-admin', role: 'ADMINISTRADOR', accessToken: 'test-not-a-credential',
      expiresAt: Date.now() + 120_000, restauranteId: 21,
    }) },
  ],
}).catch(console.error);
