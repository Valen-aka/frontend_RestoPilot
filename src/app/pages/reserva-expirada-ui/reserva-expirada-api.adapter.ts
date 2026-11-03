import {ReservaResponse} from '../../core/models/reserva-api.model';
import {attendanceReservation} from '../operacion/reserva-atencion-ui/reserva-atencion-api.adapter';
import {ExpiryReservation} from './reserva-expirada.model';
export function expiryReservation(r:ReservaResponse):ExpiryReservation {
  return Object.freeze({...attendanceReservation(r),restaurant:r.restauranteNombre,clientId:String(r.clienteId),
    expiredAt:r.expiradaEn?r.expiradaEn+'-05:00':undefined});
}
