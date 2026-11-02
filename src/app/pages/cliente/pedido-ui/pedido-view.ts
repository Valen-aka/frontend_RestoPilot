import {Component, computed, DOCUMENT, inject, input} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PedidoProgress} from './pedido-progress';
import {MODALITY_LABELS, OrderSnapshot, OrderStatus, PaymentSnapshot, PaymentState, QueryState,
  SAMPLE_ORDER, SAMPLE_PAYMENT, validOrderVista, vistaForStatus} from './pedido.model';

@Component({
  selector: 'rp-pedido-view',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatCardModule,
    MatTableModule, MatProgressSpinnerModule, PedidoProgress],
  templateUrl: './pedido-view.html',
  styleUrl: './pedido-view.css'
})
export class PedidoView {
  private readonly document = inject(DOCUMENT);
  readonly order = input<OrderSnapshot>(SAMPLE_ORDER);
  readonly status = input<OrderStatus>('En preparación');
  readonly queryState = input<QueryState>('ready');
  readonly mode = input<'order' | 'payment'>('order');
  readonly payment = input<PaymentState>('paid');
  readonly paymentRecord = input<PaymentSnapshot | undefined>(SAMPLE_PAYMENT);
  readonly effectivePayment = computed(() =>
    this.payment() === 'paid' && this.paymentRecord()?.orderId !== this.order().id ? 'missing' : this.payment());
  readonly columns = ['name', 'quantity', 'unitPrice', 'subtotal'];
  readonly labels = MODALITY_LABELS;
  readonly receivedState = this.document.defaultView?.history.state;
  readonly backVista = validOrderVista(this.receivedState?.pedidoVista);
  readonly paymentQuery = computed(() => ({
    vista: this.status() === 'Cancelado' ? 'cliente-pago-pendiente' : 'cliente-pago'
  }));
  readonly navigationState = computed(() => ({pedidoVista: vistaForStatus(this.status())}));
  readonly title = computed(() => {
    if (this.queryState() === 'not-found') return 'No se encontró el pedido';
    if (this.queryState() === 'error') return 'No pudimos mostrar tu pedido';
    if (this.queryState() === 'loading') return 'Consultando tu pedido';
    if (this.mode() === 'payment') {
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

  skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('pedido-contenido');
    main?.focus({preventScroll: true});
    main?.scrollIntoView({block: 'start'});
  }
}
