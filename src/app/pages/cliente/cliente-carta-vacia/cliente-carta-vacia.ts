import {Component} from '@angular/core';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-carta-vacia: controlador conectado; presentación pendiente de Figma MCP. */
@Component({selector:'rp-cliente-carta-vacia',imports:[],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-carta-vacia.html',styleUrl:'./cliente-carta-vacia.css'})
export class ClienteCartaVaciaPage extends CartaPage {
}
