import {Component} from '@angular/core';
import {ReservaExpiradaView} from '../../reserva-expirada-ui/reserva-expirada-view';
/** Consulta compartida de reservas propias; conserva el estado recibido de la API. */
@Component({selector:'rp-cliente-reserva-completada',imports:[ReservaExpiradaView],templateUrl:'./cliente-reserva-completada.html',styleUrl:'./cliente-reserva-completada.css'})
export class ClienteReservaCompletadaPage {}
