import {Component, signal} from '@angular/core';
import {PedidoSelectionView} from '../pedido-ui/pedido-selection-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pedido-cancelado',imports:[PedidoSelectionView],templateUrl:'./cliente-pedido-cancelado.html',styleUrl:'./cliente-pedido-cancelado.css'})
export class ClientePedidoCanceladoPage {
  readonly order = signal<OrderSnapshot>(SAMPLE_ORDER);
  readonly status = signal<OrderStatus>('Cancelado');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>('pending');
}
