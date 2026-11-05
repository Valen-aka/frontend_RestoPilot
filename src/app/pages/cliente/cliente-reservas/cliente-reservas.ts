import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ESTADO_RESERVA_LABELS, ESTADO_RESERVA_VISTAS, EstadoReserva, ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reservas | "Tus reservas"
 * Responsable: Cristian Condori
 * US07: Consulta y gestión del historial de reservas del cliente.
 */
@Component({
  selector: 'rp-cliente-reservar-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './cliente-reservas.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reservas.css']
})
export class ClienteReservasPage {
  readonly store = inject(ReservaStore);

  readonly filtros = [
    { label: 'Todas', valor: 'TODAS' },
    { label: 'Pendientes', valor: 'PENDIENTE' },
    { label: 'Confirmadas', valor: 'CONFIRMADA' },
    { label: 'Completadas', valor: 'COMPLETADA' },
    { label: 'Expiradas', valor: 'EXPIRADA' },
    { label: 'Canceladas', valor: 'CANCELADA' }
  ];

  readonly vistaPorEstado = (estado: EstadoReserva) => ESTADO_RESERVA_VISTAS[estado];
  readonly labelPorEstado = (estado: EstadoReserva) => ESTADO_RESERVA_LABELS[estado];

  cambiarFiltro(valor: string) {
    this.store.setFiltro(valor);
  }
}
