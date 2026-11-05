import {Component, computed, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';

/**
 * Frame: cliente-reserva-editar | "Cambiemos el plan"
 * Responsable: Cristian Condori
 * US08: Reprogramación de fecha, horario, personas y notas de una reserva activa.
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
export class ClienteReservaEditarPage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly horasDisponibles = [
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  readonly reserva = computed<ReservaItem>(() => {
    const nav = this.router.getCurrentNavigation();
    const stateId = (nav?.extras.state as { reservaId?: number })?.reservaId;
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    const targetId = stateId || qId;

    if (targetId) {
      const encontrada = this.store.obtenerReservaPorId(targetId);
      if (encontrada) return encontrada;
    }

    // Por defecto toma una reserva activa editable (PENDIENTE o CONFIRMADA)
    const editable = this.store.reservas().find(r => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA');
    return editable || this.store.reservas()[0];
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

  constructor() {
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
    if (this.form0.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    const val = this.form0.getRawValue();
    const r = this.reserva();
    if (!r) return;

    const ok = this.store.reprogramarReserva(
      r.id,
      val.fecha,
      val.horaInicio,
      val.horaFin,
      Number(val.comensales),
      val.notas
    );

    if (ok) {
      // Redirigir a vista pendiente con la confirmación de solicitud enviada
      this.router.navigate(['/cliente/reserva'], {
        queryParams: { vista: 'cliente-reserva-pendiente', id: r.id },
        state: { reservaId: r.id, reprogramada: true }
      });
    } else {
      this.mensajeError = 'No se pudo actualizar la reserva. Intenta nuevamente.';
    }
  }
}
