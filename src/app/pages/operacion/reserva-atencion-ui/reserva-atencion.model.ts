export type ReservationStatus = 'Pendiente' | 'Confirmada' | 'Rechazada' | 'Cancelada' | 'Expirada' | 'Completada';
export type AttendanceAction = 'arrival' | 'complete';
export interface AttendanceReservation {
  readonly id: number;
  readonly restaurantId: string;
  readonly status: ReservationStatus;
  readonly customer: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly table: string;
  readonly guests: number;
  readonly notes?: string;
  readonly arrivedAt?: string;
  readonly completedAt?: string;
}
export interface AttendanceCommand {
  readonly id: number;
  readonly action: AttendanceAction;
  readonly expectedVersion: string;
}
export type AttendanceResult =
  {readonly ok: true; readonly reservations: readonly AttendanceReservation[]; readonly reservation: AttendanceReservation} |
  {readonly ok: false; readonly reservations: readonly AttendanceReservation[]; readonly reason: string};

export const ATTENDANCE_RESTAURANT = 'muestra-la-mesa-verde';
export const ARRIVAL_TOLERANCE_MS = 15 * 60 * 1000;
export const ATTENDANCE_SAMPLE_NOW = '2026-10-24T19:05:00-05:00';
export const SAMPLE_RESERVATIONS: readonly AttendanceReservation[] = Object.freeze([
  Object.freeze({id: 208, restaurantId: ATTENDANCE_RESTAURANT, status: 'Confirmada' as const, customer: 'Ana Pérez',
    startsAt: '2026-10-24T19:00:00-05:00', endsAt: '2026-10-24T20:30:00-05:00', table: 'Mesa 04', guests: 4,
    notes: 'Preferimos una mesa junto a la ventana.'})
]);

export function validReservation(reservation: AttendanceReservation): boolean {
  const start = Date.parse(reservation.startsAt), end = Date.parse(reservation.endsAt);
  const arrival = reservation.arrivedAt === undefined ? undefined : Date.parse(reservation.arrivedAt);
  const completion = reservation.completedAt === undefined ? undefined : Date.parse(reservation.completedAt);
  return Number.isSafeInteger(reservation.id) && reservation.id > 0 &&
    ['Pendiente','Confirmada','Rechazada','Cancelada','Expirada','Completada'].includes(reservation.status) &&
    typeof reservation.customer === 'string' && !!reservation.customer.trim() &&
    typeof reservation.table === 'string' && !!reservation.table.trim() &&
    Number.isSafeInteger(reservation.guests) && reservation.guests > 0 &&
    Number.isFinite(start) && Number.isFinite(end) && end > start &&
    (arrival === undefined || (Number.isFinite(arrival) && arrival < start + ARRIVAL_TOLERANCE_MS)) &&
    (reservation.status === 'Completada' ? arrival !== undefined && completion !== undefined &&
      Number.isFinite(completion) && completion >= start && completion >= arrival : completion === undefined);
}

export function attendanceProblem(reservation: AttendanceReservation, action: AttendanceAction, now: string): string {
  if (!validReservation(reservation) || !Number.isFinite(Date.parse(now))) {
    return 'Los datos o las fechas de la muestra están incompletos. Revisa la reserva antes de continuar.';
  }
  const current = Date.parse(now), start = Date.parse(reservation.startsAt);
  if (action === 'arrival' && reservation.arrivedAt !== undefined) return 'La llegada ya fue registrada. Se conserva su fecha y hora original.';
  if (reservation.status === 'Completada') return 'La reserva ya está Completada. Se conserva su fecha y hora de finalización.';
  if (reservation.status !== 'Confirmada') return `La reserva está ${reservation.status}. Solo una reserva Confirmada admite esta operación.`;
  if (action === 'arrival') {
    return current >= start + ARRIVAL_TOLERANCE_MS ? 'Venció la tolerancia de 15 minutos sin llegada. No se registró una llegada tardía.' : '';
  }
  if (action !== 'complete') return 'La acción solicitada no está disponible.';
  if (reservation.arrivedAt === undefined) return 'Registra la llegada antes de completar la atención.';
  if (Date.parse(reservation.arrivedAt) > current) return 'La llegada registrada es posterior al reloj de muestra. Revisa las fechas.';
  if (current < start) return 'No se puede completar la atención antes de la hora de inicio.';
  return '';
}

/** Operación pura de muestra; el servidor validará permisos, reloj y escrituras reales al integrar. */
export function updateAttendanceSample(reservations: readonly AttendanceReservation[], command: AttendanceCommand,
  now: string, restaurantId = ATTENDANCE_RESTAURANT): AttendanceResult {
  const reject = (reason: string): AttendanceResult => ({ok: false, reservations, reason});
  const matches = reservations.filter(r => r.id === command.id && r.restaurantId === restaurantId);
  if (!Number.isSafeInteger(command.id) || command.id < 1 || matches.length !== 1) {
    return reject('No se encontró la reserva en este restaurante. No se aplicó ningún cambio.');
  }
  const current = matches[0], problem = attendanceProblem(current, command.action, now);
  if (problem) return reject(problem);
  if (reservationVersion(current) !== command.expectedVersion) {
    return reject('La reserva cambió mientras revisabas la confirmación. Revisa sus datos antes de iniciar otra acción.');
  }
  const stamp = new Date(now).toISOString();
  const updated: AttendanceReservation = command.action === 'arrival' ? {...current, arrivedAt: stamp} :
    {...current, status: 'Completada', completedAt: stamp};
  return {ok: true, reservation: updated, reservations: reservations.map(r => r === current ? updated : r)};
}

export function reservationVersion(reservation: AttendanceReservation): string {
  return JSON.stringify([reservation.id, reservation.restaurantId, reservation.status, reservation.startsAt,
    reservation.endsAt, reservation.customer, reservation.table, reservation.guests, reservation.notes,
    reservation.arrivedAt, reservation.completedAt]);
}

export function attendanceDestination(reservation: AttendanceReservation): {path: string; vista?: string} {
  if (reservation.status === 'Completada') return {path: '/operacion/reserva', vista: 'op-reserva-completada'};
  return {path: reservation.arrivedAt ? '/operacion/reserva/atendiendo' : '/operacion/reserva/llegada'};
}
export function attendanceDate(value: string): string {
  if (!Number.isFinite(Date.parse(value))) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-PE', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone: 'America/Lima'}).format(new Date(value));
}
export function attendanceTime(value: string): string {
  if (!Number.isFinite(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat('es-PE', {hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima'}).format(new Date(value));
}
