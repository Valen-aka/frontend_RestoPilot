import {DOCUMENT, Injectable, inject, signal} from '@angular/core';
import {OrderSnapshot, SAMPLE_CLIENT_ORDERS} from './pedido.model';

/** Contexto de presentación en memoria. No identifica ni registra pedidos reales. */
@Injectable({providedIn: 'root'})
export class PedidoDemoContext {
  private readonly document = inject(DOCUMENT);
  readonly snapshot = signal<OrderSnapshot | undefined>(undefined);
  readonly orders = signal<readonly OrderSnapshot[]>([]);

  remember(order: OrderSnapshot): OrderSnapshot {
    const id = Math.max(...SAMPLE_CLIENT_ORDERS.map(record => record.order.id), ...this.orders().map(record => record.id)) + 1;
    const snapshot = Object.freeze({...order, id});
    this.orders.update(orders => [snapshot, ...orders]);
    this.snapshot.set(snapshot);
    return snapshot;
  }

  forCurrentNavigation(): OrderSnapshot | undefined {
    const state = this.document.defaultView?.history.state;
    if (state?.us11Demo !== true) return undefined;
    return Object.hasOwn(state, 'pedidoId') ? this.orders().find(order => order.id === state.pedidoId) : this.snapshot();
  }
}
