import {Component,Input} from '@angular/core';
import {RouterLink} from '@angular/router';
@Component({selector:'rp-workspace-shell',imports:[RouterLink],templateUrl:'./workspace-shell.html',styleUrl:'./workspace-shell.css'})
export class WorkspaceShell{
 @Input() role:'owner'|'operation'|'client'|'account'='operation';
 @Input() breadcrumb='Operación';
 @Input() active='inicio';
 readonly navigation=[
 {key:'inicio',label:'Vista general',icon:'▥',url:'/operacion'},
 {key:'pedidos',label:'Pedidos',icon:'▤',url:'/operacion/pedidos'},
 {key:'cocina',label:'Cocina',icon:'♧',url:'/operacion/cocina'},
 {key:'carta',label:'Carta',icon:'▧',url:'/operacion/platos'},
 {key:'reservas',label:'Reservas',icon:'◷',url:'/operacion/reservas'},
 {key:'mesas',label:'Mesas',icon:'⊞',url:'/operacion/mesas'},
 {key:'pagos',label:'Pagos',icon:'▣',url:'/operacion/pagos'},
 {key:'reportes',label:'Reportes',icon:'▥',url:'/operacion/reportes'},
 {key:'notificaciones',label:'Notificaciones',icon:'♧',url:'/operacion/notificaciones'},
 {key:'ia',label:'Asistente de reportes',icon:'✦',url:'/operacion/asistente'}
 ];
 readonly clientNavigation=[{label:'Inicio',url:'/cliente'},{label:'La carta',url:'/cliente/carta'},{label:'Mis reservas',url:'/cliente/reservas'},{label:'Mis pedidos',url:'/cliente/pedidos'}];
}