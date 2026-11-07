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
    const rid = rawRest && /^[1-9]\d*$/.test(rawRest) ? Number(rawRest) : this.store.draft().restauranteId;
    const d = this.store.draft();

    if (!rid) {
      this.errorMsg.set('No se especificó un restaurante válido. Por favor inicia tu búsqueda.');
      return;
    }

    // Solo consultar disponibilidad si aún no hay búsqueda vigente y tenemos los parámetros requeridos
    if (!this.store.busquedaVigente() && d.fecha && d.horaInicio && d.horaFin && d.comensales) {
      this.cargando.set(true);
      this.errorMsg.set(null);
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
    this.errorMsg.set(null);
    this.store.selectMesa(mesa);
  }

  continuarARevisar() {
    if (!this.store.draft().mesaId) {
      this.errorMsg.set('Por favor selecciona una mesa disponible antes de continuar.');
      return;
    }
    this.router.navigate(['/cliente/reserva/revisar'], { queryParamsHandling: 'merge' });
  }
}
