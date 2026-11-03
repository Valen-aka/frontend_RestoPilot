import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {forkJoin, Subscription} from 'rxjs';
import {CatalogoService} from '../../../core/services/catalogo.service';
import type {CategoriaResponse, PlatoResponse, RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {readCartaPlato} from '../../../core/models/catalogo-query.model';
import {cartaSessionKey, type CartaContext} from './carta.model';
import {API_SESSION} from '../../../core/auth/api-session';

/** Consulta por vista. No mantiene otro carrito ni otra sesión. */
@Injectable()
export class CartaStore {
  private readonly api = inject(CatalogoService);
  private readonly session = inject(API_SESSION);
  private readonly owner = signal<string | null>(null);
  private lastContext: CartaContext | null = null;
  private destroyed = false;
  private request?: Subscription;
  private generation = 0;
  private readonly stateData = signal<'loading' | 'ready' | 'error' | 'session'>('session');
  private readonly errorData = signal('');
  private readonly restaurantsData = signal<readonly RestauranteResponse[]>([]);
  private readonly restaurantData = signal<RestauranteResponse | null>(null);
  private readonly categoriesData = signal<readonly CategoriaResponse[]>([]);
  private readonly dishesData = signal<readonly PlatoResponse[]>([]);
  private readonly detailData = signal<PlatoResponse | null>(null);
  private readonly categoryIdData = signal<number | null>(null);
  private readonly ownsData = computed(() => this.owner() !== null && this.owner() === cartaSessionKey(this.session()));
  readonly state = computed(() => this.ownsData() ? this.stateData() : 'session');
  readonly error = computed(() => this.ownsData() ? this.errorData() : '');
  readonly restaurants = computed(() => this.ownsData() ? this.restaurantsData() : []);
  readonly restaurant = computed(() => this.ownsData() ? this.restaurantData() : null);
  readonly categories = computed(() => this.ownsData() ? this.categoriesData() : []);
  readonly dishes = computed(() => this.ownsData() ? this.dishesData() : []);
  readonly detail = computed(() => this.ownsData() ? this.detailData() : null);
  readonly categoryId = computed(() => this.ownsData() ? this.categoryIdData() : null);
  readonly visibleDishes = computed(() => this.dishes().filter(p => this.categoryId() === null || p.categoriaId === this.categoryId()));
  readonly empty = computed(() => this.state() === 'ready' && !this.lastContext?.detail &&
    (this.restaurant() ? this.visibleDishes().length === 0 : this.restaurants().length === 0));
  readonly soldOut = computed(() => this.state() === 'ready' && this.detail()?.disponible === false);
  constructor() {
    effect(() => {
      const identity = cartaSessionKey(this.session());
      if (identity !== untracked(this.owner)) untracked(() => {
        if (this.lastContext) this.load(this.lastContext);
        else this.cancel();
      });
    });
    inject(DestroyRef).onDestroy(() => {this.destroyed = true; this.cancel();});
  }
  /** Consulta o reintento. La autorización se obtiene de API_SESSION, no de la vista. */
  load(context: CartaContext): void {
    if (this.destroyed) return;
    this.cancel();
    this.lastContext = {...context};
    const generation = this.generation;
    const identity = cartaSessionKey(this.session());
    this.owner.set(identity);
    this.categoryIdData.set(context.categoriaId);
    if (!identity) return;
    const current = () => !this.destroyed && generation === this.generation && identity === cartaSessionKey(this.session());
    if (context.invalid) {this.fail(new Error('El enlace no contiene identificadores válidos. Vuelve a elegir un restaurante y un plato.')); return;}
    this.stateData.set('loading');
    const rid = context.restauranteId;
    if (rid === null) {
      this.request = this.api.restaurantes().subscribe({next: restaurants => {
        if (!current()) return;
        this.restaurantsData.set(restaurants); this.stateData.set('ready');
      }, error: error => {if (current()) this.fail(error);}});
      return;
    }
    if (context.detail) {
      this.request = forkJoin({restaurant: this.api.restaurante(rid), dish: this.api.plato(context.platoId!,rid)}).subscribe({
        next: data => {if (!current()) return;
          this.restaurantData.set(data.restaurant); this.detailData.set(data.dish); this.stateData.set('ready');},
        error: error => {if (current()) this.fail(error);}
      });
    } else {
      this.request = forkJoin({restaurant: this.api.restaurante(rid), categories: this.api.categorias(rid), dishes: this.api.platos(rid)}).subscribe({
        next: data => {if (!current()) return;
          try {
            if (context.categoriaId !== null && !data.categories.some(c=>c.id===context.categoriaId)) throw new Error('No se encontró la categoría de este restaurante.');
            const dishes = data.dishes.map(p=>readCartaPlato(p,rid));
            this.restaurantData.set(data.restaurant); this.categoriesData.set(data.categories); this.dishesData.set(dishes); this.stateData.set('ready');
          } catch(error) {this.fail(error);}
        }, error: error => {if (current()) this.fail(error);}
      });
    }
  }
  /** Invalida el contexto sin alterar los identificadores de otros módulos. */
  cancel(): void {
    ++this.generation; this.request?.unsubscribe(); this.lastContext = null;
    this.owner.set(null); this.stateData.set('session'); this.errorData.set('');
    this.restaurantsData.set([]); this.restaurantData.set(null); this.categoriesData.set([]);
    this.dishesData.set([]); this.detailData.set(null); this.categoryIdData.set(null);
  }
  private fail(error: unknown): void {
    this.stateData.set('error');
    this.errorData.set(error instanceof HttpErrorResponse ?
      error.status === 401 ? 'Tu sesión ya no es válida. Vuelve a iniciar sesión.' :
      error.status === 403 ? 'No tienes permiso para consultar esta carta.' :
      error.status === 404 ? 'No se encontró el restaurante o el plato solicitado.' :
      'No pudimos consultar la carta. Revisa tu conexión e inténtalo otra vez.' :
      error instanceof Error ? error.message : 'Los datos recibidos no son válidos.');
  }
}
