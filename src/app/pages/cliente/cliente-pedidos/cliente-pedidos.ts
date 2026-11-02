import {afterNextRender, Component, computed, DOCUMENT, inject} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatPaginatorIntl, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {ClientePedidosStore} from '../pedido-ui/cliente-pedidos-store';
import {MODALITY_LABELS, Modality, vistaForStatus} from '../pedido-ui/pedido.model';

function spanishPaginator(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Pedidos por página:';
  intl.nextPageLabel = 'Página siguiente'; intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primera página'; intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (page, size, length) => length ? `${page * size + 1}–${Math.min((page + 1) * size, length)} de ${length}` : '0 de 0';
  return intl;
}

/** Frame cliente-pedidos. Responsable: Alexandra Fong. Listado y navegación de muestra. */
@Component({selector: 'rp-cliente-pedidos',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatCardModule, MatTableModule, MatProgressSpinnerModule, MatPaginatorModule],
  providers: [{provide: MatPaginatorIntl, useFactory: spanishPaginator}],
  templateUrl: './cliente-pedidos.html', styleUrls: ['../pedido-ui/pedido-view.css', './cliente-pedidos.css']})
export class ClientePedidosPage {
  readonly store = inject(ClientePedidosStore);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly state = this.router.currentNavigation()?.extras.state ?? this.document.defaultView?.history.state ?? {};
  readonly modalityLabel = (modality: Modality) => MODALITY_LABELS[modality];
  readonly vista = vistaForStatus;
  readonly columns = ['id', 'date', 'modality', 'status', 'total', 'action'];
  readonly pageIndex = computed(() => Math.min(this.store.pageIndex(), Math.max(0, Math.ceil(this.store.history().length / this.store.pageSize()) - 1)));
  readonly rows = computed(() => this.store.history().slice(this.pageIndex() * this.store.pageSize(), (this.pageIndex() + 1) * this.store.pageSize()));

  constructor() {
    afterNextRender(() => {
      const id = this.state['pedidoReturnId'];
      if (Number.isSafeInteger(id)) (this.document.getElementById(`client-order-${id}`) ?? this.document.getElementById('orders-title'))?.focus();
    });
  }
  page(event: PageEvent): void {this.store.pageSize.set(event.pageSize); this.store.pageIndex.set(event.pageIndex);}
  skip(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('orders-content');main?.focus({preventScroll:true});main?.scrollIntoView({block:'start'});
  }
}
