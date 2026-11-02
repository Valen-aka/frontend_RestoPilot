import {Component, signal} from '@angular/core';
import {PedidoView} from '../pedido-ui/pedido-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pago-pendiente',imports:[PedidoView],templateUrl:'./cliente-pago-pendiente.html',styleUrl:'./cliente-pago-pendiente.css'})
export class ClientePagoPendientePage {
  readonly order = signal<OrderSnapshot>(SAMPLE_ORDER);
  readonly status = signal<OrderStatus>('En preparación');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>('pending');
}
