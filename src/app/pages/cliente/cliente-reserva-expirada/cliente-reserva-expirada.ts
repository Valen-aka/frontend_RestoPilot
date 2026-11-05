import {Component} from '@angular/core';
import {ReservaExpiradaView} from '../../reserva-expirada-ui/reserva-expirada-view';
/** Consulta compartida de reservas propias; conserva el estado recibido de la API. */
@Component({selector:'rp-cliente-reserva-expirada',imports:[ReservaExpiradaView],templateUrl:'./cliente-reserva-expirada.html',styleUrl:'./cliente-reserva-expirada.css'})
export class ClienteReservaExpiradaPage {}
