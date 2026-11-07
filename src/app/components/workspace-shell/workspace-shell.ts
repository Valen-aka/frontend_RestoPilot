import {WorkspaceContext} from './workspace-context.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {UiIcon} from '../ui-icon/ui-icon';
import {Brand} from '../brand/brand';
import {afterNextRender, computed, inject, signal} from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'rp-workspace-shell',
  standalone: true,
  imports: [Brand, UiIcon,RouterLink,MatButtonModule],
  templateUrl: './workspace-shell.html',
  styleUrl: './workspace-shell.css'
})
export class WorkspaceShell {
 private readonly breakpoint=toSignal(inject(BreakpointObserver).observe('(max-width:900px)'));
 readonly mobile=computed(()=>this.breakpoint()?.matches??false);
 readonly menuOpen=signal(false); private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 closeMenu(event:Event):void {if(this.mobile()&&this.menuOpen()){event.preventDefault();this.menuOpen.set(false);this.host.nativeElement.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();}}
 get displayRestaurantId():number|null {return this.auth.session()?.restauranteId??this.restaurantId??null;}
 readonly context=inject(WorkspaceContext);
 get displayRestaurantName():string {return this.context.restaurant()?.nombre||'Mi restaurante';}
 onNavigationClick(event:Event):void {if(this.mobile()&&(event.target as HTMLElement).closest('a')){this.menuOpen.set(false);this.host.nativeElement.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();}}
 skipToContent(event:Event):void {event.preventDefault();this.host.nativeElement.querySelector<HTMLElement>('#workspace-content')?.focus();}
 rememberNavigation(event:Event):void {this.context.navigationScroll=(event.target as HTMLElement).scrollTop;}
 constructor(){afterNextRender(()=>{const nav=this.host.nativeElement.querySelector<HTMLElement>('#workspace-navigation');if(nav&&!this.mobile())nav.scrollTop=this.context.navigationScroll;});}


 readonly auth=inject(AuthService);private readonly router=inject(Router);readonly ownerSession=computed(()=>this.auth.session()?.role==='DUENO');
 logout():void{this.auth.logout();this.signOut.emit();void this.router.navigate(['/auth/login']);}


  // Configuración general
  @Input() role: 'owner' | 'operation' | 'client' | 'account' = 'operation';
  @Input() breadcrumb = 'Operación';
  @Input() active = 'inicio';

  // Información de la sesión y del restaurante
  @Input() live = false;
  @Input() restaurantName = 'Tu restaurante';
  @Input() restaurantId: number | null = null;
  @Input() restaurantActive: boolean | null = null;

  // Evento para cerrar sesión
  @Output() signOut = new EventEmitter<void>();

  // Fecha actual
  readonly currentDate = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'long',
    timeZone: 'America/Lima'
  }).format(new Date());

  // Navegación del panel
  readonly navigation = [
    { key: 'inicio', label: 'Vista general', icon: '▥', url: '/operacion' },
    { key: 'pedidos', label: 'Pedidos', icon: '▤', url: '/operacion/pedidos' },
    { key: 'cocina', label: 'Cocina', icon: '♧', url: '/operacion/cocina' },
    { key: 'carta', label: 'Carta', icon: '▧', url: '/operacion/platos' },
    { key: 'reservas', label: 'Reservas', icon: '◷', url: '/operacion/reservas' },
    { key: 'mesas', label: 'Mesas', icon: '⊞', url: '/operacion/mesas' },
    { key: 'pagos', label: 'Pagos', icon: '▣', url: '/operacion/pagos' },
    { key: 'reportes', label: 'Reportes', icon: '▥', url: '/operacion/reportes' },
    { key: 'notificaciones', label: 'Notificaciones', icon: '♧', url: '/operacion/notificaciones' },
    { key: 'ia', label: 'Asistente de reportes', icon: '✦', url: '/operacion/asistente' }
  ];

  // Navegación del cliente
  readonly clientNavigation = [
    { label: 'Inicio', url: '/cliente' },
    { label: 'La carta', url: '/cliente/carta' },
    { label: 'Mis reservas', url: '/cliente/reservas' },
    { label: 'Mis pedidos', url: '/cliente/pedidos' }
  ];
}
