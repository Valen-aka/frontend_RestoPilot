import {afterNextRender, Component, computed, DOCUMENT, inject, input, OnInit} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {CocinaShell} from '../operacion/cocina-ui/cocina-shell';
import {ExpiredClientShell} from './expired-client-shell';
import {ReservaExpiradaStore} from './reserva-expirada-store';
import {EXPIRY_RESTAURANT, ExpiryContext, expirationDate, expirationIssue, expirationReason, formatExpiryDate} from './reserva-expirada.model';

@Component({
  selector: 'rp-reserva-expirada-view',
  imports: [NgTemplateOutlet, RouterLink, MatButtonModule, MatCardModule, MatProgressSpinnerModule, MatTableModule, CocinaShell, ExpiredClientShell],
  templateUrl: './reserva-expirada-view.html', styleUrls: ['./reserva-expirada-view.css', './restaurant-map.css']
})
export class ReservaExpiradaView implements OnInit {
  readonly context = input<ExpiryContext>('client');
  readonly mode = input<'detail' | 'history'>('detail');
  readonly store = inject(ReservaExpiradaStore);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly navigationState = this.router.currentNavigation()?.extras.state ?? this.document.defaultView?.history.state ?? {};
  readonly selected = computed(() => this.store.find(this.context()));
  readonly rows = computed(() => this.store.history(this.context()));
  readonly problem = computed(() => this.store.problem(this.context()));
  readonly historyPath = computed(() => this.context() === 'client' ? '/cliente/reservas' : '/operacion/reservas');
  readonly detailPath = computed(() => this.context() === 'client' ? '/cliente/reserva' : '/operacion/reserva');
  readonly detailQuery = computed(() => ({vista: this.context() === 'client' ? 'cliente-reserva-expirada' : 'op-reserva-expirada'}));
  readonly title = computed(() => this.mode() === 'history' ? 'Reservas expiradas de muestra' :
    this.selected()?.status === 'Expirada' ? (this.context() === 'client' ? 'Tu reserva expirada' : 'Reserva expirada') : 'Consulta de la reserva');
  readonly columns = ['id', 'startsAt', 'table', 'guests', 'status', 'expiredAt', 'action'];
  readonly restaurantSampleId = EXPIRY_RESTAURANT;
  readonly date = formatExpiryDate;
  readonly expirationDate = expirationDate;
  readonly expirationIssue = expirationIssue;
  readonly reason = expirationReason;

  constructor() {
    afterNextRender(() => {
      const id = this.navigationState['expiredReturnId'];
      if (this.mode() === 'history' && Number.isSafeInteger(id)) {
        (this.document.getElementById(`expiry-row-${id}`) ?? this.document.getElementById('expiry-heading'))?.focus();
      } else if (this.navigationState['expiredReservationId'] !== undefined) {
        this.document.getElementById('expiry-heading')?.focus();
      }
    });
  }
  ngOnInit(): void {
    if (this.mode() === 'detail' && Object.hasOwn(this.navigationState, 'expiredReservationId')) {
      const id = this.navigationState['expiredReservationId'];
      this.store.select(this.context(), Number.isSafeInteger(id) && id > 0 ? id : undefined);
    }
  }
}
