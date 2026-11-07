import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaService} from '../../../core/services/reserva.service';
import {MesaPlano} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-plano | "Elige tu lugar favorito"
 * Responsable: Cristian Condori
 * US05: Visualización del plano del salón y selección interactiva de mesa disponible conectada con la API.
 */
@Component({
  selector: 'rp-cliente-plano',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './cliente-plano.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-plano.css']
})
export class ClientePlanoPage implements OnInit {
  readonly store = inject(ReservaStore);
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cargando = signal(false);
  readonly errorMsg = signal<string | null>(null);

  ngOnInit() {
    const rawRest = this.route.snapshot.queryParamMap.get('restauranteId');
    const rid = rawRest && /^[1-9]\d*$/.test(rawRest) ? Number(rawRest) : (this.store.draft().restauranteId || 1);
    const d = this.store.draft();

    // Si aún no se han cargado mesas de la API para esta búsqueda, consultamos
    if (this.store.mesas().length === 0 && d.fecha && d.horaInicio && d.horaFin) {
      this.cargando.set(true);
      this.reservaService.consultarDisponibilidadDirecta(rid, d.fecha, d.horaInicio, d.horaFin, d.comensales).subscribe({
        next: (res) => {
          this.cargando.set(false);
          this.store.actualizarMesasDesdeDisponibilidad(res.mesas);
        },
        error: (err) => {
          this.cargando.set(false);
          this.errorMsg.set(err.error?.mensaje || 'No se pudo actualizar la disponibilidad de mesas.');
        }
      });
    }
  }

  seleccionarMesa(mesa: MesaPlano) {
    if (!mesa.disponible) return;
    this.store.selectMesa(mesa);
  }

  continuarARevisar() {
    if (!this.store.draft().mesaId) {
      alert('Por favor selecciona una mesa disponible antes de continuar.');
      return;
    }
    this.router.navigate(['/cliente/reserva/revisar'], { queryParamsHandling: 'merge' });
  }
}
