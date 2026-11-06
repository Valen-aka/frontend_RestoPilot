import {Component, computed, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-rechazada | "No fue posible confirmar tu reserva"
 * Responsable: Cristian Condori
 * US07 / US17: Consulta de reserva rechazada con motivo informado por el restaurante conectada con la API.
 */
@Component({
  selector: 'rp-cliente-reserva-rechazada',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-rechazada.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-rechazada.css']
})
export class ClienteReservaRechazadaPage implements OnInit {
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
    const rech = this.store.reservas().find(r => r.estado === 'RECHAZADA');
    return rech || this.store.reservas()[2];
  });
}
