import { ChatPanel } from '../chat-panel/chat-panel';
import { ChatMessage, ChatReply } from '../chat-panel/chat-message.model';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CatalogoService } from '../../core/services/catalogo.service';
import { RestauranteResponse } from '../../core/models/catalogo-api.model';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { activeClientSession, activeOperationSession, API_SESSION } from '../../core/auth/api-session';

const CHAT_TIMEOUT_MS = 60_000;

@Component({
  selector: 'rp-assistant-chat',
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, ChatPanel],
  templateUrl: './assistant-chat.html',
  styleUrl: './assistant-chat.css',
})
export class AssistantChat {
  private readonly http = inject(HttpClient);
  private readonly catalog = inject(CatalogoService);
  private readonly router = inject(Router);
  private readonly session = inject(API_SESSION);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = toSignal(this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => event.urlAfterRedirects),
  ), { initialValue: this.router.url });
  private request?: Subscription;

  private restaurantRequest?: Subscription;
  readonly client = computed(() => /^\/cliente(\/|[?#]|$)/.test(this.route()) && activeClientSession(this.session()));
  readonly available = computed(() => !!environment.assistantApiUrl && (this.client() ||
    /^\/(dueno|operacion)(\/|[?#]|$)/.test(this.route()) && activeOperationSession(this.session())));
  readonly restaurants = signal<readonly RestauranteResponse[]>([]);
  readonly restaurant = new FormControl<number | null>(null);
  readonly restaurantState = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly open = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly draft = new FormControl('', { nonNullable: true });
  constructor() {
    effect(onCleanup => {
      this.session();
      onCleanup(() => {
        this.request?.unsubscribe();
        this.restaurantRequest?.unsubscribe();
        this.restaurants.set([]);
        this.restaurant.reset();
        this.restaurantState.set('idle');
        this.messages.set([]);
        this.draft.reset();
        this.error.set('');
        this.busy.set(false);
        this.open.set(false);
      });
    });
    effect(() => {
      if (!this.available()) this.close(false);
      else if (this.client() && this.route().split(/[?#]/)[0] === '/cliente/asistente') this.open.set(true);
    });
    effect(() => {
      if (this.client() && this.open() && this.restaurantState() === 'idle') {
        untracked(() => this.loadRestaurants());
      }
    });
  }

  loadRestaurants(): void {
    if (!this.client() || this.restaurantState() === 'loading') return;
    this.restaurantState.set('loading');
    this.restaurantRequest = this.catalog.restaurantes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: restaurants => {
        this.restaurants.set(restaurants.filter(restaurant => restaurant.activo));
        this.restaurantState.set('ready');
      },
      error: () => this.restaurantState.set('error'),
    });
  }

  show(): void {
    this.open.set(true);
    this.browser?.requestAnimationFrame(() => this.host.nativeElement.querySelector('textarea')?.focus());
  }

  close(restoreFocus = true): void {
    this.open.set(false);
    if (restoreFocus) {
      this.browser?.requestAnimationFrame(() =>
        this.host.nativeElement.querySelector<HTMLButtonElement>('.launcher')?.focus());
    }
  }

  send(mensaje: string): void {
    const user = this.session();
    if (!this.available() || (!user || (this.client() ? !activeClientSession(user) : !activeOperationSession(user))) || this.busy() ||
        !mensaje || mensaje.length > 2000) return;
    this.error.set('');
    this.busy.set(true);
    this.append({ usuario: mensaje });
    this.request = this.http.post<ChatReply>(environment.assistantApiUrl + (this.client() ? '/cliente/chat' : '/admin/chat'),
      this.client() ? { mensaje, restauranteId: this.restaurant.value } : { mensaje, restauranteId: user.restauranteId },
      { headers: { Authorization: 'Bearer ' + user.accessToken }, timeout: CHAT_TIMEOUT_MS },
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: reply => {
        if (this.session() !== user) return;
        this.busy.set(false);
        this.append({ asistente: reply });
      },
      error: (failure: unknown) => {
        if (this.session() !== user) return;
        this.busy.set(false);
        if (!this.draft.value) this.draft.setValue(mensaje);
        const status = failure instanceof HttpErrorResponse ? failure.status : 0;
        if (status === 401) {
          this.error.set('El asistente rechazó la autenticación de esta sesión (401). Tu sesión en RestoPilot sigue activa.');
        } else if (status === 403) {
          this.error.set('Tu cuenta no tiene permiso para consultar el restaurante desde el asistente (403).');
        } else if (status === 0 && failure instanceof HttpErrorResponse &&
          (failure.error?.name === 'TimeoutError' || failure.error?.type === 'timeout')) {
          this.error.set('La consulta superó un minuto. Puedes volver a enviar el mensaje.');
        } else if (status === 502) {
          this.error.set('Gemini no pudo completar la consulta. Puedes volver a enviar el mensaje.');
        } else if (status === 503) {
          this.error.set('El proveedor de IA está deshabilitado en el servidor.');
        } else {
          this.error.set('El asistente no está disponible. Inténtalo de nuevo.');
        }
      },
    });
  }

  resetConversation(): void {
    if (this.busy()) return;
    this.messages.set([]);
    this.error.set('');
    this.draft.reset();
  }

  private append(message: ChatMessage): void {
    this.messages.update(messages => [...messages, message]);
  }
}
