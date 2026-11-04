import {Component} from '@angular/core';
import {CartaView} from '../carta-ui/carta-view';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-plato-agotado: presentación Figma y controlador de catálogo compartido. */
@Component({selector:'rp-cliente-plato-agotado',imports:[CartaView],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-plato-agotado.html',styleUrl:'./cliente-plato-agotado.css'})
export class ClientePlatoAgotadoPage extends CartaPage {
  protected override readonly detailMode = true;
}
