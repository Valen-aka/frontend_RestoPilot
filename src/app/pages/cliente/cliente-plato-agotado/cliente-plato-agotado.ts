import {Component} from '@angular/core';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-plato-agotado: controlador conectado; presentación pendiente de Figma MCP. */
@Component({selector:'rp-cliente-plato-agotado',imports:[],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-plato-agotado.html',styleUrl:'./cliente-plato-agotado.css'})
export class ClientePlatoAgotadoPage extends CartaPage {
  protected override readonly detailMode = true;
}
