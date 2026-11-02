import {Injectable, computed, inject, signal} from '@angular/core';
import {ReservaMuestraStore} from '../../reserva-muestra-ui/reserva-muestra-store';
import {ATTENDANCE_RESTAURANT, ATTENDANCE_SAMPLE_NOW, AttendanceCommand, AttendanceReservation,
  AttendanceResult, updateAttendanceSample, validReservation} from './reserva-atencion.model';

/** Borrador de atención en memoria, independiente de la sesión y de los pedidos. */
@Injectable({providedIn: 'root'})
export class ReservaAtencionStore {
  readonly reservations = inject(ReservaMuestraStore).reservations;
  readonly selectedId = signal<number | undefined>(208);
  readonly now = signal(ATTENDANCE_SAMPLE_NOW);
  readonly queryState = signal<'ready' | 'loading' | 'error' | 'stale'>('ready');
  readonly previous = signal<readonly AttendanceReservation[]>([]);
  readonly busy = signal(false);
  readonly updateFailure = signal(false);
  readonly feedback = signal<{kind: 'success' | 'error'; id: number; text: string} | undefined>(undefined);
  readonly selected = computed(() => {
    const source = this.queryState() === 'stale' ? this.previous() : this.reservations();
    const matches = source.filter(r => r.id === this.selectedId() && r.restaurantId === ATTENDANCE_RESTAURANT);
    return matches.length === 1 ? matches[0] : undefined;
  });
  readonly problem = computed(() => {
    const selected = this.selected();
    return selected && !validReservation(selected) ? 'Los datos o fechas de esta reserva están incompletos o son incoherentes.' : '';
  });

  apply(command: AttendanceCommand): AttendanceResult {
    let result: AttendanceResult;
    if (this.selectedId() !== command.id) {
      result = {ok: false, reservations: this.reservations(), reason: 'Cambió la reserva seleccionada. Revisa la selección antes de iniciar otra acción.'};
    } else if (this.queryState() !== 'ready') {
      result = {ok: false, reservations: this.reservations(), reason: 'La consulta no está confirmada como actual. Reabre la muestra antes de continuar.'};
    } else if (this.updateFailure()) {
      result = {ok: false, reservations: this.reservations(), reason: 'No se pudo aplicar el cambio de muestra. Se conservan la reserva y sus fechas; puedes revisar y volver a intentarlo.'};
    } else {
      result = updateAttendanceSample(this.reservations(), command, this.now());
    }
    if (result.ok) {
      const updated = result.reservation;
      this.reservations.update(reservations => reservations.map(reservation =>
        reservation.id === updated.id && reservation.restaurantId === updated.restaurantId ?
          {...reservation, ...updated} : reservation));
      this.feedback.set({id: command.id, kind: 'success', text: command.action === 'arrival' ?
        'Llegada de muestra registrada. La reserva continúa Confirmada. No se enviaron avisos.' :
        'Reserva completada en la muestra. No se enviaron avisos ni se actualizó disponibilidad real.'});
    } else this.feedback.set({id: this.selectedId() ?? command.id, kind: 'error', text: result.reason});
    return result;
  }

  showRefreshError(): void {this.previous.set(this.reservations()); this.queryState.set('stale');}
  reopenSample(): void {this.queryState.set('ready');}
}
