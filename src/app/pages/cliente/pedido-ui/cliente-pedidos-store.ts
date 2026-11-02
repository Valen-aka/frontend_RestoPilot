import {Injectable, computed, inject, signal} from '@angular/core';
import {PedidoDemoContext} from './pedido-demo-context';
import {ClientOrderRecord, SAMPLE_CLIENT_ID, SAMPLE_CLIENT_ORDERS, clientOrderHistory, findClientOrder, validClientOrder} from './pedido.model';

/** Fuente local de lectura para listado, detalle, seguimiento y pago. */
@Injectable({providedIn: 'root'})
export class ClientePedidosStore {
  private readonly demo = inject(PedidoDemoContext);
  readonly records = signal<readonly ClientOrderRecord[]>(SAMPLE_CLIENT_ORDERS);
  readonly queryState = signal<'ready' | 'loading' | 'error'>('ready');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);
  readonly source = computed<readonly ClientOrderRecord[]>(() => [
    ...this.demo.orders().map(order => ({clientId: SAMPLE_CLIENT_ID, createdAt: '2026-10-20T13:30:00-05:00',
      order, status: 'Pendiente' as const, payment: 'pending' as const})),
    ...this.records()
  ]);
  readonly history = computed(() => clientOrderHistory(this.source()));
  readonly problem = computed(() => {
    const own = this.history();
    return own.some(record => !validClientOrder(record)) || new Set(own.map(record => record.order.id)).size !== own.length ?
      'Los datos de esta consulta están incompletos o contienen pedidos repetidos.' : '';
  });
  find(id: unknown): ClientOrderRecord | undefined {return findClientOrder(this.source(), id);}
  reopenSample(): void {this.queryState.set('ready');}
}
