export type ExpiryContext = 'client' | 'operation';
export type ReservationState = 'Pendiente' | 'Confirmada' | 'Rechazada' | 'Cancelada' | 'Completada' | 'Expirada';
export type ExpiryReason = 'unconfirmed' | 'no-arrival';
export interface ExpiryReservation {
  readonly id: number;
  readonly restaurantId: string;
  readonly clientId: string;
  readonly restaurant: string;
  readonly customer: string;
  readonly status: ReservationState;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly table: string;
  readonly guests: number;
  readonly notes?: string;
  readonly arrivedAt?: string;
  readonly completedAt?: string;
  readonly expiredAt?: string;
  readonly expiryReason?: ExpiryReason;
}
export const EXPIRY_RESTAURANT = 'muestra-la-mesa-verde';
export const EXPIRY_CLIENT = 'cliente-de-muestra';
export const EXPIRY_TOLERANCE_MS = 15 * 60 * 1000;
export const EXPIRY_SAMPLES: readonly ExpiryReservation[] = Object.freeze([
  Object.freeze({id: 190, restaurantId: EXPIRY_RESTAURANT, clientId: EXPIRY_CLIENT, restaurant: 'La Mesa Verde', customer: 'Ana Pérez',
    status: 'Expirada' as const, startsAt: '2026-10-17T19:00:00-05:00', endsAt: '2026-10-17T20:30:00-05:00',
    table: 'Mesa 01', guests: 4, notes: 'Preferimos una mesa junto a la ventana.',
    expiredAt: '2026-10-17T19:00:00-05:00', expiryReason: 'unconfirmed' as const}),
  Object.freeze({id: 207, restaurantId: EXPIRY_RESTAURANT, clientId: EXPIRY_CLIENT, restaurant: 'La Mesa Verde', customer: 'Ana Pérez',
    status: 'Expirada' as const, startsAt: '2026-10-24T19:00:00-05:00', endsAt: '2026-10-24T20:30:00-05:00',
    table: 'Mesa 02', guests: 4, notes: 'Preferimos una mesa junto a la ventana.',
    expiredAt: '2026-10-24T19:15:00-05:00', expiryReason: 'no-arrival' as const})
]);
export function belongsToExpiryContext(reservation: ExpiryReservation, context: ExpiryContext): boolean {
  return context === 'client' ? reservation.clientId === EXPIRY_CLIENT : reservation.restaurantId === EXPIRY_RESTAURANT;
}
export function validExpiryReservation(reservation: ExpiryReservation): boolean {
  return Number.isSafeInteger(reservation.id) && reservation.id > 0 &&
    ['Pendiente','Confirmada','Rechazada','Cancelada','Completada','Expirada'].includes(reservation.status) &&
    typeof reservation.restaurant === 'string' && !!reservation.restaurant.trim() &&
    typeof reservation.table === 'string' && !!reservation.table.trim() &&
    Number.isSafeInteger(reservation.guests) && reservation.guests > 0 &&
    Number.isFinite(Date.parse(reservation.startsAt)) && Number.isFinite(Date.parse(reservation.endsAt)) &&
    Date.parse(reservation.endsAt) > Date.parse(reservation.startsAt);
}
/** Consulta de fixtures. No modifica estados ni concede permisos reales. */
export function expiredHistory(reservations: readonly ExpiryReservation[], context: ExpiryContext): ExpiryReservation[] {
  return reservations.filter(reservation => belongsToExpiryContext(reservation, context) && reservation.status === 'Expirada');
}
/** Regla temporal pura para verificación; nunca guarda ni publica la expiración. */
export function expiryEligibility(reservation: ExpiryReservation, now: string): boolean | undefined {
  const current = Date.parse(now), start = Date.parse(reservation.startsAt);
  if (!validExpiryReservation(reservation) || !Number.isFinite(current)) return undefined;
  if (reservation.status === 'Pendiente') return current >= start;
  if (reservation.status !== 'Confirmada') return false;
  if (reservation.arrivedAt !== undefined) {
    const arrival = Date.parse(reservation.arrivedAt);
    return !Number.isFinite(arrival) || arrival >= start + EXPIRY_TOLERANCE_MS ? undefined : false;
  }
  return current >= start + EXPIRY_TOLERANCE_MS;
}
export function expirationIssue(reservation: ExpiryReservation): string {
  if (!reservation.expiredAt) return 'La fecha de vencimiento no está disponible en esta consulta.';
  const expiration = Date.parse(reservation.expiredAt), start = Date.parse(reservation.startsAt);
  if (!Number.isFinite(expiration) || expiration < start) return 'La fecha de vencimiento recibida no es válida. No se ha calculado una fecha alternativa.';
  if (reservation.expiryReason === 'no-arrival' &&
    (reservation.arrivedAt !== undefined || expiration < start + EXPIRY_TOLERANCE_MS)) {
    return 'Los datos no permiten confirmar la causa o la fecha de vencimiento por falta de llegada.';
  }
  return '';
}
export function expirationDate(reservation: ExpiryReservation): string {
  return expirationIssue(reservation) ? 'No disponible' : formatExpiryDate(reservation.expiredAt!);
}
export function expirationReason(reservation: ExpiryReservation): string {
  if (reservation.status !== 'Expirada') return 'La reserva no figura como Expirada en los datos consultados.';
  if (reservation.expiryReason === 'unconfirmed') return 'La solicitud seguía pendiente de confirmación cuando llegó su hora de inicio.';
  if (reservation.expiryReason === 'no-arrival' && !expirationIssue(reservation)) return 'No se registró la llegada dentro de los 15 minutos de tolerancia desde el inicio.';
  return 'La reserva figura como Expirada. El motivo específico no está disponible en esta consulta.';
}
export function formatExpiryDate(value: string): string {
  if (!Number.isFinite(Date.parse(value))) return 'No disponible';
  return new Intl.DateTimeFormat('es-PE', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone: 'America/Lima'}).format(new Date(value));
}
