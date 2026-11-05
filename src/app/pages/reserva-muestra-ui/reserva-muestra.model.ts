import type {AttendanceReservation} from '../operacion/reserva-atencion-ui/reserva-atencion.model';
import type {ExpiryReservation} from '../reserva-expirada-ui/reserva-expirada.model';

export type ReservationSample = AttendanceReservation & ExpiryReservation;

/** Los dos recorridos consultan registros con identidad y metadatos comunes. */
export function reservationSamples(attendance: readonly AttendanceReservation[], expired: readonly ExpiryReservation[],
  clientId: string, restaurant: string): readonly ReservationSample[] {
  return Object.freeze([
    ...attendance.map(reservation => Object.freeze({...reservation, clientId, restaurant})),
    ...expired
  ]);
}
