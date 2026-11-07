import {Component, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaService} from '../../../core/services/reserva.service';
import {ReservaItem} from '../reserva-ui/reserva.model';
import {ReservaRequest} from '../../../core/models/reserva-api.model';

/**
 * Frame: cliente-reserva-revisar | "Tu próxima mesa, casi lista"
 * Responsable: Cristian Condori
 * US06: Revisión de datos y confirmación de solicitud de reserva (POST /api/reservas).
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
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cargando = signal(false);
  readonly enviando = signal(false);
  readonly errorApi = signal<string | null>(null);
  readonly reservaConfirmada = signal<ReservaItem | null>(null);

  readonly form0 = new FormGroup({
    notas: new FormControl(this.store.draft().notas || '', {
      nonNullable: false,
      validators: [Validators.maxLength(500)]
    }),
    aceptaTerminos: new FormControl(true, {
      nonNullable: true,
      validators: [Validators.requiredTrue]
    })
  });

  confirmarSolicitud() {
    this.errorApi.set(null);

    // Control de envíos repetidos (US06 - 026)
    if (this.enviando() || this.cargando()) {
      return;
    }

    if (this.form0.invalid) {
      this.form0.markAllAsTouched();
      return;
    }

    const d = this.store.draft();

    // Asegurar los datos de la búsqueda y selección de mesa
    if (!d.mesaId || !d.mesaNumero || !d.fecha || !d.horaInicio || !d.horaFin || !d.comensales) {
      this.errorApi.set('No has seleccionado una mesa o faltan datos de la búsqueda. Por favor vuelve al plano.');
      return;
    }

    this.enviando.set(true);
    this.cargando.set(true);

    const notas = this.form0.controls.notas.value;
    if (notas !== undefined) {
      this.store.setSearchCriteria({ notas: notas || '' });
    }

    const rawRest = this.route.snapshot.queryParamMap.get('restauranteId');
    const restauranteId = rawRest && /^[1-9]\d*$/.test(rawRest) ? Number(rawRest) : d.restauranteId;

    if (!restauranteId) {
      this.errorApi.set('No se identificó el restaurante seleccionado. Por favor inicia tu búsqueda desde el inicio.');
      this.enviando.set(false);
      this.cargando.set(false);
      return;
    }

    const request: ReservaRequest = {
      mesaId: d.mesaId,
      restauranteId,
      fecha: d.fecha,
      horaInicio: d.horaInicio,
      horaFin: d.horaFin,
      numeroComensales: d.comensales,
      notas: notas ? notas.trim() : null
    };

    this.reservaService.registrarReserva(request).subscribe({
      next: (res) => {
        this.cargando.set(false);
        const nuevaReserva = this.store.incorporarReservaCreada(res);
        this.reservaConfirmada.set(nuevaReserva);

        // Navegar tras confirmación a la pantalla canónica de la reserva creada (US06 corregido)
        setTimeout(() => {
          this.router.navigate(['/cliente/reserva'], {
            queryParams: { id: nuevaReserva.id, vista: 'cliente-reserva-pendiente' },
            state: { reservaId: nuevaReserva.id },
            queryParamsHandling: 'merge'
          });
        }, 1200);
      },
      error: (err) => {
        this.cargando.set(false);
        this.enviando.set(false);
        const msg = err.error?.mensaje || (err.status === 0 ? 'No se pudo conectar con el servidor (localhost:8081). Verifique que el backend esté ejecutándose.' : (err.message || 'Error al procesar la reserva.'));
        this.errorApi.set(msg);
      }
    });
  }
}
