import {Component, inject, signal} from '@angular/core';
import {PedidoDemoContext} from '../pedido-ui/pedido-demo-context';
import {PedidoSelectionView} from '../pedido-ui/pedido-selection-view';
import {OrderSnapshot, OrderStatus, PaymentState, QueryState, SAMPLE_ORDER} from '../pedido-ui/pedido.model';

/** Entrada del escenario existente; solo presentación de muestra, sin API. */
@Component({selector:'rp-cliente-pedido-detalle',imports:[PedidoSelectionView],templateUrl:'./cliente-pedido-detalle.html',styleUrl:'./cliente-pedido-detalle.css'})
export class ClientePedidoDetallePage {
  private readonly demoOrder = inject(PedidoDemoContext).forCurrentNavigation();
  readonly order = signal<OrderSnapshot>(this.demoOrder ?? SAMPLE_ORDER);
  readonly status = signal<OrderStatus>(this.demoOrder ? 'Pendiente' : 'En preparación');
  readonly queryState = signal<QueryState>('ready');
  readonly payment = signal<PaymentState>(this.demoOrder ? 'pending' : 'paid');
}
