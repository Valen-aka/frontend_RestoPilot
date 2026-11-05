import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-completada | "Gracias por visitarnos"
 * Responsable: Cristian Condori
 * US07 / US25: Visualización de reserva completada con atención exitosa.
 */
@Component({
  selector: 'rp-cliente-reserva-completada',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-completada.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-completada.css']
})
export class ClienteReservaCompletadaPage {
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
    const comp = this.store.reservas().find(r => r.estado === 'COMPLETADA');
    return comp || this.store.reservas()[4];
  });
}
