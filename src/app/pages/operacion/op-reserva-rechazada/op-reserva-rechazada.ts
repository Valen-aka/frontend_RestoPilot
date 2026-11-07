import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {CocinaShell} from '../cocina-ui/cocina-shell';
import {ReservaStore} from '../../cliente/reserva-ui/reserva-store';
import {ReservaService} from '../../../core/services/reserva.service';
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
  private readonly reservaService = inject(ReservaService);
  private readonly route = inject(ActivatedRoute);

  readonly reservaReal = signal<ReservaItem | null>(null);

  ngOnInit() {
    const qIdRaw = this.route.snapshot.queryParamMap.get('id');
    const qId = qIdRaw && /^[1-9]\d*$/.test(qIdRaw) ? Number(qIdRaw) : undefined;
    if (qId) {
      this.reservaService.obtener(qId).subscribe({
        next: (res) => {
          const item = this.store.incorporarReservaCreada(res);
          this.reservaReal.set(item);
        },
        error: () => {
          this.reservaReal.set(this.store.obtenerReservaPorId(qId) ?? null);
        }
      });
    }
  }

  readonly reserva = computed<ReservaItem | null>(() => this.reservaReal());
}
