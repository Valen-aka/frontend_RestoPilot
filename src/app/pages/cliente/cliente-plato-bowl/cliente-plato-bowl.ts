import {Component} from '@angular/core';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-plato-bowl: controlador conectado; presentación pendiente de Figma MCP. */
@Component({selector:'rp-cliente-plato-bowl',imports:[],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-plato-bowl.html',styleUrl:'./cliente-plato-bowl.css'})
export class ClientePlatoBowlPage extends CartaPage {
  protected override readonly detailMode = true;
  protected override readonly recommendationMode = true;
}
