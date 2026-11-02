import {Component, inject, signal} from '@angular/core';
import {PedidoDemoContext} from '../pedido-ui/pedido-demo-context';
import {PedidoView} from '../pedido-ui/pedido-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pago-pendiente',imports:[PedidoView],templateUrl:'./cliente-pago-pendiente.html',styleUrl:'./cliente-pago-pendiente.css'})
export class ClientePagoPendientePage {
  private readonly demoOrder = inject(PedidoDemoContext).forCurrentNavigation();
  readonly order = signal<OrderSnapshot>(this.demoOrder ?? SAMPLE_ORDER);
  readonly status = signal<OrderStatus>(this.demoOrder ? 'Pendiente' : 'En preparación');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>('pending');
}
