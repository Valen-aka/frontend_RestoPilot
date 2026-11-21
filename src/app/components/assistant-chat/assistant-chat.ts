import { DOCUMENT, KeyValuePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

interface ChatReply {
  estado: 'ANSWER' | 'CLARIFICATION_REQUIRED' | 'NO_DATA';
  mensaje: string;
  datos?: {
    fechaInicio: string;
    fechaFin: string;
    moneda: string | null;
    platosMasVendidos?: string[] | null;
    estadoPagos?: {
      montoTotal: number;
      pedidosPagados: number;
      pagosPendientes: number;
      metodosPagoUtilizados: Record<string, number>;
    } | null;
  } | null;
}

type ChatMessage = { usuario: string } | { asistente: ChatReply };
interface Dictation {
  lang: string;
  onresult?: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend?: () => void;
  onerror?: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

@Component({
  selector: 'rp-assistant-chat',
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, KeyValuePipe],
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
  private readonly Dictation = (this.browser as (Window & {
    SpeechRecognition?: new () => Dictation;
    webkitSpeechRecognition?: new () => Dictation;
  }) | null)?.SpeechRecognition ?? (this.browser as (Window & {
    webkitSpeechRecognition?: new () => Dictation;
  }) | null)?.webkitSpeechRecognition;
  private recognition?: Dictation;
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
  readonly listening = signal(false);
  readonly error = signal('');
  readonly messages = signal<ChatMessage[]>([]);
  readonly draft = new FormControl('', { nonNullable: true });
  readonly composer = new FormGroup({ mensaje: this.draft });
  readonly canDictate = !!this.Dictation;
  readonly canSpeak = !!this.browser?.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';
  private readonly money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

  constructor() {
    effect(onCleanup => {
      this.session();
      onCleanup(() => {
        this.request?.unsubscribe();
        this.restaurantRequest?.unsubscribe();
        this.restaurants.set([]);
        this.restaurant.reset();
        this.restaurantState.set('idle');
        this.stopAudio();
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
    this.stopAudio();
    if (restoreFocus) {
      this.browser?.requestAnimationFrame(() =>
        this.host.nativeElement.querySelector<HTMLButtonElement>('.launcher')?.focus());
    }
  }

  send(): void {
    const user = this.session();
    const mensaje = this.draft.value.trim();
    if (!this.available() || (!user || (this.client() ? !activeClientSession(user) : !activeOperationSession(user))) || this.busy() || this.listening() ||
        !mensaje || mensaje.length > 2000) return;
    this.error.set('');
    this.busy.set(true);
    this.draft.reset();
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

  dictate(): void {
    if (this.listening()) {
      this.recognition?.stop();
      return;
    }
    if (!this.Dictation) return;
    this.error.set('');
    const recognition = new this.Dictation();
    const initial = this.draft.value.trim();
    this.recognition = recognition;
    recognition.lang = 'es-PE';
    recognition.onresult = event => {
      if (this.recognition !== recognition) return;
      const text = Array.from(event.results, result => result[0].transcript).join(' ');
      this.draft.setValue([initial, text].filter(Boolean).join(' ').slice(0, 2000));
    };
    recognition.onend = () => this.finishDictation(recognition);
    recognition.onerror = () => {
      if (this.recognition !== recognition) return;
      this.finishDictation(recognition);
      this.error.set('No se pudo usar el micrófono. Puedes escribir el mensaje.');
    };
    try {
      recognition.start();
      this.listening.set(true);
    } catch {
      recognition.onerror();
    }
  }

  speak(reply: ChatReply): void {
    const synthesis = this.browser?.speechSynthesis;
    if (!this.canSpeak || !synthesis) return;
    synthesis.cancel();
    const data = reply.datos;
    const amounts = data?.estadoPagos;
    const details = amounts
      ? `Monto confirmado: ${this.formatMoney(amounts.montoTotal)}. ${amounts.pedidosPagados} pagados, ${amounts.pagosPendientes} pendientes.`
      : data?.platosMasVendidos?.join('. ') ?? '';
    const speech = new SpeechSynthesisUtterance([reply.mensaje, details].filter(Boolean).join(' '));
    speech.lang = 'es-PE';
    synthesis.speak(speech);
  }

  formatMoney(amount: number): string {
    return this.money.format(amount);
  }

  private finishDictation(recognition: Dictation): void {
    if (this.recognition !== recognition) return;
    this.recognition = undefined;
    this.listening.set(false);
  }

  private stopAudio(): void {
    const recognition = this.recognition;
    this.recognition = undefined;
    recognition?.abort();
    this.listening.set(false);
    this.browser?.speechSynthesis?.cancel();
  }

  private append(message: ChatMessage): void {
    this.messages.update(messages => [...messages, message]);
    this.browser?.requestAnimationFrame(() => {
      const log = this.host.nativeElement.querySelector('.chat-log');
      if (log) log.scrollTop = log.scrollHeight;
    });
  }
}
