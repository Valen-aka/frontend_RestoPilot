import {Component, computed, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-pendiente | "Tu reserva pendiente"
 * Responsable: Cristian Condori
 * US07: Consulta de reserva en estado pendiente de evaluación con datos reales de la API.
 */
@Component({
  selector: 'rp-cliente-reserva-pendiente',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-pendiente.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-pendiente.css']
})
export class ClienteReservaPendientePage implements OnInit {
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
    const pendiente = this.store.reservas().find(r => r.estado === 'PENDIENTE');
    return pendiente || this.store.reservas()[0];
  });
}
