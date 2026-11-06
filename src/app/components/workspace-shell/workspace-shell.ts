import {computed, inject} from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'rp-workspace-shell',
  standalone: true,
  imports: [RouterLink,MatButtonModule],
  templateUrl: './workspace-shell.html',
  styleUrl: './workspace-shell.css'
})
export class WorkspaceShell {
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
