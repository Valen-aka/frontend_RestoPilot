import {Component} from '@angular/core';
import {CartaView} from '../carta-ui/carta-view';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-plato-bowl: presentación Figma y controlador de catálogo compartido. */
@Component({selector:'rp-cliente-plato-bowl',imports:[CartaView],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-plato-bowl.html',styleUrl:'./cliente-plato-bowl.css'})
export class ClientePlatoBowlPage extends CartaPage {
  protected override readonly detailMode = true;
  protected override readonly recommendationMode = true;
}
