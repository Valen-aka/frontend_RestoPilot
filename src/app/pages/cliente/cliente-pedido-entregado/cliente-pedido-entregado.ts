import {Component, signal} from '@angular/core';
import {PedidoSelectionView} from '../pedido-ui/pedido-selection-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pedido-entregado',imports:[PedidoSelectionView],templateUrl:'./cliente-pedido-entregado.html',styleUrl:'./cliente-pedido-entregado.css'})
export class ClientePedidoEntregadoPage {
  readonly order = signal<OrderSnapshot>(SAMPLE_ORDER);
  readonly status = signal<OrderStatus>('Entregado');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>('paid');
}
