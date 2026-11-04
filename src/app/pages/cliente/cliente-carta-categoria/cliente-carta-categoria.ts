import {Component} from '@angular/core';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-carta-categoria: controlador conectado; presentación pendiente de Figma MCP. */
@Component({selector:'rp-cliente-carta-categoria',imports:[],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-carta-categoria.html',styleUrl:'./cliente-carta-categoria.css'})
export class ClienteCartaCategoriaPage extends CartaPage {
}
