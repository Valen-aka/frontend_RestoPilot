import {Component, inject, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatPaginatorIntl, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {WorkspaceShell} from '../../components/workspace-shell/workspace-shell';
import {NotificacionesStore} from './notificaciones-store';

function spanishPaginator(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.nextPageLabel = 'Página siguiente'; intl.previousPageLabel = 'Página anterior';
  intl.itemsPerPageLabel='Notificaciones por página';
  intl.firstPageLabel='Primera página';intl.lastPageLabel='Última página';
  intl.getRangeLabel = (page, size, length) => length?`${page * size + 1}–${Math.min((page + 1) * size, length)} de ${length}`:'0 de 0';
  return intl;
}

@Component({selector: 'rp-notificaciones-view', imports: [WorkspaceShell, RouterLink, MatButtonModule, MatPaginatorModule], providers: [NotificacionesStore,{provide: MatPaginatorIntl, useFactory: spanishPaginator}], templateUrl: './notificaciones-view.html', styleUrls: ['../../components/workspace-shell/workspace-pages.css', './notificaciones-view.css']})
export class NotificacionesView {
  readonly role=input<'client'|'operation'>('client');
  readonly store=inject(NotificacionesStore);
  changePage(event:PageEvent):void {this.store.load(event.pageSize!==this.store.size()?0:event.pageIndex,event.pageSize);}
  date(value:string):string {
    // LocalDateTime has no timezone. Preserve its wall-clock date and time.
    const [date,time]=value.split('T');
    const [year,month,day]=date.split('-');
    return `${day}/${month}/${year} · ${time.slice(0,5)}`;
  }
}
