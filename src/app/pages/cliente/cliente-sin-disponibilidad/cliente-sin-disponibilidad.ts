import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';

/**
 * Frame: cliente-sin-disponibilidad | "Probemos otro momento"
 * Responsable: Cristian Condori
 * US05: Estado alternativo cuando no hay cupo o mesas para el turno solicitado.
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
  private readonly router = inject(Router);

  readonly turnosSugeridos = [
    { inicio: '12:30', fin: '14:00', label: 'Almuerzo temprano (12:30)' },
    { inicio: '15:15', fin: '16:45', label: 'Tarde tranquila (15:15)' },
    { inicio: '20:00', fin: '21:30', label: 'Cena (20:00)' }
  ];

  elegirTurnoSugerido(turno: { inicio: string; fin: string }) {
    this.store.setSearchCriteria({
      horaInicio: turno.inicio,
      horaFin: turno.fin
    });
    this.router.navigate(['/cliente/plano']);
  }
}
