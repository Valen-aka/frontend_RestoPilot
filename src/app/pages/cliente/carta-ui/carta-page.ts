import {Directive, DestroyRef, OnInit, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {validQuantity} from '../../../core/models/pedido-api.model';
import type {PlatoResponse} from '../../../core/models/catalogo-api.model';
import {CartaStore} from './carta-store';
import {CartaSelection} from './carta-selection';
import {cartaContext, dishImage, type CartaContext} from './carta.model';

/** Controlador sin presentación. Las plantillas esperan el contexto Figma autorizado. */
@Directive()
export abstract class CartaPage implements OnInit {
  readonly store = inject(CartaStore);
  readonly selection = inject(CartaSelection);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly detailMode: boolean = false;
  protected readonly recommendationMode: boolean = false;
  private context: CartaContext | null = null;
  private destroyed = false;
  readonly navigationError = signal('');
  private readonly failedImages = signal<ReadonlySet<string>>(new Set());
  readonly quantity = new FormControl(1, {nonNullable: true,
    validators: control => validQuantity(control.value) ? null : {quantity: true}});

  constructor() {
    this.destroyRef.onDestroy(() => {this.destroyed = true;});
  }
  ngOnInit(): void {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationStart) {this.selection.cancel(); this.store.cancel();}
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.selection.cancel(); this.navigationError.set(''); this.quantity.reset(1);
      this.failedImages.set(new Set());
      this.context = cartaContext(params, this.detailMode);
      this.store.load(this.context);
    });
  }
  retry(): void {
    if (!this.destroyed && this.context) {this.selection.cancel(); this.store.load(this.context);}
  }
  chooseRestaurant(id: number): void {
    if (this.store.state() !== 'ready' || !this.store.restaurants().some(r => r.id === id)) return;
    this.navigate('/cliente/carta', {restauranteId: id});
  }
  chooseCategory(id: number | null): void {
    const restaurant = this.store.restaurant();
    if (!restaurant || this.store.state() !== 'ready' ||
        (id !== null && !this.store.categories().some(c => c.id === id))) return;
    this.navigate('/cliente/carta', {restauranteId: restaurant.id, ...(id === null ? {} : {categoriaId: id})});
  }
  openDish(id: number): void {
    const restaurant = this.store.restaurant();
    const dish = this.store.visibleDishes().find(p => p.id === id);
    if (!restaurant || !dish || this.store.state() !== 'ready') return;
    this.navigate('/cliente/plato', {restauranteId: restaurant.id, platoId: dish.id,
      ...(this.store.categoryId() === null ? {} : {categoriaId: this.store.categoryId()!})});
  }
  backToMenu(): void {
    const id = this.context?.restauranteId;
    this.navigate('/cliente/carta', id ? {restauranteId: id} : {});
  }
  backToRecommendation(): void {
    const id = this.context?.restauranteId;
    this.navigate('/cliente/asistente', {vista: 'cliente-ia-recomendaciones', ...(id ? {restauranteId: id} : {})});
  }
  addDish(id: number): void {
    if (this.destroyed || this.recommendationMode || this.store.state() !== 'ready') return;
    const restaurant = this.store.restaurant();
    const dish = this.detailMode ? this.store.detail() : this.store.visibleDishes().find(p => p.id === id);
    if (!restaurant || !dish || dish.id !== id) return;
    if (this.detailMode && this.quantity.invalid) {this.quantity.markAsTouched(); return;}
    this.selection.add(restaurant, dish, this.detailMode ? this.quantity.value : 1);
  }
  imageFor(dish: PlatoResponse): string | null {
    const url = dishImage(dish.imagenUrl);
    return url && !this.failedImages().has(url) ? url : null;
  }
  imageFailed(url: string): void {
    this.failedImages.update(previous => new Set([...previous, url]));
  }
  private navigate(path: string, queryParams: Record<string, string | number>): void {
    if (this.destroyed) return;
    this.selection.cancel(); this.store.cancel(); this.navigationError.set('');
    void this.router.navigate([path], {queryParams}).then(ok => {
      if (!ok && !this.destroyed) {this.navigationError.set('No se pudo cambiar de pantalla. Puedes reintentar.'); this.retry();}
    }).catch(() => {
      if (!this.destroyed) {this.navigationError.set('No se pudo cambiar de pantalla. Puedes reintentar.'); this.retry();}
    });
  }
}
