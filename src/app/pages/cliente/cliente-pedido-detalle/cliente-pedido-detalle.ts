import {Component, signal} from '@angular/core';
import {PedidoView} from '../pedido-ui/pedido-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pedido-detalle',imports:[PedidoView],templateUrl:'./cliente-pedido-detalle.html',styleUrl:'./cliente-pedido-detalle.css'})
export class ClientePedidoDetallePage {
  readonly order = signal<OrderSnapshot>(SAMPLE_ORDER);
  readonly status = signal<OrderStatus>('En preparación');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>('paid');
}
