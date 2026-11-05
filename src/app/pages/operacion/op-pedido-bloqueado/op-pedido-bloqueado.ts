import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CurrencyPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
@Component({selector:'rp-op-pedido-bloqueado',imports:[WorkspaceShell,RouterLink,CurrencyPipe,MatButtonModule,MatTableModule],templateUrl:'./op-pedido-bloqueado.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./op-pedido-bloqueado.css']})
export class OpPedidoBloqueadoPage {
 readonly columns=['plato','cantidad','precio','subtotal'];
 readonly items=[{name:'Lomo saltado',quantity:1,price:38},{name:'Ají de gallina',quantity:1,price:28}];
}
