import {Component} from '@angular/core';
import {CartaView} from '../carta-ui/carta-view';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-carta-vacia: presentación Figma y controlador de catálogo compartido. */
@Component({selector:'rp-cliente-carta-vacia',imports:[CartaView],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-carta-vacia.html',styleUrl:'./cliente-carta-vacia.css'})
export class ClienteCartaVaciaPage extends CartaPage {
}
