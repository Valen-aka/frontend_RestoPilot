import {Component, Input, computed, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatPaginatorIntl, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {WorkspaceShell} from '../../components/workspace-shell/workspace-shell';

function spanishPaginator(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.nextPageLabel = 'Página siguiente'; intl.previousPageLabel = 'Página anterior';
  intl.getRangeLabel = (page, size, length) => `${page * size + 1}–${Math.min((page + 1) * size, length)} de ${length}`;
  return intl;
}

@Component({selector: 'rp-notificaciones-view', imports: [WorkspaceShell,  MatButtonModule, MatPaginatorModule], providers: [{provide: MatPaginatorIntl, useFactory: spanishPaginator}], templateUrl: './notificaciones-view.html', styleUrls: ['../../components/workspace-shell/workspace-pages.css', './notificaciones-view.css']})
export class NotificacionesView {
  @Input() role: 'client' | 'operation' = 'client';
  @Input() initialEmpty = false;
  readonly page = signal(0);
  readonly messages = [
    {id: 'AV-108', fecha: '20 oct 2026 · 18:40', texto: 'Tu pedido #1045 fue cancelado. Se conserva en el historial.'},
    {id: 'AV-107', fecha: '20 oct 2026 · 17:35', texto: 'Tu pedido #1042 está listo para recoger.'},
    {id: 'AV-106', fecha: '20 oct 2026 · 17:20', texto: 'Tu pedido #1042 está en preparación.'},
    {id: 'AV-105', fecha: '20 oct 2026 · 16:15', texto: 'Tu reserva #208 finalizó. Gracias por visitarnos.'},
    {id: 'AV-104', fecha: '20 oct 2026 · 15:00', texto: 'Registramos la llegada de tu reserva #208.'},
    {id: 'AV-103', fecha: '20 oct 2026 · 14:45', texto: 'La reserva #207 expiró al vencer su plazo de atención.'},
    {id: 'AV-102', fecha: '20 oct 2026 · 13:30', texto: 'La reserva #208 fue confirmada.'},
    {id: 'AV-101', fecha: '19 oct 2026 · 19:00', texto: 'La reserva #206 fue rechazada: no hay disponibilidad en ese turno.'},
  ];
  readonly visible = computed(() => this.messages.slice(this.page() * 3, this.page() * 3 + 3));
  changePage(event: PageEvent): void {this.page.set(event.pageIndex);}
}
