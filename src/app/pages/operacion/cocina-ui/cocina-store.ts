import {Injectable, computed, signal} from '@angular/core';
import {KitchenOrder, SAMPLE_ORDERS, SAMPLE_RESTAURANT, isActive, prioritizeSample, validKitchenOrder} from './cocina.model';

/** Consulta local de presentación; no autentica ni modifica pedidos. */
@Injectable({providedIn: 'root'})
export class CocinaStore {
  readonly orders = signal<readonly KitchenOrder[]>(SAMPLE_ORDERS);
  readonly queryState = signal<'ready' | 'loading' | 'error' | 'stale'>('ready');
  readonly previousOrders = signal<readonly KitchenOrder[]>([]);
  readonly problem = computed(() => {
    const own = this.orders().filter(order => order.restaurantId === SAMPLE_RESTAURANT);
    return own.some(order => !validKitchenOrder(order)) || new Set(own.map(order => order.id)).size !== own.length ?
      'Los datos de muestra están incompletos o contienen identificadores repetidos. No podemos confirmar su prioridad.' : '';
  });
  readonly queue = computed(() => this.problem() ? [] : prioritizeSample(this.orders()
    .filter(order => order.restaurantId === SAMPLE_RESTAURANT && isActive(order))));
  readonly displayed = computed(() => this.queryState() === 'stale' ? this.previousOrders() : this.queue());

  /** Entrada para comprobar un error de actualización; no lanza una petición. */
  showRefreshError(): void {
    this.previousOrders.set(this.queue());
    this.queryState.set('stale');
  }

  reopenSample(): void {
    this.queryState.set('ready');
  }
}
