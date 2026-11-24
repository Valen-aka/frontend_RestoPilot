// Isolated UI fixture: no session, HTTP provider or backend credentials.
import { Component, inject, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { AssistantChat } from '../../src/app/components/assistant-chat/assistant-chat';
import { API_SESSION } from '../../src/app/core/auth/api-session';
import { CatalogoService } from '../../src/app/core/services/catalogo.service';
import { bootstrapApplication } from '@angular/platform-browser';
import { ChatPanel } from '../../src/app/components/chat-panel/chat-panel';
import { ChatMessage, ChatReply } from '../../src/app/components/chat-panel/chat-message.model';

@Component({
  selector: 'rp-root',
  imports: [ChatPanel, AssistantChat],
  template: `
    @if (wrapper) {
      <rp-assistant-chat />
    } @else if (visible()) {
      <rp-chat-panel title="Tu asistente de carta" [messages]="messages()" [busy]="busy()"
        [suggestions]="['Consulta de prueba', 'Otra consulta de prueba']"
        [error]="error()" (messageSent)="send($event)" (closed)="visible.set(false)">
        <p chat-context>Restaurante de prueba</p>
      </rp-chat-panel>
    }
  `,
  styles: `:host > rp-chat-panel { display:block; width:min(912px, calc(100vw - 16px)); height:min(674px, calc(100dvh - 16px)); margin:8px; }`,
})
class ChatPanelFixture {
  readonly wrapper = new URLSearchParams(location.search).has('wrapper');
  readonly http = inject(HttpTestingController);
  readonly messages = signal<ChatMessage[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly visible = signal(true);
  readonly sent: string[] = [];
  constructor() { (window as unknown as { chatQA: ChatPanelFixture }).chatQA = this; }
  send(text: string): void {
    this.sent.push(text);
    this.messages.update(messages => [...messages, { usuario: text }]);
    this.busy.set(true);
  }
  reply(estado: ChatReply['estado'], mensaje: string): void {
    this.busy.set(false);
    this.messages.update(messages => [...messages, { asistente: { estado, mensaje } }]);
  }
  failRequest(): void {
    this.http.expectOne('/api/ia/cliente/chat').flush({}, { status: 503, statusText: 'Unavailable' });
  }
  resolveRequest(): void {
    this.http.expectOne('/api/ia/cliente/chat').flush({ estado: 'ANSWER', mensaje: 'Respuesta de prueba' });
  }
}

bootstrapApplication(ChatPanelFixture, { providers: [
  provideHttpClient(), provideHttpClientTesting(),
  { provide: Router, useValue: { events: EMPTY, url: '/cliente' } },
  { provide: API_SESSION, useValue: signal({ subject: 'qa-only', role: 'CLIENTE', accessToken: 'test-not-a-credential', expiresAt: Date.now() + 60_000 }) },
  { provide: CatalogoService, useValue: { restaurantes: () => of([{ id: 1, nombre: 'Restaurante de prueba', activo: true }]) } },
] }).catch(console.error);
