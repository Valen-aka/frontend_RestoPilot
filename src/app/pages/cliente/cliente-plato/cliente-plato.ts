import {Component} from '@angular/core';
import {CartaView} from '../carta-ui/carta-view';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-plato: presentación Figma y controlador de catálogo compartido. */
@Component({selector:'rp-cliente-plato',imports:[CartaView],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-plato.html',styleUrl:'./cliente-plato.css'})
export class ClientePlatoPage extends CartaPage {
  protected override readonly detailMode = true;
}
