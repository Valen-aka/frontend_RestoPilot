import {Component, computed, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-cancelada | "Tu reserva fue cancelada"
 * Responsable: Cristian Condori
 * US07 / US09: Confirmación del estado cancelado y liberación de mesa conectada con la API.
 */
@Component({
  selector: 'rp-cliente-reserva-cancelada',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-cancelada.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-cancelada.css']
})
export class ClienteReservaCanceladaPage implements OnInit {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    if (qId && !this.store.obtenerReservaPorId(qId)) {
      this.store.cargarReservaPorId(qId).subscribe();
    }
  }

  readonly reserva = computed<ReservaItem>(() => {
    const nav = this.router.getCurrentNavigation();
    const stateId = (nav?.extras.state as { reservaId?: number })?.reservaId;
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    const targetId = stateId || qId;

    if (targetId) {
      const r = this.store.obtenerReservaPorId(targetId);
      if (r) return r;
    }
    const canc = this.store.reservas().find(r => r.estado === 'CANCELADA');
    return canc || this.store.reservas()[this.store.reservas().length - 1];
  });
}
