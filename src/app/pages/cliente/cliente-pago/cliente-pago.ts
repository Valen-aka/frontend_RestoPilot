import {Component, signal} from '@angular/core';
import {PedidoView} from '../pedido-ui/pedido-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pago',imports:[PedidoView],templateUrl:'./cliente-pago.html',styleUrl:'./cliente-pago.css'})
export class ClientePagoPage {
  readonly order = signal<OrderSnapshot>(SAMPLE_ORDER);
  readonly status = signal<OrderStatus>('En preparación');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>('paid');
}
