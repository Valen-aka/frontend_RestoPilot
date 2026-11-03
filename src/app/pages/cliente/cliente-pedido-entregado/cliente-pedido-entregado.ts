import {Component} from '@angular/core';
import {PedidoSelectionView} from '../pedido-ui/pedido-selection-view';

/** Variante visual; el estado y los datos proceden de la consulta del pedido propio. */
@Component({selector:'rp-cliente-pedido-entregado',imports:[PedidoSelectionView],templateUrl:'./cliente-pedido-entregado.html',styleUrl:'./cliente-pedido-entregado.css'})
export class ClientePedidoEntregadoPage {}
