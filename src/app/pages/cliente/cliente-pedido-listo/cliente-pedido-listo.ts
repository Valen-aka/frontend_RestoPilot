import {Component, signal} from '@angular/core';
import {PedidoSelectionView} from '../pedido-ui/pedido-selection-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pedido-listo',imports:[PedidoSelectionView],templateUrl:'./cliente-pedido-listo.html',styleUrl:'./cliente-pedido-listo.css'})
export class ClientePedidoListoPage {
  readonly order = signal<OrderSnapshot>(SAMPLE_ORDER);
  readonly status = signal<OrderStatus>('Listo');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>('paid');
}
