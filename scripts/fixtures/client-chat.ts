// Isolated integration fixture. Tokens below are test strings, never credentials.
import { Component, inject, signal, viewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterOutlet, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AssistantChat } from '../../src/app/components/assistant-chat/assistant-chat';
import { API_SESSION, ApiSession } from '../../src/app/core/auth/api-session';
import { CatalogoService } from '../../src/app/core/services/catalogo.service';
import { AssistantClientService } from '../../src/app/core/services/assistant-client.service';

const session = signal<ApiSession | null>({ subject: 'qa', role: 'CLIENTE', accessToken: 'qa-token', expiresAt: Date.now() + 3600000 });
@Component({ template: '' })
class ClientFixtureRoute {}

@Component({ selector: 'rp-root', imports: [AssistantChat, RouterOutlet], template: '<router-outlet /><rp-assistant-chat />' })
class ClientChatFixture {
  readonly chat = viewChild.required(AssistantChat);
  readonly http = inject(HttpTestingController);
  readonly service = inject(AssistantClientService);
  readonly session = session;
  constructor() { (window as unknown as { clientQA: ClientChatFixture }).clientQA = this; }
}
bootstrapApplication(ClientChatFixture, { providers: [
  provideHttpClient(), provideHttpClientTesting(),
  provideRouter([
    { path: '', redirectTo: 'cliente', pathMatch: 'full' },
    { path: 'cliente', component: ClientFixtureRoute },
    { path: 'cliente/pedido', component: ClientFixtureRoute },
  ]),
  { provide: API_SESSION, useValue: session },
  { provide: CatalogoService, useValue: { restaurantes: () => of([
    { id: 1, nombre: 'Restaurante uno', activo: true },
    { id: 2, nombre: 'Restaurante dos', activo: true },
    { id: 3, nombre: 'Restaurante inactivo', activo: false },
  ]) } },
] }).catch(console.error);
