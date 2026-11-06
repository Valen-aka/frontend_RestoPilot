import {DestroyRef, inject, signal} from '@angular/core';

export type PreviewResult = 'success' | 'error' | 'duplicate' | 'forbidden' | 'empty' | 'expired';
export type PreviewPhase = 'idle' | 'loading' | PreviewResult;

/** UI-only scenario controller. It never sends HTTP or creates an authentication session. */
export class PreviewOperation {
  readonly outcome = signal<PreviewResult>('success');
  readonly phase = signal<PreviewPhase>('idle');
  readonly busy = signal(false);
  private timer?: ReturnType<typeof setTimeout>;
  constructor(destroy: DestroyRef = inject(DestroyRef)) { destroy.onDestroy(() => this.reset()); }
  run(done?: (result: PreviewResult) => void): void {
    if (this.busy()) return;
    const result = this.outcome();
    this.phase.set('loading'); this.busy.set(true);
    this.timer = setTimeout(() => {
      this.busy.set(false); this.phase.set(result); this.timer = undefined; done?.(result);
    }, 600);
  }
  reset(): void { clearTimeout(this.timer); this.busy.set(false); this.phase.set('idle'); }
}
