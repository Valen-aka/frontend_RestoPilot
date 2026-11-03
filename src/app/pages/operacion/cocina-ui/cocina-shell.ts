import {Component, DOCUMENT, computed, inject, input, signal} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'rp-cocina-shell', imports: [RouterLink, MatButtonModule],
  templateUrl: './cocina-shell.html', styleUrl: './cocina-shell.css'
})
export class CocinaShell {
  private readonly document = inject(DOCUMENT);
  private readonly breakpoint = toSignal(inject(BreakpointObserver).observe('(max-width: 900px)'));
  readonly apiMode=input(false);
  readonly restaurantName=input('Restaurante de la sesión');
  readonly restaurantId=input<number|null>(null);
  private readonly auth=inject(AuthService);
  private readonly router=inject(Router);
  logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
  readonly mobile = computed(() => this.breakpoint()?.matches ?? false);
  readonly menuOpen = signal(false);
  readonly active = input<'queue' | 'board' | 'detail' | 'reservations'>('queue');
  readonly activePath = computed(() => this.active() === 'reservations' ? '/operacion/reservas' : this.active() === 'board' ? '/operacion/cocina' : '/operacion/pedidos');
  readonly sectionLabel = computed(() => this.active() === 'reservations' ? 'Reservas operación' : 'Pedidos operación');
  readonly links = [
    {label: 'Vista general', icon: '◫', path: '/operacion'},
    {label: 'Pedidos', icon: '▤', path: '/operacion/pedidos'},
    {label: 'Cocina', icon: '♧', path: '/operacion/cocina'},
    {label: 'Carta', icon: '▧', path: '/operacion/platos'},
    {label: 'Reservas', icon: '◷', path: '/operacion/reservas'},
    {label: 'Mesas', icon: '⊞', path: '/operacion/mesas'},
    {label: 'Pagos', icon: '▣', path: '/operacion/pagos'},
    {label: 'Reportes', icon: '↗', path: '/operacion/reportes'},
    {label: 'Notificaciones', icon: '♧', path: '/operacion/notificaciones'},
    {label: 'Asistente de reportes', icon: '✦', path: '/operacion/asistente'}
  ];

  closeMenu(event: Event): void {
    if (!this.mobile() || !this.menuOpen()) return;
    event.preventDefault(); this.menuOpen.set(false);
    this.document.getElementById('kitchen-menu-toggle')?.focus();
  }
  skip(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('kitchen-content');
    main?.focus({preventScroll: true}); main?.scrollIntoView({block: 'start'});
  }
}
