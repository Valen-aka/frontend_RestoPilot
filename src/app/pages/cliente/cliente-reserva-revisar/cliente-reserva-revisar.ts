import {Component, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-revisar | "Tu próxima mesa, casi lista"
 * Responsable: Cristian Condori
 * US06: Revisión de datos y confirmación de solicitud de reserva (crea reserva PENDIENTE).
 */
@Component({
  selector: 'rp-cliente-reserva-revisar',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-revisar.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-revisar.css']
})
export class ClienteReservaRevisarPage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);

  readonly reservaConfirmada = signal<ReservaItem | null>(null);

  readonly form0 = new FormGroup({
    notas: new FormControl(this.store.draft().notas || '', {
      nonNullable: false,
      validators: [Validators.maxLength(300)]
    }),
    aceptaTerminos: new FormControl(true, {
      nonNullable: true,
      validators: [Validators.requiredTrue]
    })
  });

  confirmarSolicitud() {
    if (this.form0.invalid) {
      this.form0.markAllAsTouched();
      return;
    }

    // Actualizar notas si se modificaron en esta pantalla
    const notas = this.form0.controls.notas.value;
    if (notas !== undefined) {
      this.store.setSearchCriteria({ notas: notas || '' });
    }

    // Registrar reserva en estado PENDIENTE conforme US06
    const nuevaReserva = this.store.confirmarReservaActual();
    this.reservaConfirmada.set(nuevaReserva);

    // Navegar después de breve confirmación al estado pendiente de cliente
    setTimeout(() => {
      this.router.navigate(['/cliente/reservas'], {
        queryParams: { vista: 'cliente-reserva-pendiente' },
        state: { reservaId: nuevaReserva.id }
      });
    }, 1200);
  }
}
