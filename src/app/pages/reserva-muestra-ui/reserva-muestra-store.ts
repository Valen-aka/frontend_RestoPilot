import {Injectable, signal} from '@angular/core';
import {SAMPLE_RESERVATIONS} from '../operacion/reserva-atencion-ui/reserva-atencion.model';
import {EXPIRY_CLIENT, EXPIRY_SAMPLES} from '../reserva-expirada-ui/reserva-expirada.model';
import {reservationSamples} from './reserva-muestra.model';

/** Única colección de muestra para atención e historial. Se reinicia al recargar. */
@Injectable({providedIn: 'root'})
export class ReservaMuestraStore {
  readonly reservations = signal(reservationSamples(SAMPLE_RESERVATIONS, EXPIRY_SAMPLES, EXPIRY_CLIENT, 'La Mesa Verde'));
}
