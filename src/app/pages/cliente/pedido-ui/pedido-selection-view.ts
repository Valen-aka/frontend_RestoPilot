import {Component, computed, DOCUMENT, inject, input} from '@angular/core';
import {Router} from '@angular/router';
import {PedidoView} from './pedido-view';
import {ClientePedidosStore} from './cliente-pedidos-store';
import {OrderSnapshot, OrderStatus, PaymentSnapshot, PaymentState, QueryState, SAMPLE_ORDER, SAMPLE_PAYMENT} from './pedido.model';

@Component({selector: 'rp-pedido-selection-view', imports: [PedidoView],
  templateUrl: './pedido-selection-view.html', styleUrl: './pedido-selection-view.css'})
export class PedidoSelectionView {
  readonly order = input<OrderSnapshot>(SAMPLE_ORDER);
  readonly status = input<OrderStatus>('En preparación');
  readonly queryState = input<QueryState>('ready');
  readonly payment = input<PaymentState>('paid');
  readonly paymentRecord = input<PaymentSnapshot | undefined>(SAMPLE_PAYMENT);
  readonly mode = input<'order' | 'payment'>('order');
  readonly store = inject(ClientePedidosStore);
  private readonly router = inject(Router);
  private readonly state = this.router.currentNavigation()?.extras.state ?? inject(DOCUMENT).defaultView?.history.state ?? {};
  readonly fromHistory = Object.hasOwn(this.state, 'pedidoId');
  readonly selected = computed(() => this.fromHistory ? this.store.find(this.state['pedidoId']) : undefined);
  readonly selectedQuery = computed<QueryState>(() => !this.fromHistory ? this.queryState() :
    this.store.queryState() !== 'ready' ? this.store.queryState() : this.store.problem() ? 'error' : this.selected() ? 'ready' : 'not-found');
}
