import {Component, computed, inject, OnInit, signal} from '@angular/core';
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
import {ReservaItem} from '../reserva-ui/reserva.model';
import {ReservaRequest} from '../../../core/models/reserva-api.model';

/**
 * Frame: cliente-reserva-editar | "Cambiemos el plan"
 * Responsable: Cristian Condori
 * US08: Reprogramación de fecha, horario, personas y notas de una reserva activa conectada a la API.
 * Regla de negocio: La reserva vuelve al estado PENDIENTE para nueva evaluación del restaurante.
 */
@Component({
  selector: 'rp-cliente-reserva-editar',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-editar.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-editar.css']
})
export class ClienteReservaEditarPage implements OnInit {
  readonly store = inject(ReservaStore);
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cargando = signal(false);
  readonly hoy = new Date().toISOString().split('T')[0];

  readonly horasDisponibles = [
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

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

  readonly form0 = new FormGroup({
    fecha: new FormControl('2026-11-06', { nonNullable: true, validators: [Validators.required] }),
    horaInicio: new FormControl('14:00', { nonNullable: true, validators: [Validators.required] }),
    horaFin: new FormControl('15:30', { nonNullable: true, validators: [Validators.required] }),
    comensales: new FormControl(4, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(12)] }),
    notas: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] })
  });

  mensajeError = '';
  enviado = false;

  ngOnInit() {
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    if (qId && !this.store.obtenerReservaPorId(qId)) {
      this.store.cargarReservaPorId(qId).subscribe(r => {
        if (r) {
          this.form0.patchValue({
            fecha: r.fecha,
            horaInicio: r.horaInicio,
            horaFin: r.horaFin,
            comensales: r.comensales,
            notas: r.notas || ''
          });
        }
      });
    } else {
      const r = this.reserva();
      if (r) {
        this.form0.patchValue({
          fecha: r.fecha,
          horaInicio: r.horaInicio,
          horaFin: r.horaFin,
          comensales: r.comensales,
          notas: r.notas || ''
        });
      }
    }
  }

  onHoraInicioChange(hora: string) {
    const [h, m] = hora.split(':').map(Number);
    const finH = h + 1;
    const finM = m + 30;
    const finTotalH = finM >= 60 ? finH + 1 : finH;
    const finTotalM = finM >= 60 ? finM - 60 : finM;
    const horaFinCalc = `${String(finTotalH).padStart(2, '0')}:${String(finTotalM).padStart(2, '0')}`;
    this.form0.patchValue({ horaFin: horaFinCalc });
  }

  solicitarCambio() {
    this.enviado = true;
    this.mensajeError = '';
    if (this.form0.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    const val = this.form0.getRawValue();
    const r = this.reserva();
    if (!r) {
      this.mensajeError = 'No se encontró la reserva solicitada para reprogramar.';
      return;
    }

    if (val.fecha < this.hoy) {
      this.mensajeError = 'No se puede reprogramar a una fecha pasada.';
      return;
    }

    if (val.fecha === this.hoy) {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      if (val.horaInicio < horaActual) {
        this.mensajeError = 'La hora de inicio no puede ser anterior a la hora actual.';
        return;
      }
    }

    if (val.horaInicio >= val.horaFin) {
      this.mensajeError = 'La hora de inicio debe ser anterior a la hora de fin.';
      return;
    }

    const rawRest = this.route.snapshot.queryParamMap.get('restauranteId');
    const restauranteId = rawRest && /^[1-9]\d*$/.test(rawRest) ? Number(rawRest) : r.restauranteId;
    if (!restauranteId) {
      this.mensajeError = 'No se pudo identificar el restaurante asociado a la reserva.';
      return;
    }

    this.cargando.set(true);

    // US08 (049 y 050): Consultar disponibilidad real para el nuevo horario antes de confirmar
    this.reservaService.consultarDisponibilidadDirecta(
      restauranteId,
      val.fecha,
      val.horaInicio,
      val.horaFin,
      Number(val.comensales)
    ).subscribe({
      next: (disp) => {
        const mesasAptas = disp.mesas.filter(m => m.disponible && m.capacidad >= Number(val.comensales));
        if (mesasAptas.length === 0) {
          this.cargando.set(false);
          this.mensajeError = `No hay disponibilidad de mesas en el horario ${val.horaInicio} - ${val.horaFin} para ${val.comensales} personas. Por favor elige otro horario.`;
          return;
        }

        // Si la mesa original está libre en el nuevo horario la mantiene; de lo contrario toma una mesa libre apta
        const mesaActualLibre = disp.mesas.find(m => m.mesaId === r.mesaId && m.disponible);
        const mesaAsignada = mesaActualLibre ? r.mesaId : mesasAptas[0].mesaId;

        const request: ReservaRequest = {
          mesaId: mesaAsignada,
          restauranteId,
          fecha: val.fecha,
          horaInicio: val.horaInicio,
          horaFin: val.horaFin,
          numeroComensales: Number(val.comensales),
          notas: val.notas ? val.notas.trim() : null
        };

        this.reservaService.modificarCliente(r.id, request).subscribe({
          next: (res) => {
            this.cargando.set(false);
            this.store.incorporarReservaCreada(res);
            this.router.navigate(['/cliente/reserva'], {
              queryParams: { vista: 'cliente-reserva-pendiente', id: r.id },
              state: { reservaId: r.id, reprogramada: true },
              queryParamsHandling: 'merge'
            });
          },
          error: (err) => {
            this.cargando.set(false);
            this.mensajeError = err.error?.mensaje || (err.status === 0 ? 'No se pudo conectar con el servidor (localhost:8081).' : (err.message || 'No se pudo actualizar la reserva. Intenta nuevamente.'));
          }
        });
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError = err.error?.mensaje || 'No se pudo consultar la disponibilidad para el nuevo horario.';
      }
    });
  }
}
