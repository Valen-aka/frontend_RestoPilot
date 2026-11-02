import {Component, DOCUMENT, afterNextRender, computed, inject, input, signal} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CocinaShell} from './cocina-shell';
import {CocinaCard} from './cocina-card';
import {CocinaStore} from './cocina-store';
import {PedidoAction} from './pedido-action';
import {KitchenOrder, MODALITY_LABELS, isActive, kitchenDestination, orderUnits, sampleDate, sampleTime, serviceLabel} from './cocina.model';

@Component({selector: 'rp-cocina-view',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatCardModule, MatTableModule, MatProgressSpinnerModule, CocinaShell, CocinaCard, PedidoAction],
  templateUrl: './cocina-view.html', styleUrl: './cocina-view.css'})
export class CocinaView {
  readonly mode = input<'queue' | 'board' | 'detail' | 'preparation' | 'delivery' | 'delivered'>('queue');
  readonly store = inject(CocinaStore);
  private readonly document = inject(DOCUMENT);
  private readonly navigation = this.document.defaultView?.history.state;
  readonly selectedId = signal<number | undefined>(Number.isSafeInteger(this.navigation?.cocinaOrderId) &&
    this.navigation.cocinaOrderId > 0 ? this.navigation.cocinaOrderId : undefined);
  readonly origin = this.navigation?.cocinaOrigin === 'board' ? 'board' : 'queue';
  readonly returnPath = this.origin === 'board' ? '/operacion/cocina' : '/operacion/pedidos';
  readonly isDetail = computed(() => this.mode() !== 'queue' && this.mode() !== 'board');
  readonly selected = computed(() => this.store.queryState() === 'loading' || this.store.queryState() === 'error' ?
    undefined : this.store.findOrder(this.selectedId()));
  readonly retained = computed(() => {
    if (this.store.queryState() === 'loading' || this.store.queryState() === 'error') return undefined;
    const order = this.store.findOrder(this.store.lastSelectedId());
    return order && !isActive(order) ? order : undefined;
  });
  readonly feedback = computed(() => {
    const message = this.store.actionMessage();
    return message && (!this.isDetail() || message.id === this.selectedId()) ? message : undefined;
  });
  readonly stageMatches = computed(() => {
    const mode = this.mode(), status = this.selected()?.status;
    return mode === 'detail' || (mode === 'preparation' && status === 'En preparación') ||
      (mode === 'delivery' && status === 'Listo') || (mode === 'delivered' && status === 'Entregado');
  });
  readonly groups = computed(() => [
    {label: 'Pendientes', state: 'Pendiente', orders: this.store.displayed().filter(order => order.status === 'Pendiente')},
    {label: 'En preparación', state: 'En preparación', orders: this.store.displayed().filter(order => order.status === 'En preparación')}
  ]);
  readonly title = computed(() => {
    if (this.mode() === 'queue') return 'El servicio en movimiento';
    if (this.mode() === 'board') return 'El ritmo de la cocina';
    const order = this.selected();
    if (!order || !this.stageMatches()) return 'Consulta del pedido';
    if (this.mode() === 'preparation') return `Preparación del pedido #${order.id}`;
    if (this.mode() === 'delivery') return 'Pedido listo para entregar';
    if (this.mode() === 'delivered') return 'Entrega de muestra';
    return `Pedido #${order.id}`;
  });
  readonly subtitle = computed(() => this.mode() === 'queue' ? 'La cola de trabajo del restaurante.' :
    this.mode() === 'board' ? 'Menos ruido. Más coordinación.' : 'La información de la comanda, en un solo lugar.');
  readonly columns = ['id', 'customer', 'modality', 'status', 'total', 'action'];
  readonly detailColumns = ['name', 'quantity', 'unitPrice', 'subtotal'];
  readonly serviceLabel = serviceLabel;
  readonly time = sampleTime;
  readonly date = sampleDate;
  readonly units = orderUnits;
  readonly labels = MODALITY_LABELS;
  readonly trackOrder = (_index: number, order: KitchenOrder) => order.id;
  readonly destination = (order: KitchenOrder) => kitchenDestination(order.status);

  constructor() {
    afterNextRender(() => {
      if (this.isDetail() && this.selected()) this.store.lastSelectedId.set(this.selected()!.id);
      if (this.navigation?.cocinaFocus === true) {
        this.document.getElementById('kitchen-title')?.focus();
      } else if (!this.isDetail()) {
        const id = this.navigation?.cocinaReturnId;
        if (Number.isSafeInteger(id) && id > 0) {
          const link = this.document.querySelector<HTMLAnchorElement>(`a[aria-label="Consultar pedido #${id}"]`);
          (link ?? this.document.getElementById('kitchen-title'))?.focus();
        }
      }
    });
  }
}
