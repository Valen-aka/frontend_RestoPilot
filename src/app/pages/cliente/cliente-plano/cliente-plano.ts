import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {MesaPlano} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-plano | "Elige tu lugar favorito"
 * Responsable: Cristian Condori
 * US05: Visualización del plano del salón y selección interactiva de mesa disponible.
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
export class ClientePlanoPage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);

  seleccionarMesa(mesa: MesaPlano) {
    if (!mesa.disponible) return;
    this.store.selectMesa(mesa);
  }

  continuarARevisar() {
    if (!this.store.draft().mesaId) {
      alert('Por favor selecciona una mesa disponible antes de continuar.');
      return;
    }
    this.router.navigate(['/cliente/reserva/revisar']);
  }
}
