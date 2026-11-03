import {ReservaResponse, reservaTime} from '../../../core/models/reserva-api.model';
import {AttendanceReservation, ReservationStatus} from './reserva-atencion.model';
const status:Record<ReservaResponse['estado'],ReservationStatus>={PENDIENTE:'Pendiente',CONFIRMADA:'Confirmada',RECHAZADA:'Rechazada',CANCELADA:'Cancelada',EXPIRADA:'Expirada',COMPLETADA:'Completada'};
export function attendanceReservation(r:ReservaResponse):AttendanceReservation {
  return Object.freeze({id:r.id,restaurantId:String(r.restauranteId),customer:r.clienteNombre,status:status[r.estado],
    startsAt:r.fecha+'T'+reservaTime(r.horaInicio)+'-05:00',endsAt:r.fecha+'T'+reservaTime(r.horaFin)+'-05:00',
    table:'Mesa '+r.mesaNumero,guests:r.numeroComensales,notes:r.notas??undefined,
    arrivedAt:r.llegadaRegistradaEn?r.llegadaRegistradaEn+'-05:00':undefined,
    completedAt:r.completadaEn?r.completadaEn+'-05:00':undefined});
}
