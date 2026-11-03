import {DestroyRef, Injectable, computed, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {forkJoin, Subscription} from 'rxjs';
import {CatalogoService} from '../../../core/services/catalogo.service';
import type {CategoriaResponse, PlatoResponse, RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {readCartaPlato} from '../../../core/models/catalogo-query.model';
import type {CartaContext} from './carta.model';

/** Consulta por vista. No mantiene otro carrito ni otra sesión. */
@Injectable()
export class CartaStore {
  private readonly api = inject(CatalogoService);
  private request?: Subscription;
  private generation = 0;
  readonly state = signal<'loading' | 'ready' | 'error' | 'session'>('session');
  readonly error = signal('');
  readonly restaurants = signal<readonly RestauranteResponse[]>([]);
  readonly restaurant = signal<RestauranteResponse | null>(null);
  readonly categories = signal<readonly CategoriaResponse[]>([]);
  readonly dishes = signal<readonly PlatoResponse[]>([]);
  readonly detail = signal<PlatoResponse | null>(null);
  readonly categoryId = signal<number | null>(null);
  readonly visibleDishes = computed(() => this.dishes().filter(p => this.categoryId() === null || p.categoriaId === this.categoryId()));
  constructor() {inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());}
  load(context: CartaContext, authorized: boolean): void {
    const generation = ++this.generation;
    this.request?.unsubscribe();
    this.restaurants.set([]); this.restaurant.set(null); this.categories.set([]); this.dishes.set([]); this.detail.set(null);
    this.categoryId.set(context.categoriaId); this.error.set('');
    if (!authorized) {this.state.set('session'); return;}
    if (context.invalid) {this.fail(new Error('El enlace no contiene identificadores válidos. Vuelve a elegir un restaurante y un plato.')); return;}
    this.state.set('loading');
    const rid = context.restauranteId;
    if (rid === null) {
      this.request = this.api.restaurantes().subscribe({next: restaurants => {
        if (generation !== this.generation) return;
        this.restaurants.set(restaurants); this.state.set('ready');
      }, error: error => {if (generation === this.generation) this.fail(error);}});
      return;
    }
    if (context.detail) {
      this.request = forkJoin({restaurant: this.api.restaurante(rid), dish: this.api.plato(context.platoId!,rid)}).subscribe({
        next: data => {if (generation !== this.generation) return;
          this.restaurant.set(data.restaurant); this.detail.set(data.dish); this.state.set('ready');},
        error: error => {if (generation === this.generation) this.fail(error);}
      });
    } else {
      this.request = forkJoin({restaurant: this.api.restaurante(rid), categories: this.api.categorias(rid), dishes: this.api.platos(rid)}).subscribe({
        next: data => {if (generation !== this.generation) return;
          try {
            if (context.categoriaId !== null && !data.categories.some(c=>c.id===context.categoriaId)) throw new Error('No se encontró la categoría de este restaurante.');
            const dishes = data.dishes.map(p=>readCartaPlato(p,rid));
            this.restaurant.set(data.restaurant); this.categories.set(data.categories); this.dishes.set(dishes); this.state.set('ready');
          } catch(error) {this.fail(error);}
        }, error: error => {if (generation === this.generation) this.fail(error);}
      });
    }
  }
  private fail(error: unknown): void {
    this.state.set('error');
    this.error.set(error instanceof HttpErrorResponse ?
      error.status === 401 ? 'Tu sesión ya no es válida. Vuelve a iniciar sesión.' :
      error.status === 403 ? 'No tienes permiso para consultar esta carta.' :
      error.status === 404 ? 'No se encontró el restaurante o el plato solicitado.' :
      'No pudimos consultar la carta. Revisa tu conexión e inténtalo otra vez.' :
      error instanceof Error ? error.message : 'Los datos recibidos no son válidos.');
  }
}
