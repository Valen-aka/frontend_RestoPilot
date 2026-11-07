import {Component, computed, input} from '@angular/core';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
@Component({selector:'rp-cocina-shell',imports:[WorkspaceShell],templateUrl:'./cocina-shell.html',styleUrl:'./cocina-shell.css'})
export class CocinaShell {
 readonly apiMode=input(false);
 readonly restaurantName=input('Mi restaurante');
 readonly restaurantId=input<number|null>(null);
 readonly active=input<'queue'|'board'|'detail'|'reservations'>('queue');
 readonly activeKey=computed(()=>this.active()==='reservations'?'reservas':this.active()==='board'?'cocina':'pedidos');
 readonly sectionLabel=computed(()=>this.active()==='reservations'?'Reservas':this.active()==='board'?'Cocina':'Pedidos');
}
