import {Component} from '@angular/core';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-inicio: controlador conectado; presentación pendiente de Figma MCP. */
@Component({selector:'rp-cliente-inicio',imports:[],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-inicio.html',styleUrl:'./cliente-inicio.css'})
export class ClienteInicioPage extends CartaPage {
}
