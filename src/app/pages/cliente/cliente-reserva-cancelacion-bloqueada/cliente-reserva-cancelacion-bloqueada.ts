import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaService} from '../../../core/services/reserva.service';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-cancelacion-bloqueada | "Cancelación no disponible"
 * Responsable: Cristian Condori
 * US09: Bloqueo de cancelación autónoma al restar 2 horas o menos para el inicio de la reserva.
 * Deriva al cliente a comunicarse telefónicamente con recepción del restaurante.
 */
@Component({
  selector: 'rp-cliente-reserva-cancelacion-bloqueada',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-cancelacion-bloqueada.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-cancelacion-bloqueada.css']
})
export class ClienteReservaCancelacionBloqueadaPage implements OnInit {
  readonly store = inject(ReservaStore);
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly telefonoRecepcion = '(01) 445-8920';
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
