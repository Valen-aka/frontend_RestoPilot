import {Component} from '@angular/core';
import {CartaView} from '../carta-ui/carta-view';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-inicio: presentación Figma y controlador de catálogo compartido. */
@Component({selector:'rp-cliente-inicio',imports:[CartaView],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-inicio.html',styleUrl:'./cliente-inicio.css'})
export class ClienteInicioPage extends CartaPage {
}
