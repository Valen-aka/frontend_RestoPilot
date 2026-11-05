import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {CocinaShell} from '../cocina-ui/cocina-shell';
import {ReservaStore} from '../../cliente/reserva-ui/reserva-store';
import {ReservaItem} from '../../cliente/reserva-ui/reserva.model';

/**
 * Frame: op-reserva-detalle | "Auditoría y detalle operativo de reserva"
 * Responsable: Cristian Condori
 * US17, US29: Inspección de solicitud en estado pendiente para evaluación por personal administrativo.
 * Permite confirmar, rechazar o reprogramar la cita.
 */
@Component({
  selector: 'rp-op-reserva-detalle',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    CocinaShell
  ],
  templateUrl: './op-reserva-detalle.html',
  styleUrl: './op-reserva-detalle.css'
})
export class OpReservaDetallePage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mensajeExito = signal('');

  readonly reserva = computed<ReservaItem>(() => {
    const nav = this.router.getCurrentNavigation();
    const stateId = (nav?.extras.state as { reservaId?: number })?.reservaId;
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    const targetId = stateId || qId;

    if (targetId) {
      const encontrada = this.store.obtenerReservaPorId(targetId);
      if (encontrada) return encontrada;
    }

    const pendiente = this.store.reservas().find(r => r.estado === 'PENDIENTE');
    return pendiente || this.store.reservas()[0];
  });

  confirmarReserva(id: number) {
    const ok = this.store.confirmarReservaOperativa(id);
    if (ok) {
      this.mensajeExito.set(`¡Reserva #${this.reserva().codigo} confirmada exitosamente! Se notificó al cliente.`);
    }
  }

  irARechazar(id: number) {
    this.router.navigate(['/operacion/reserva/rechazar'], {
      queryParams: { id },
      state: { reservaId: id }
    });
  }
}
