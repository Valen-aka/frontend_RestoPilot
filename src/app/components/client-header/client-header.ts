import {Brand} from '../brand/brand';
import {Component, computed, inject, signal, ElementRef} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../core/services/auth.service';
import {WorkspaceNotifications} from '../workspace-notifications/workspace-notifications';
@Component({selector:'rp-client-header',imports: [Brand,WorkspaceNotifications,RouterLink,MatButtonModule],templateUrl:'./client-header.html',styleUrl:'./client-header.css'})
export class ClientHeader {
  readonly menuOpen=signal(false);
  private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
  closeMenu(event:Event):void {
    if(this.menuOpen()){event.preventDefault();this.menuOpen.set(false);this.host.nativeElement.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();}
  }

  readonly auth = inject(AuthService);
  readonly accountName=computed(()=>this.auth.session()?.nombreCompleto?.trim()||'Mi cuenta');
  readonly initials=computed(()=>this.accountName().split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0].toLocaleUpperCase('es')).join(''));
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
    {label:'Asistente IA',url:'/cliente/asistente',paths:['/cliente/asistente','/cliente/notificaciones/ia']}
  ];
  active(link: typeof this.links[number]): boolean {
    const path = this.currentUrl().split(/[?#]/)[0];
    return link.paths.some(candidate => path === candidate || (candidate !== '/cliente' && candidate !== '/cliente/notificaciones' && path.startsWith(candidate + '/')));
  }
  logout(): void {this.auth.logout(); void this.router.navigate(['/auth/login']); }
}
