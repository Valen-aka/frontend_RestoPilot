import {Component} from '@angular/core';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-carta: controlador conectado; presentación pendiente de Figma MCP. */
@Component({selector:'rp-cliente-carta',imports:[],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-carta.html',styleUrl:'./cliente-carta.css'})
export class ClienteCartaPage extends CartaPage {
}
