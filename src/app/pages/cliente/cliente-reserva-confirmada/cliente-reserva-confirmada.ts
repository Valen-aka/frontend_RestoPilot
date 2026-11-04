import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-confirmada | "Tu mesa te espera"
 * Responsable: Cristian Condori
 * US07: Consulta de reserva confirmada con código y detalle de atención.
 */
@Component({
  selector: 'rp-cliente-reserva-confirmada',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-confirmada.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-confirmada.css']
})
export class ClienteReservaConfirmadaPage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly reserva = computed<ReservaItem>(() => {
    const nav = this.router.getCurrentNavigation();
    const stateId = (nav?.extras.state as { reservaId?: number })?.reservaId;
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    const targetId = stateId || qId;

    if (targetId) {
      const r = this.store.obtenerReservaPorId(targetId);
      if (r) return r;
    }
    const conf = this.store.reservas().find(r => r.estado === 'CONFIRMADA');
    return conf || this.store.reservas()[0];
  });
}
