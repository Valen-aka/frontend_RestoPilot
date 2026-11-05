import {Component} from '@angular/core';
import {ReservaExpiradaView} from '../../reserva-expirada-ui/reserva-expirada-view';
/** Consulta compartida de reservas propias; conserva el estado recibido de la API. */
@Component({selector:'rp-cliente-reservas',imports:[ReservaExpiradaView],templateUrl:'./cliente-reservas.html',styleUrl:'./cliente-reservas.css'})
export class ClienteReservasPage {}
