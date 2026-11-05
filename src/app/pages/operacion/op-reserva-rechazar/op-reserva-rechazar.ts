import {Component, computed, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {CocinaShell} from '../cocina-ui/cocina-shell';
import {ReservaStore} from '../../cliente/reserva-ui/reserva-store';
import {ReservaItem} from '../../cliente/reserva-ui/reserva.model';

/**
 * Frame: op-reserva-rechazar | "Rechazar solicitud de reserva"
 * Responsable: Cristian Condori
 * US17, US29: Consignación obligatoria del motivo de rechazo de reserva y liberación de mesa.
 */
@Component({
  selector: 'rp-op-reserva-rechazar',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CocinaShell
  ],
  templateUrl: './op-reserva-rechazar.html',
  styleUrl: './op-reserva-rechazar.css'
})
export class OpReservaRechazarPage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form0 = new FormGroup({
    motivo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(300)]
    })
  });

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

  mensajeError = '';

  rechazar() {
    if (this.form0.invalid) {
      this.mensajeError = 'El motivo de rechazo es obligatorio (mínimo 5 caracteres) para notificar al cliente.';
      return;
    }

    const motivo = this.form0.controls.motivo.value.trim();
    const r = this.reserva();
    if (!r) return;

    const ok = this.store.rechazarReservaOperativa(r.id, motivo);
    if (ok) {
      this.router.navigate(['/operacion/reserva'], {
        queryParams: { vista: 'op-reserva-rechazada', id: r.id },
        state: { reservaId: r.id }
      });
    } else {
      this.mensajeError = 'No se pudo procesar el rechazo de la reserva. Intenta nuevamente.';
    }
  }
}
