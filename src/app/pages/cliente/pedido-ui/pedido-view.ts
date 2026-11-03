import {afterNextRender, Component, computed, DOCUMENT, inject, input, output} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {EMPTY_ORDER} from './pedido-api.adapter';
import {PedidoProgress} from './pedido-progress';
import {MODALITY_LABELS, OrderSnapshot, OrderStatus, PaymentSnapshot, PaymentState, QueryState,
  validOrderVista, vistaForStatus} from './pedido.model';

@Component({
  selector: 'rp-pedido-view',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatCardModule,
    MatTableModule, MatProgressSpinnerModule, PedidoProgress],
  templateUrl: './pedido-view.html',
  styleUrl: './pedido-view.css'
})
export class PedidoView {
  private readonly document = inject(DOCUMENT);
  readonly order = input<OrderSnapshot>(EMPTY_ORDER);
  readonly status = input<OrderStatus>('En preparación');
  readonly queryState = input<QueryState>('ready');
  readonly mode = input<'order' | 'payment'>('order');
  readonly integrated=input(false);
  readonly sessionConnected=input(false);
  readonly paymentQueryState=input<QueryState>('ready');
  readonly issue=input('');
  readonly paymentIssue=input('');
  readonly retryRequested=output<void>();
  readonly logoutRequested=output<void>();
  readonly payment = input<PaymentState>('paid');
  readonly paymentRecord = input<PaymentSnapshot | undefined>();
  readonly effectivePayment = computed(() =>
    this.payment() === 'paid' && this.paymentRecord()?.orderId !== this.order().id ? 'missing' : this.payment());
  readonly columns = ['name', 'quantity', 'unitPrice', 'subtotal'];
  readonly labels = MODALITY_LABELS;

  readonly receivedState = inject(Router).currentNavigation()?.extras.state ?? this.document.defaultView?.history.state ?? {};
  readonly selectionState = Object.hasOwn(this.receivedState, 'pedidoId') ? {pedidoId: this.receivedState['pedidoId']} : {};
  readonly backVista = computed(() => Object.hasOwn(this.receivedState, 'pedidoId') ? vistaForStatus(this.status()) : validOrderVista(this.receivedState?.['pedidoVista']));
  readonly paymentQuery = computed(() => ({
    ...(this.integrated()?{pedidoId:this.order().id}:{}),
    vista: this.payment() === 'pending' || this.status() === 'Cancelado' ? 'cliente-pago-pendiente' : 'cliente-pago'
  }));
  readonly orderQuery=computed(()=>({vista:this.backVista(),...(this.integrated()?{pedidoId:this.order().id}:{})}));
  readonly navigationState = computed(() => ({pedidoVista: vistaForStatus(this.status()), ...this.selectionState}));
  readonly returnState = this.selectionState;
  readonly unitCount = computed(() => this.order().lines.reduce((sum, line) => sum + line.quantity, 0));
  readonly title = computed(() => {
    if (this.queryState() === 'missing-id') return 'Selecciona un pedido';
    if (this.queryState() === 'unauthenticated') return 'Inicia sesión para consultar tus pedidos';
    if (this.queryState() === 'forbidden') return 'Acceso restringido';
    if (this.queryState() === 'not-found') return 'No se encontró el pedido';
    if (this.queryState() === 'error') return 'No pudimos mostrar tu pedido';
    if (this.queryState() === 'loading') return 'Consultando tu pedido';
    if (this.mode() === 'payment') {
      if(this.paymentQueryState()==='loading')return 'Consultando el pago';
      if(this.paymentQueryState()==='error')return 'No pudimos mostrar el pago';
      return this.effectivePayment() === 'paid' ? 'El registro de tu pago' :
        this.effectivePayment() === 'pending' ? 'Tu pago está pendiente' : 'Sin registro de pago';
    }
    switch (this.status()) {
      case 'Pendiente': return 'Tu pedido está pendiente';
      case 'Listo': return 'Tu pedido está listo';
      case 'Entregado': return 'Esperamos que lo hayas disfrutado';
      case 'Cancelado': return 'Pedido cancelado';
      default: return 'Estamos preparando algo bueno';
    }
  });

  constructor() {
    afterNextRender(() => {
      if (Object.hasOwn(this.receivedState, 'pedidoId')) this.document.getElementById('pedido-title')?.focus();
    });
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('pedido-contenido');
    main?.focus({preventScroll: true});
    main?.scrollIntoView({block: 'start'});
  }
}
