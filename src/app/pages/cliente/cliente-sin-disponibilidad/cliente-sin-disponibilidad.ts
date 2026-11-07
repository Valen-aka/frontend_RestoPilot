import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaService} from '../../../core/services/reserva.service';

/**
 * Frame: cliente-sin-disponibilidad | "Probemos otro momento"
 * Responsable: Cristian Condori
 * US05: Estado alternativo cuando no hay cupo o mesas para el turno solicitado con API.
 */
@Component({
  selector: 'rp-cliente-sin-disponibilidad',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './cliente-sin-disponibilidad.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-sin-disponibilidad.css']
})
export class ClienteSinDisponibilidadPage {
  readonly store = inject(ReservaStore);
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly turnosSugeridos = [
    { inicio: '12:30', fin: '14:00', label: 'Almuerzo temprano (12:30)' },
    { inicio: '15:15', fin: '16:45', label: 'Tarde tranquila (15:15)' },
    { inicio: '20:00', fin: '21:30', label: 'Cena (20:00)' }
  ];

  elegirTurnoSugerido(turno: { inicio: string; fin: string }) {
    const rawRest = this.route.snapshot.queryParamMap.get('restauranteId');
    const rid = rawRest && /^[1-9]\d*$/.test(rawRest) ? Number(rawRest) : (this.store.draft().restauranteId || 1);
    const d = this.store.draft();

    this.store.setSearchCriteria({
      horaInicio: turno.inicio,
      horaFin: turno.fin
    });

    this.reservaService.consultarDisponibilidadDirecta(rid, d.fecha, turno.inicio, turno.fin, d.comensales).subscribe({
      next: (res) => {
        this.store.actualizarMesasDesdeDisponibilidad(res.mesas);
        this.router.navigate(['/cliente/plano'], { queryParams: { restauranteId: rid }, queryParamsHandling: 'merge' });
      },
      error: () => {
        this.router.navigate(['/cliente/plano'], { queryParams: { restauranteId: rid }, queryParamsHandling: 'merge' });
      }
    });
  }
}
