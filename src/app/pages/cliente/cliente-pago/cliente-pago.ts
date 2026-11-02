import {Component, inject, signal} from '@angular/core';
import {PedidoDemoContext} from '../pedido-ui/pedido-demo-context';
import {PedidoSelectionView} from '../pedido-ui/pedido-selection-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pago',imports:[PedidoSelectionView],templateUrl:'./cliente-pago.html',styleUrl:'./cliente-pago.css'})
export class ClientePagoPage {
  private readonly demoOrder = inject(PedidoDemoContext).forCurrentNavigation();
  readonly order = signal<OrderSnapshot>(this.demoOrder ?? SAMPLE_ORDER);
  readonly status = signal<OrderStatus>(this.demoOrder ? 'Pendiente' : 'En preparación');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>(this.demoOrder ? 'pending' : 'paid');
}
