import {Component, inject} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../core/services/auth.service';
@Component({selector:'rp-client-header',imports:[RouterLink,MatButtonModule],templateUrl:'./client-header.html',styleUrl:'./client-header.css'})
export class ClientHeader {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(this.router.events.pipe(
    filter((event):event is NavigationEnd => event instanceof NavigationEnd),
    map(event=>event.urlAfterRedirects)
  ),{initialValue:this.router.url});
  readonly links = [
    {label:'Inicio',url:'/cliente',paths:['/cliente']},
    {label:'La carta',url:'/cliente/carta',paths:['/cliente/carta','/cliente/plato']},
    {label:'Mis reservas',url:'/cliente/reservas',paths:['/cliente/reservas','/cliente/reservar','/cliente/reserva','/cliente/plano']},
    {label:'Mis pedidos',url:'/cliente/pedidos',paths:['/cliente/pedidos','/cliente/pedido','/cliente/carrito','/cliente/entrega','/cliente/pago']},
    {label:'Asistente IA',url:'/cliente/asistente',paths:['/cliente/asistente','/cliente/notificaciones/ia']},
    {label:'Notificaciones',url:'/cliente/notificaciones',paths:['/cliente/notificaciones']}
  ];
  active(link: typeof this.links[number]): boolean {
    const path = this.currentUrl().split(/[?#]/)[0];
    return link.paths.some(candidate => path === candidate || (candidate !== '/cliente' && candidate !== '/cliente/notificaciones' && path.startsWith(candidate + '/')));
  }
  logout(): void { this.auth.logout(); void this.router.navigate(['/auth/login']); }
}
