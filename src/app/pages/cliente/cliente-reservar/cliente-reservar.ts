import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';

/**
 * Frame: cliente-reservar | "Hay una mesa para ti"
 * Responsable: Cristian Condori
 * US05: Búsqueda de disponibilidad y parámetros de reserva.
 */
@Component({
  selector: 'rp-cliente-reservar',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './cliente-reservar.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reservar.css']
})
export class ClienteReservarPage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);

  // Fecha mínima: hoy (formato YYYY-MM-DD)
  readonly hoy = new Date().toISOString().split('T')[0];

  readonly form0 = new FormGroup({
    fecha: new FormControl(this.store.draft().fecha || this.hoy, {
      nonNullable: true,
      validators: [Validators.required]
    }),
    horaInicio: new FormControl(this.store.draft().horaInicio || '13:30', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    horaFin: new FormControl(this.store.draft().horaFin || '15:00', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    comensales: new FormControl(this.store.draft().comensales || 4, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(12)]
    }),
    notas: new FormControl(this.store.draft().notas || '', {
      nonNullable: false,
      validators: [Validators.maxLength(300)]
    })
  });

  buscarMesas() {
    if (this.form0.invalid) {
      this.form0.markAllAsTouched();
      return;
    }

    const { fecha, horaInicio, horaFin, comensales, notas } = this.form0.getRawValue();

    // Validar coherencia de horas
    if (horaInicio >= horaFin) {
      alert('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    this.store.setSearchCriteria({
      fecha,
      horaInicio,
      horaFin,
      comensales,
      notas: notas || ''
    });

    // Si los comensales exceden la capacidad máxima disponible (ej. > 8 personas sin mesas agrupadas),
    // o si el store detecta que no hay disponibilidad, derivamos a la vista de sin disponibilidad
    if (comensales > 8 || !this.store.hayDisponibilidad()) {
      this.router.navigate(['/cliente/reservar'], { queryParams: { vista: 'cliente-sin-disponibilidad' },queryParamsHandling:'merge' });
    } else {
      this.router.navigate(['/cliente/plano'],{queryParamsHandling:'preserve'});
    }
  }

  simularSinDisponibilidad() {
    this.router.navigate(['/cliente/reservar'], { queryParams: { vista: 'cliente-sin-disponibilidad' } });
  }
}
