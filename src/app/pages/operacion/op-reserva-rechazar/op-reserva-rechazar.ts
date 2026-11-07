import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {CocinaShell} from '../cocina-ui/cocina-shell';
import {ReservaStore} from '../../cliente/reserva-ui/reserva-store';
import {ReservaService} from '../../../core/services/reserva.service';
import {ReservaItem} from '../../cliente/reserva-ui/reserva.model';

/**
 * Frame: op-reserva-rechazar | "Rechazar solicitud de reserva"
 * Responsable: Cristian Condori
 * US17, US29: Consignación obligatoria del motivo de rechazo de reserva y liberación de mesa conectada a la API.
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
export class OpReservaRechazarPage implements OnInit {
  readonly store = inject(ReservaStore);
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cargando = signal(false);

  readonly form0 = new FormGroup({
    motivo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(300)]
    })
  });

  readonly reserva = computed<ReservaItem | null>(() => {
    const nav = this.router.getCurrentNavigation();
    const stateId = (nav?.extras.state as { reservaId?: number })?.reservaId;
    const qIdRaw = this.route.snapshot.queryParamMap.get('id');
    const qId = qIdRaw && /^[1-9]\d*$/.test(qIdRaw) ? Number(qIdRaw) : undefined;
    const targetId = stateId || qId;

    if (targetId) {
      return this.store.obtenerReservaPorId(targetId) ?? null;
    }

    return null;
  });

  mensajeError = '';

  ngOnInit() {
    const qIdRaw = this.route.snapshot.queryParamMap.get('id');
    const qId = qIdRaw && /^[1-9]\d*$/.test(qIdRaw) ? Number(qIdRaw) : undefined;
    if (qId && !this.store.obtenerReservaPorId(qId)) {
      this.cargando.set(true);
      this.store.cargarReservaPorId(qId).subscribe({
        next: () => this.cargando.set(false),
        error: () => this.cargando.set(false)
      });
    }
  }

  rechazar() {
    this.mensajeError = '';
    const r = this.reserva();
    if (!r) {
      this.mensajeError = 'No se encontró la reserva indicada para evaluar su rechazo.';
      return;
    }

    if (this.form0.invalid) {
      this.mensajeError = 'El motivo de rechazo es obligatorio (mínimo 5 caracteres) para notificar al cliente.';
      return;
    }

    const motivo = this.form0.controls.motivo.value.trim();

    this.cargando.set(true);
    this.reservaService.evaluarPorId(r.id, 'RECHAZADA', motivo).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.store.incorporarReservaCreada(res);
        this.store.actualizarEstado(r.id, 'RECHAZADA', motivo);
        this.router.navigate(['/operacion/reserva'], {
          queryParams: { vista: 'op-reserva-rechazada', id: r.id },
          state: { reservaId: r.id },
          queryParamsHandling: 'merge'
        });
      },
      error: (err) => {
        this.cargando.set(false);
        const msg = err.error?.mensaje || (err.status === 0 ? 'No se pudo conectar con el servidor (localhost:8081).' : (err.message || 'No se pudo procesar el rechazo de la reserva. Intenta nuevamente.'));
        this.mensajeError = msg;
      }
    });
  }
}
