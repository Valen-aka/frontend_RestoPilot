import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-expirada | "Esta reserva ha expirado"
 * Responsable: Cristian Condori
 * US07 / US26: Visualización de reserva expirada tras tolerancia de 15 minutos.
 */
@Component({
  selector: 'rp-cliente-reserva-expirada',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-expirada.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-expirada.css']
})
export class ClienteReservaExpiradaPage {
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
    const exp = this.store.reservas().find(r => r.estado === 'EXPIRADA');
    return exp || this.store.reservas()[3];
  });
}
