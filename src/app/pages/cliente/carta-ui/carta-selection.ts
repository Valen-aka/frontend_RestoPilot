import {DestroyRef, Injectable, effect, inject, signal, untracked} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {API_SESSION, activeClientSession} from '../../../core/auth/api-session';
import type {PlatoResponse, RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {validQuantity} from '../../../core/models/pedido-api.model';
import {cartaSessionKey} from './carta.model';
import {CarritoStore} from '../carrito-ui/carrito-store';

/** Adaptador US10 → US11. No almacena una segunda selección ni registra pedidos. */
@Injectable()
export class CartaSelection {
  private readonly session = inject(API_SESSION);
  private readonly cart = inject(CarritoStore);
  private readonly router = inject(Router);
  private request?: Subscription;
  private generation = 0;
  private destroyed = false;
  readonly preparing = signal(false);
  readonly error = signal('');
  constructor() {
    let identity = cartaSessionKey(this.session());
    effect(() => {
      const next = cartaSessionKey(this.session());
      if (next !== identity) {identity = next; untracked(() => this.cancel());}
    });
    // También cancela cambios de query, atrás/adelante y navegaciones luego rechazadas.
    const navigation = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.cancel();
    });
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true; navigation.unsubscribe(); this.cancel();
    });
  }
  add(restaurant: RestauranteResponse, dish: PlatoResponse, quantity: number): void {
    if (this.destroyed || this.preparing() || this.router.currentNavigation()) return;
    this.error.set('');
    const session = this.session();
    if (!activeClientSession(session)) {this.error.set('Inicia sesión como cliente para añadir platos.'); return;}
    if (this.cart.submitting() || this.cart.uncertain()) {this.error.set('Revisa el envío anterior en el carrito antes de añadir platos.'); return;}
    if (!restaurant.activo || !restaurant.abierto) {this.error.set('Este restaurante no está recibiendo pedidos.'); return;}
    if (dish.restauranteId !== restaurant.id || !dish.disponible || !validQuantity(quantity)) {
      this.error.set('Selecciona un plato disponible y una cantidad entera válida.'); return;
    }
    const draft = this.cart.draft();
    if (draft && draft.lines.length && draft.restaurantId !== restaurant.id) {
      this.error.set('Tu carrito contiene platos de otro restaurante. Revísalo y vacíalo antes de cambiar de restaurante.'); return;
    }
    const lines = draft?.restaurantId === restaurant.id ? draft.lines : [];
    const existing = lines.find(l => l.id === dish.id);
    const total = quantity + (existing?.quantity ?? 0);
    if (!validQuantity(total) || lines.some(l => !validQuantity(l.quantity))) {
      this.error.set('Revisa las cantidades del carrito antes de añadir este plato.'); return;
    }
    const details = lines.filter(l => l.id !== dish.id).map(l => ({platoId: l.id, cantidad: l.quantity!, notas: l.notes ?? null}));
    details.push({platoId: dish.id, cantidad: total, notas: existing?.notes ?? null});
    const origin = this.router.url;
    const identity = cartaSessionKey(session);
    const generation = ++this.generation;
    this.preparing.set(true);
    this.request = this.cart.prepareSelection(restaurant.id, details).subscribe({
      next: () => {
        const current = this.session();
        if (this.destroyed || generation !== this.generation || cartaSessionKey(current) !== identity ||
            this.router.url !== origin || this.router.currentNavigation()) {this.cancel(); return;}
        this.preparing.set(false);
        void this.router.navigate(['/cliente/carrito']).then(ok => {
          if (!ok && generation === this.generation) this.error.set('La selección está en el carrito. Abre el carrito para continuar.');
        }).catch(() => {if (generation === this.generation) this.error.set('La selección está en el carrito. Abre el carrito para continuar.');});
      },
      error: () => {
        if (generation !== this.generation) return;
        if (cartaSessionKey(this.session()) !== identity) {this.cancel(); return;}
        this.preparing.set(false);
        this.error.set('No pudimos preparar la selección. Revisa disponibilidad, cantidades y sesión antes de reintentar.');
      },
      complete: () => {if (generation === this.generation) this.preparing.set(false);}
    });
  }
  /** La vista también puede invalidar un cambio de contexto que no navega. */
  cancel(): void {++this.generation; this.request?.unsubscribe(); this.preparing.set(false); this.error.set('');}
}
