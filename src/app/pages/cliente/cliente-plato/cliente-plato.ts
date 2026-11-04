import {Component} from '@angular/core';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-plato: controlador conectado; presentación pendiente de Figma MCP. */
@Component({selector:'rp-cliente-plato',imports:[],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-plato.html',styleUrl:'./cliente-plato.css'})
export class ClientePlatoPage extends CartaPage {
  protected override readonly detailMode = true;
}
