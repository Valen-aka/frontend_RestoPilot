import {Injectable, computed, signal} from '@angular/core';
import {KitchenCommand, KitchenOrder, KitchenTransition, SAMPLE_ORDERS, SAMPLE_RESTAURANT,
  isActive, prioritizeSample, transitionSample, validKitchenOrder} from './cocina.model';

/** Estado de presentación en memoria; no autentica ni modifica pedidos reales. */
@Injectable({providedIn: 'root'})
export class CocinaStore {
  readonly orders = signal<readonly KitchenOrder[]>(SAMPLE_ORDERS);
  readonly queryState = signal<'ready' | 'loading' | 'error' | 'stale'>('ready');
  readonly previousOrders = signal<readonly KitchenOrder[]>([]);
  readonly previousAllOrders = signal<readonly KitchenOrder[]>([]);
  readonly actionBusy = signal(false);
  readonly updateFailure = signal(false);
  readonly lastSelectedId = signal<number | undefined>(undefined);
  readonly actionMessage = signal<{id: number; kind: 'success' | 'error'; text: string} | undefined>(undefined);
  readonly problem = computed(() => {
    const own = this.orders().filter(order => order.restaurantId === SAMPLE_RESTAURANT);
    return own.some(order => !validKitchenOrder(order)) || new Set(own.map(order => order.id)).size !== own.length ?
      'Los datos de muestra están incompletos o contienen identificadores repetidos. No podemos confirmar su prioridad.' : '';
  });
  readonly queue = computed(() => this.problem() ? [] : prioritizeSample(this.orders()
    .filter(order => order.restaurantId === SAMPLE_RESTAURANT && isActive(order))));
  readonly displayed = computed(() => this.queryState() === 'stale' ? this.previousOrders() : this.queue());

  findOrder(id: number | undefined): KitchenOrder | undefined {
    if (!Number.isSafeInteger(id) || !id || id < 1) return undefined;
    const source = this.queryState() === 'stale' ? this.previousAllOrders() : this.orders();
    const matches = source.filter(order => order.id === id && order.restaurantId === SAMPLE_RESTAURANT);
    return matches.length === 1 && validKitchenOrder(matches[0]) ? matches[0] : undefined;
  }

  applyTransition(command: KitchenCommand): KitchenTransition {
    let result: KitchenTransition;
    if (this.queryState() !== 'ready' || this.problem()) {
      result = {ok: false, orders: this.orders(), reason: 'La consulta no está disponible como lectura actual. Reabre la muestra antes de cambiar su estado.'};
    } else if (this.updateFailure()) {
      result = {ok: false, orders: this.orders(), reason: 'No se pudo aplicar el cambio de muestra. Se conserva el último estado confirmado; puedes revisar el pedido y volver a intentarlo.'};
    } else {
      result = transitionSample(this.orders(), command);
    }
    if (result.ok) {
      this.orders.set(result.orders);
      this.lastSelectedId.set(result.order.id);
      this.actionMessage.set({id: command.id, kind: 'success', text: `Cambio de muestra aplicado: ${result.order.status}. No se enviaron notificaciones.`});
    } else {
      this.actionMessage.set({id: command.id, kind: 'error', text: result.reason});
    }
    return result;
  }

  /** Entrada de prueba; no lanza una petición. */
  showRefreshError(): void {
    this.previousOrders.set(this.queue());
    this.previousAllOrders.set(this.orders());
    this.queryState.set('stale');
  }

  reopenSample(): void {
    this.queryState.set('ready');
  }
}
