import { ChatPanel } from '../chat-panel/chat-panel';
import { ChatMessage, ChatReply } from '../chat-panel/chat-message.model';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CatalogoService } from '../../core/services/catalogo.service';
import { AssistantClientService } from '../../core/services/assistant-client.service';
import { clientChatErrorMessage } from '../../core/models/assistant-client-error';
import { RestauranteResponse } from '../../core/models/catalogo-api.model';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { activeClientSession, activeOperationSession, API_SESSION } from '../../core/auth/api-session';

const CHAT_TIMEOUT_MS = 60_000;

@Component({
  selector: 'rp-assistant-chat',
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, MatInputModule, ReactiveFormsModule, ChatPanel],
  templateUrl: './assistant-chat.html',
  styleUrl: './assistant-chat.css',
})
export class AssistantChat {
  private readonly http = inject(HttpClient);
  private readonly clientApi = inject(AssistantClientService);
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
  private contextVersion = 0;

  private restaurantRequest?: Subscription;
  readonly client = computed(() => /^\/cliente(\/|[?#]|$)/.test(this.route()) && activeClientSession(this.session()));
  readonly available = computed(() => !!environment.assistantApiUrl && (this.client() ||
    /^\/(dueno|operacion)(\/|[?#]|$)/.test(this.route()) && activeOperationSession(this.session())));
  readonly restaurants = signal<readonly RestauranteResponse[]>([]);
  readonly restaurant = new FormControl<number | null>(null);
  private readonly selectedRestaurantId = toSignal(this.restaurant.valueChanges, { initialValue: null });
  readonly selectedRestaurant = computed(() => this.restaurants().find(local => local.id === this.selectedRestaurantId()) ?? null);
  readonly restaurantState = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly choosingRestaurant = signal(false);
  readonly restaurantSearch = new FormControl('', { nonNullable: true });
  private readonly search = toSignal(this.restaurantSearch.valueChanges, { initialValue: '' });
  readonly matchingRestaurants = computed(() => {
    const query = this.normalize(this.search());
    return this.restaurants().filter(local => this.normalize(local.nombre).includes(query));
  });
  private pendingQuestion = '';
  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  chooseRestaurant(id: number): void {
    if (this.busy() || !this.restaurants().some(local => local.id === id)) return;
    const question = this.pendingQuestion;
    this.restaurant.setValue(id);
    this.choosingRestaurant.set(false);
    this.restaurantSearch.reset();
    this.pendingQuestion = '';
    this.append({ asistente: { estado: 'ANSWER', mensaje: 'Ahora consultamos ' + this.selectedRestaurant()!.nombre + '.' } });
    if (question) this.send(question);
  }
  useAccount(): void {
    if (this.busy()) return;
    this.restaurant.setValue(null);
    this.pendingQuestion = '';
    this.restaurantSearch.reset();
    this.choosingRestaurant.set(false);
  }
  readonly open = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly draft = new FormControl('', { nonNullable: true });
  constructor() {
    this.restaurant.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.contextVersion++;
      this.request?.unsubscribe();
      this.busy.set(false);
      this.error.set('');
    });
    effect(onCleanup => {
      this.session();
      this.client();
      onCleanup(() => {
        this.clearConversation();
        this.restaurantRequest?.unsubscribe();
        this.restaurants.set([]);
        this.restaurant.reset(null, { emitEvent: true });
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
    const user = this.session();
    this.restaurantRequest = this.catalog.restaurantes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: restaurants => {
        if (this.session() !== user || !this.client()) return;
        this.restaurants.set(restaurants.filter(restaurant => restaurant.activo));
        if (!this.restaurants().some(local => local.id === this.restaurant.value)) this.restaurant.reset();
        this.restaurantState.set('ready');
      },
      error: () => { if (this.session() === user && this.client()) this.restaurantState.set('error'); },
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
    mensaje = mensaje.trim();
    const user = this.session();
    if (this.busy()) return;
    if (!this.available() || (!user || (this.client() ? !activeClientSession(user) : !activeOperationSession(user))) ||
        !mensaje || mensaje.length > 2000) {
      if (!this.draft.value) this.draft.setValue(mensaje);
      this.error.set('Revisa tu sesión y el mensaje antes de enviar.');
      return;
    }
    if (this.client() && this.choosingRestaurant()) {
      const name = this.normalize(mensaje).replace(/^(elige|selecciona|cambia a|quiero)\s+/, '');
      const exact = this.restaurants().filter(local => this.normalize(local.nombre) === name);
      const matches = exact.length ? exact : name.length >= 3
        ? this.restaurants().filter(local => this.normalize(local.nombre).includes(name)) : [];
      if (matches.length === 1) { this.chooseRestaurant(matches[0].id); return; }
      if (/restaurante|cambiar|elegir|seleccionar/.test(name)) {
        this.restaurantSearch.setValue('');
      } else if (!/pedido|reserva|cancel|backend|servidor|clave|contrasena/.test(name)) {
        this.restaurantSearch.setValue(mensaje);
        return;
      }
    }
    if (this.client() && /^(cambiar|elegir|seleccionar) (el )?restaurante[.!?]*$/i.test(mensaje)) {
      this.choosingRestaurant.set(true);
      this.pendingQuestion = '';
      return;
    }
    const isClient = this.client();
    const restaurantId = isClient ? this.selectedRestaurant()?.id ?? null : user.restauranteId!;
    const version = this.contextVersion;
    this.error.set('');
    this.busy.set(true);
    this.append({ usuario: mensaje });
    const response: Observable<ChatReply> = isClient ? this.clientApi.send({ mensaje, restauranteId: restaurantId })
      : this.http.post<ChatReply>(environment.assistantApiUrl + '/admin/chat',
      { mensaje, restauranteId: restaurantId },
      { headers: { Authorization: 'Bearer ' + user.accessToken }, timeout: CHAT_TIMEOUT_MS },
    );
    this.request = response.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: reply => {
        if (this.session() !== user || version !== this.contextVersion || this.client() !== isClient) return;
        this.busy.set(false);
        this.append({ asistente: reply });
        if (isClient && reply.estado === 'CLARIFICATION_REQUIRED' &&
            /selecciona|elige/i.test(reply.mensaje) && /restaurante/i.test(reply.mensaje)) {
          this.pendingQuestion = mensaje;
          this.restaurantSearch.reset();
          this.choosingRestaurant.set(true);
        }
      },
      error: (failure: unknown) => {
        if (this.session() !== user || version !== this.contextVersion || this.client() !== isClient) return;
        this.busy.set(false);
        if (isClient) {
          this.error.set(clientChatErrorMessage(failure));
          return;
        }
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
    this.clearConversation();
    this.draft.reset();
  }

  private clearConversation(): void {
    this.pendingQuestion = '';
    this.choosingRestaurant.set(false);
    this.restaurantSearch.reset();
    this.contextVersion++;
    this.request?.unsubscribe();
    this.request = undefined;
    this.busy.set(false);
    this.messages.set([]);
    this.error.set('');
  }

  private append(message: ChatMessage): void {
    this.messages.update(messages => [...messages, message]);
  }
}
