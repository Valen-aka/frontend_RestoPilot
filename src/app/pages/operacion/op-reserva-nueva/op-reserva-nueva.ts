import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {CocinaShell} from '../cocina-ui/cocina-shell';
import {ReservaStore} from '../../cliente/reserva-ui/reserva-store';

/**
 * Frame: op-reserva-nueva | "Nueva reserva manual en salón"
 * Responsable: Cristian Condori
 * US06, US27, US29: Registro administrativo manual de reserva por personal de recepción.
 * La reserva queda almacenada en el sistema en estado PENDIENTE.
 */
@Component({
  selector: 'rp-op-reserva-nueva',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    CocinaShell
  ],
  templateUrl: './op-reserva-nueva.html',
  styleUrl: './op-reserva-nueva.css'
})
export class OpReservaNuevaPage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);

  readonly horasDisponibles = [
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  readonly form0 = new FormGroup({
    nombreCliente: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefonoCliente: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fecha: new FormControl('2026-11-05', { nonNullable: true, validators: [Validators.required] }),
    horaInicio: new FormControl('13:30', { nonNullable: true, validators: [Validators.required] }),
    horaFin: new FormControl('15:00', { nonNullable: true, validators: [Validators.required] }),
    comensales: new FormControl(4, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(12)] }),
    mesaId: new FormControl(4, { nonNullable: true, validators: [Validators.required] }),
    notas: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] })
  });

  mensajeError = '';

  onHoraInicioChange(hora: string) {
    const [h, m] = hora.split(':').map(Number);
    const finH = h + 1;
    const finM = m + 30;
    const finTotalH = finM >= 60 ? finH + 1 : finH;
    const finTotalM = finM >= 60 ? finM - 60 : finM;
    const horaFinCalc = `${String(finTotalH).padStart(2, '0')}:${String(finTotalM).padStart(2, '0')}`;
    this.form0.patchValue({ horaFin: horaFinCalc });
  }

  crearSolicitud() {
    if (this.form0.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos del cliente y la mesa.';
      return;
    }

    const val = this.form0.getRawValue();
    const mesa = this.store.mesas().find(m => m.id === Number(val.mesaId));

    const nueva = this.store.crearReservaOperativa({
      nombreCliente: val.nombreCliente.trim(),
      telefonoCliente: val.telefonoCliente.trim(),
      fecha: val.fecha,
      horaInicio: val.horaInicio,
      horaFin: val.horaFin,
      comensales: Number(val.comensales),
      mesaId: Number(val.mesaId),
      mesaNumero: mesa?.numero || `Mesa ${val.mesaId}`,
      zona: mesa?.zona || 'Salón Principal',
      notas: val.notas.trim()
    });

    // Redirigir al detalle operativo de la reserva creada
    this.router.navigate(['/operacion/reserva'], {
      queryParams: { id: nueva.id },
      state: { reservaId: nueva.id, creadaManual: true }
    });
  }
}
