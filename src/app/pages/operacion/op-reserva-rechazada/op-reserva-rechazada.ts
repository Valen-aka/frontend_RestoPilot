import {Component, computed, inject, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {CocinaShell} from '../cocina-ui/cocina-shell';
import {ReservaStore} from '../../cliente/reserva-ui/reserva-store';
import {ReservaItem} from '../../cliente/reserva-ui/reserva.model';

/**
 * Frame: op-reserva-rechazada | "Constancia de reserva desestimada"
 * Responsable: Cristian Condori
 * US17, US29: Constancia de rechazo de reserva con motivo y liberación de mesa en agenda conectada con la API.
 */
@Component({
  selector: 'rp-op-reserva-rechazada',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CocinaShell
  ],
  templateUrl: './op-reserva-rechazada.html',
  styleUrl: './op-reserva-rechazada.css'
})
export class OpReservaRechazadaPage implements OnInit {
  readonly store = inject(ReservaStore);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    if (qId && !this.store.obtenerReservaPorId(qId)) {
      this.store.cargarReservaPorId(qId).subscribe();
    }
  }

  readonly reserva = computed<ReservaItem>(() => {
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    if (qId) {
      const encontrada = this.store.obtenerReservaPorId(qId);
      if (encontrada) return encontrada;
    }
    const rechazada = this.store.reservas().find(r => r.estado === 'RECHAZADA');
    return rechazada || this.store.reservas()[2];
  });
}
