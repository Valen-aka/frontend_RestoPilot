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
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';

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
  private readonly session = inject(API_SESSION);

  readonly cargando = signal(false);
  readonly reservaReal = signal<ReservaItem | null>(null);
  readonly tienePermisos = computed(() => {
    const s = this.session();
    // US17 - 030: Denegar cuando no existe sesión y denegar también sesiones vencidas
    if (!s || !s.accessToken || !s.accessToken.trim()) return false;
    if (!Number.isFinite(s.expiresAt) || s.expiresAt <= Date.now()) return false;
    const rolesValidos = ['ADMINISTRADOR', 'DUENO', 'PERSONAL', 'RECEPCION'];
    return rolesValidos.includes(s.role);
  });

  readonly form0 = new FormGroup({
    motivo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(300)]
    })
  });

  // Consulta la reserva real directamente desde el servidor sin usar datos antiguos de memoria (US17 - 030)
  readonly reserva = computed<ReservaItem | null>(() => this.reservaReal());

  mensajeError = '';

  ngOnInit() {
    const qIdRaw = this.route.snapshot.queryParamMap.get('id');
    const qId = qIdRaw && /^[1-9]\d*$/.test(qIdRaw) ? Number(qIdRaw) : undefined;
    if (!qId) {
      this.mensajeError = 'No se especificó un ID de reserva válido en la URL.';
      return;
    }

    this.cargando.set(true);
    // US17 - 030: Consultar siempre la reserva real por su ID desde el backend antes de evaluarla
    this.reservaService.obtener(qId).subscribe({
      next: (res) => {
        this.cargando.set(false);
        const item = this.store.incorporarReservaCreada(res);
        this.reservaReal.set(item);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError = err.error?.mensaje || 'No se pudo cargar la reserva real desde el servidor. Verifique que exista.';
      }
    });
  }

  rechazar() {
    this.mensajeError = '';
    const r = this.reserva();
    if (!r) {
      this.mensajeError = 'No se encontró la reserva indicada para evaluar su rechazo.';
      return;
    }

    if (r.estado !== 'PENDIENTE') {
      this.mensajeError = `Esta reserva se encuentra en estado ${r.estado} y no puede ser desestimada.`;
      return;
    }

    if (!this.tienePermisos()) {
      this.mensajeError = 'Sesión no válida o vencida. Se requiere rol operativo con sesión activa para evaluar reservas.';
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
