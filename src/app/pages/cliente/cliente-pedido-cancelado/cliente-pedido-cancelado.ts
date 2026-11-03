import {Component} from '@angular/core';
import {PedidoSelectionView} from '../pedido-ui/pedido-selection-view';

/** Variante visual; el estado y los datos proceden de la consulta del pedido propio. */
@Component({selector:'rp-cliente-pedido-cancelado',imports:[PedidoSelectionView],templateUrl:'./cliente-pedido-cancelado.html',styleUrl:'./cliente-pedido-cancelado.css'})
export class ClientePedidoCanceladoPage {}
