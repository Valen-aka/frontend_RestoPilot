import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
@Component({selector:'rp-client-header',imports:[RouterLink,MatButtonModule],templateUrl:'./client-header.html',styleUrl:'./client-header.css'})
export class ClientHeader {
 readonly active = input<'inicio'|'carta'>('carta');
 readonly restaurantId = input<number|null>(null);
 readonly signedIn = input(false);
 readonly links = [
  {label:'Inicio',url:'/cliente',key:'inicio'}, {label:'La carta',url:'/cliente/carta',key:'carta'},
  {label:'Mis reservas',url:'/cliente/reservas',key:'reservas'}, {label:'Mis pedidos',url:'/cliente/pedidos',key:'pedidos'},
  {label:'Asistente IA',url:'/cliente/asistente',key:'asistente'}
 ];
}
