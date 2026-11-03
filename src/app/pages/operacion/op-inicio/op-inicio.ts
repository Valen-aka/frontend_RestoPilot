import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
@Component({selector:'rp-op-inicio',imports:[WorkspaceShell,RouterLink,MatButtonModule],templateUrl:'./op-inicio.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./op-inicio.css']})
export class OpInicioPage{
 readonly hours=[{label:'10h',value:3},{label:'11h',value:5},{label:'12h',value:9},{label:'13h',value:11},{label:'14h',value:8},{label:'15h',value:6},{label:'16h',value:4}];
 readonly queue=[{id:1042,mode:'Recoger',status:'Pendiente',amount:'66.00',target:'/operacion/pedido/editar'},{id:1041,mode:'Mesa 02',status:'En preparación',amount:'38.00',target:'/operacion/pedido/editar'},{id:1040,mode:'Delivery',status:'Pendiente',amount:'28.00',target:'/operacion/pedido/editar'}];
}