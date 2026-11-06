import {Component} from '@angular/core';
import {CartaView} from '../carta-ui/carta-view';
/** US10: consulta real; las variantes conservan los datos del servidor. */
@Component({selector:'rp-cliente-carta',imports:[CartaView],templateUrl:'./cliente-carta.html',styleUrl:'./cliente-carta.css'})
export class ClienteCartaPage {}
