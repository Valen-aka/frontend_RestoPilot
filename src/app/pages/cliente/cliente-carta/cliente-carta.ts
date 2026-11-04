import {Component} from '@angular/core';
import {CartaView} from '../carta-ui/carta-view';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-carta: presentación Figma y controlador de catálogo compartido. */
@Component({selector:'rp-cliente-carta',imports:[CartaView],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-carta.html',styleUrl:'./cliente-carta.css'})
export class ClienteCartaPage extends CartaPage {
}
