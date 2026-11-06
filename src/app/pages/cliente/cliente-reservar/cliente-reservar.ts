import {Component, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaService} from '../../../core/services/reserva.service';

/**
 * Frame: cliente-reservar | "Hay una mesa para ti"
 * Responsable: Cristian Condori
 * US05: Búsqueda de disponibilidad y parámetros de reserva conectada con la API.
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
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cargando = signal(false);
  readonly errorMsg = signal<string | null>(null);

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
      validators: [Validators.maxLength(500)]
    })
  });

  buscarMesas() {
    this.errorMsg.set(null);
    if (this.form0.invalid) {
      this.form0.markAllAsTouched();
      return;
    }

    const { fecha, horaInicio, horaFin, comensales, notas } = this.form0.getRawValue();

    // Validar fecha no pasada
    if (fecha < this.hoy) {
      this.errorMsg.set('No se puede consultar disponibilidad para una fecha pasada.');
      return;
    }

    // Validar hora de inicio no pasada si la reserva es hoy
    if (fecha === this.hoy) {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      if (horaInicio < horaActual) {
        this.errorMsg.set('La hora de inicio no puede ser anterior a la hora actual.');
        return;
      }
    }

    // Validar coherencia de horas
    if (horaInicio >= horaFin) {
      this.errorMsg.set('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    const rawRest = this.route.snapshot.queryParamMap.get('restauranteId');
    const rid = rawRest && /^[1-9]\d*$/.test(rawRest) ? Number(rawRest) : 1;

    this.store.setSearchCriteria({
      fecha,
      horaInicio,
      horaFin,
      comensales,
      notas: notas || '',
      restauranteId: rid
    });

    this.cargando.set(true);
    this.reservaService.consultarDisponibilidadDirecta(rid, fecha, horaInicio, horaFin, comensales).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.store.actualizarMesasDesdeDisponibilidad(res.mesas);
        const hayLibres = res.mesas.some(m => m.disponible);
        if (!hayLibres || res.mesas.length === 0) {
          this.router.navigate(['/cliente/reservar'], {
            queryParams: { vista: 'cliente-sin-disponibilidad', restauranteId: rid },
            queryParamsHandling: 'merge'
          });
        } else {
          this.router.navigate(['/cliente/plano'], {
            queryParams: { restauranteId: rid },
            queryParamsHandling: 'merge'
          });
        }
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err.error?.mensaje || (err.status === 0 ? 'No se pudo conectar con el servidor (localhost:8081). Verifique que el backend esté ejecutándose.' : (err.message || 'Error al consultar disponibilidad.'));
        this.errorMsg.set(msg);
        if (err.status === 400 && typeof msg === 'string' && msg.toLowerCase().includes('atención física')) {
          this.router.navigate(['/cliente/reservar'], {
            queryParams: { vista: 'cliente-reservas-deshabilitadas', restauranteId: rid },
            queryParamsHandling: 'merge'
          });
        }
      }
    });
  }

  simularSinDisponibilidad() {
    this.router.navigate(['/cliente/reservar'], { queryParams: { vista: 'cliente-sin-disponibilidad' }, queryParamsHandling: 'merge' });
  }
}
