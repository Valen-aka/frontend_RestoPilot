import { DOCUMENT, KeyValuePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChatMessage, ChatReply } from './chat-message.model';

interface Dictation {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult?: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend?: () => void;
  onerror?: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

let nextPanelId = 0;

@Component({
  selector: 'rp-chat-panel',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, KeyValuePipe],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.css',
})
export class ChatPanel {
  readonly title = input('Asistente');
  readonly greeting = input('Hola. ¿En qué puedo ayudarte?');
  readonly welcomeTitle = input('Tu carta, conversada.');
  readonly suggestions = input<readonly string[]>([]);
  readonly messages = input<readonly ChatMessage[]>([]);
  readonly busy = input(false);
  readonly sendBlocked = input(false);
  readonly contextKey = input<number | null>(null);
  readonly error = input('');
  readonly draft = input(new FormControl('', { nonNullable: true }));
  readonly messageSent = output<string>();
  readonly closed = output<void>();
  readonly resetRequested = output<void>();
  readonly titleId = `chat-title-${++nextPanelId}`;
  readonly helpId = `${this.titleId}-help`;
  readonly listening = signal(false);
  readonly speaking = signal(false);
  readonly voiceError = signal('');
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private utterance?: SpeechSynthesisUtterance;
  private readonly Dictation = (this.browser as (Window & {
    SpeechRecognition?: new () => Dictation;
    webkitSpeechRecognition?: new () => Dictation;
  }) | null)?.SpeechRecognition ?? (this.browser as (Window & {
    webkitSpeechRecognition?: new () => Dictation;
  }) | null)?.webkitSpeechRecognition;
  private recognition?: Dictation;
  readonly canDictate = !!this.Dictation;
  readonly canSpeak = !!this.browser?.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';
  private readonly money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

  constructor() {
    this.destroyRef.onDestroy(() => this.stopAudio());
    effect(() => {
      this.contextKey();
      this.stopAudio();
      this.voiceError.set('');
    });
    effect(() => {
      const hasMessages = this.messages().length > 0;
      this.busy();
      this.browser?.requestAnimationFrame(() => {
        if (this.destroyRef.destroyed) return;
        const log = this.host.nativeElement.querySelector('.chat-log');
        if (log) log.scrollTop = hasMessages ? log.scrollHeight : 0;
      });
    });
  }

  send(): void {
    const text = this.draft().value.trim();
    if (this.busy() || this.sendBlocked() || this.listening() || !text || text.length > 2000) return;
    this.voiceError.set('');
    this.stopSpeaking();
    this.draft().reset();
    this.messageSent.emit(text);
    this.focusComposer();
  }

  close(): void {
    this.stopAudio();
    this.closed.emit();
  }

  chooseSuggestion(text: string): void {
    if (this.busy() || this.listening()) return;
    this.draft().setValue(text.slice(0, 2000));
    this.focusComposer();
  }

  newConversation(): void {
    if (this.busy()) return;
    this.stopAudio();
    this.voiceError.set('');
    this.draft().reset();
    this.resetRequested.emit();
    this.focusComposer();
  }

  private focusComposer(): void {
    this.browser?.requestAnimationFrame(() => {
      if (!this.destroyRef.destroyed) this.host.nativeElement.querySelector('textarea')?.focus();
    });
  }

  stopSpeaking(): void {
    this.utterance = undefined;
    this.speaking.set(false);
    this.browser?.speechSynthesis?.cancel();
  }

  dictate(): void {
    if (this.listening()) {
      this.recognition?.stop();
      return;
    }
    if (!this.Dictation || this.busy()) return;
    this.stopSpeaking();
    this.voiceError.set('');
    const recognition = new this.Dictation();
    const initial = this.draft().value.trim();
    this.recognition = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-PE';
    recognition.onresult = event => {
      if (this.recognition !== recognition) return;
      const text = Array.from(event.results, result => result[0].transcript).join(' ');
      this.draft().setValue([initial, text].filter(Boolean).join(' ').slice(0, 2000));
    };
    recognition.onend = () => this.finishDictation(recognition);
    recognition.onerror = () => {
      if (this.recognition !== recognition) return;
      this.finishDictation(recognition);
      this.voiceError.set('No se pudo usar el micrófono. Puedes escribir el mensaje.');
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
    this.stopAudio();
    this.voiceError.set('');
    synthesis.cancel();
    const data = reply.datos;
    const amounts = data?.estadoPagos;
    const details = amounts
      ? `Monto confirmado: ${this.formatMoney(amounts.montoTotal)}. ${amounts.pedidosPagados} pagados, ${amounts.pagosPendientes} pendientes.`
      : data?.platosMasVendidos?.join('. ') ?? '';
    const speech = new SpeechSynthesisUtterance([reply.mensaje, details].filter(Boolean).join(' '));
    speech.lang = 'es-PE';
    this.utterance = speech;
    speech.onend = () => { if (this.utterance === speech) this.stopSpeaking(); };
    speech.onerror = () => {
      if (this.utterance !== speech) return;
      this.stopSpeaking();
      this.voiceError.set('No se pudo leer la respuesta. Puedes leerla en el chat.');
    };
    this.speaking.set(true);
    try { synthesis.speak(speech); } catch { speech.onerror?.(new Event('error') as SpeechSynthesisErrorEvent); }
  }

  formatMoney(amount: number): string {
    return this.money.format(amount);
  }

  private finishDictation(recognition: Dictation): void {
    if (this.recognition !== recognition) return;
    this.recognition = undefined;
    this.listening.set(false);
    this.focusComposer();
  }

  private stopAudio(): void {
    const recognition = this.recognition;
    this.recognition = undefined;
    recognition?.abort();
    this.listening.set(false);
    this.stopSpeaking();
  }

}
