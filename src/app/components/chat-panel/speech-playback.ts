import { selectSpeechVoice } from './speech-voice';

export type PlaybackState = 'idle' | 'loading' | 'speaking';

/** Owns one utterance and its listeners; late browser events cannot revive a stopped reply. */
export class SpeechPlayback {
  private current?: SpeechSynthesisUtterance;
  private timer?: ReturnType<typeof setTimeout>;
  private voicesReady?: () => void;

  constructor(
    private readonly synthesis: SpeechSynthesis,
    private readonly createUtterance: (text: string) => SpeechSynthesisUtterance,
    private readonly state: (state: PlaybackState) => void,
    private readonly error: (message: string) => void,
  ) { synthesis.getVoices(); }

  stop(): void {
    this.current = undefined;
    this.cleanup();
    this.state('idle');
    this.synthesis.cancel();
  }

  play(text: string): void {
    this.stop();
    this.error('');
    const speech = this.createUtterance(text);
    this.current = speech;
    this.state('loading');
    const fail = (message: string) => {
      if (this.current !== speech) return;
      this.stop();
      this.error(message);
    };
    speech.onstart = () => {
      if (this.current !== speech) return;
      this.cleanup();
      this.state('speaking');
    };
    speech.onend = () => { if (this.current === speech) this.stop(); };
    speech.onerror = event => fail(event.error === 'not-allowed'
      ? 'Chrome bloqueó la lectura. Permite el sonido del sitio y vuelve a pulsar Escuchar respuesta.'
      : 'No se pudo reproducir la voz. Revisa la salida de audio y vuelve a intentarlo.');

    const start = () => {
      if (this.current !== speech) return;
      const voice = selectSpeechVoice(this.synthesis.getVoices());
      if (!voice) return;
      this.cleanup();
      speech.voice = voice;
      speech.lang = voice.lang;
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      this.timer = setTimeout(() => fail('La voz no llegó a iniciarse. Revisa que Chrome permita sonido y que Windows tenga una salida de audio activa.'), 8000);
      try {
        if (this.synthesis.paused) this.synthesis.resume();
        this.synthesis.speak(speech);
      } catch { fail('No se pudo iniciar la lectura. Vuelve a pulsar Escuchar respuesta.'); }
    };
    if (this.synthesis.getVoices().length) start();
    else {
      this.voicesReady = start;
      this.synthesis.addEventListener('voiceschanged', start);
      this.timer = setTimeout(() => fail('No hay una voz disponible. Activa una voz en Windows y vuelve a abrir Chrome.'), 5000);
      start();
    }
  }

  private cleanup(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    if (this.voicesReady) this.synthesis.removeEventListener('voiceschanged', this.voicesReady);
    this.voicesReady = undefined;
  }
}
