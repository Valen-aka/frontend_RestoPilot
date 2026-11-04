import {Component} from '@angular/core';
import {CartaView} from '../carta-ui/carta-view';
import {CartaPage} from '../carta-ui/carta-page';
import {CartaStore} from '../carta-ui/carta-store';
import {CartaSelection} from '../carta-ui/carta-selection';
/** cliente-carta-categoria: presentación Figma y controlador de catálogo compartido. */
@Component({selector:'rp-cliente-carta-categoria',imports:[CartaView],providers:[CartaStore,CartaSelection],templateUrl:'./cliente-carta-categoria.html',styleUrl:'./cliente-carta-categoria.css'})
export class ClienteCartaCategoriaPage extends CartaPage {
}
