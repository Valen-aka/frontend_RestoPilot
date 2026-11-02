import {Injectable, computed, inject, signal} from '@angular/core';
import {ReservaMuestraStore} from '../reserva-muestra-ui/reserva-muestra-store';
import {ExpiryContext, ExpiryReservation, belongsToExpiryContext, expiredHistory, validExpiryReservation} from './reserva-expirada.model';

@Injectable({providedIn: 'root'})
export class ReservaExpiradaStore {
  readonly reservations = inject(ReservaMuestraStore).reservations;
  readonly queryState = signal<'ready' | 'loading' | 'error' | 'stale'>('ready');
  readonly previous = signal<readonly ExpiryReservation[]>([]);
  readonly selectedIds = signal<Record<ExpiryContext, number | undefined>>({client: 207, operation: 207});
  readonly source = computed(() => this.queryState() === 'stale' ? this.previous() : this.reservations());

  history(context: ExpiryContext): ExpiryReservation[] {return expiredHistory(this.source(), context);}
  find(context: ExpiryContext): ExpiryReservation | undefined {
    const id = this.selectedIds()[context];
    const matches = this.source().filter(r => r.id === id && belongsToExpiryContext(r, context));
    return matches.length === 1 ? matches[0] : undefined;
  }
  problem(context: ExpiryContext): string {
    const visible = this.source().filter(r => belongsToExpiryContext(r, context));
    return visible.some(r => !validExpiryReservation(r)) || new Set(visible.map(r => r.id)).size !== visible.length ?
      'Los datos de esta consulta están incompletos o tienen identificadores repetidos.' : '';
  }
  select(context: ExpiryContext, id: number | undefined): void {
    this.selectedIds.update(ids => ({...ids, [context]: id}));
  }
  showRefreshError(): void {this.previous.set(this.reservations());this.queryState.set('stale');}
  reopenSample(): void {this.queryState.set('ready');}
}
