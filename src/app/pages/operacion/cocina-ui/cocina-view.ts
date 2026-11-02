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
import {KitchenOrder, MODALITY_LABELS, orderUnits, sampleDate, sampleTime, serviceLabel} from './cocina.model';

@Component({selector: 'rp-cocina-view',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatCardModule, MatTableModule, MatProgressSpinnerModule, CocinaShell, CocinaCard],
  templateUrl: './cocina-view.html', styleUrl: './cocina-view.css'})
export class CocinaView {
  readonly mode = input<'queue' | 'board' | 'detail'>('queue');
  readonly store = inject(CocinaStore);
  private readonly document = inject(DOCUMENT);
  private readonly navigation = this.document.defaultView?.history.state;
  readonly selectedId = signal<number | undefined>(Number.isSafeInteger(this.navigation?.cocinaOrderId) &&
    this.navigation.cocinaOrderId > 0 ? this.navigation.cocinaOrderId : undefined);
  readonly origin = this.navigation?.cocinaOrigin === 'board' ? 'board' : 'queue';
  readonly returnPath = this.origin === 'board' ? '/operacion/cocina' : '/operacion/pedidos';
  readonly selected = computed(() => this.store.queryState() === 'loading' || this.store.queryState() === 'error' ?
    undefined : this.store.displayed().find(order => order.id === this.selectedId()));
  readonly groups = computed(() => [
    {label: 'Pendientes', state: 'Pendiente', orders: this.store.displayed().filter(order => order.status === 'Pendiente')},
    {label: 'En preparación', state: 'En preparación', orders: this.store.displayed().filter(order => order.status === 'En preparación')}
  ]);
  readonly title = computed(() => this.mode() === 'queue' ? 'El servicio en movimiento' : this.mode() === 'board' ?
    'El ritmo de la cocina' : this.selected() ? `Pedido #${this.selected()!.id}` : 'Consulta del pedido');
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

  constructor() {
    afterNextRender(() => {
      const id = this.navigation?.cocinaReturnId;
      if (this.mode() !== 'detail' && Number.isSafeInteger(id) && id > 0) {
        this.document.querySelector<HTMLAnchorElement>(`a[aria-label="Consultar pedido #${id}"]`)?.focus();
      }
    });
  }
}
