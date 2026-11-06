import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {catchError, defer, finalize, forkJoin, map, Observable, Subscription, throwError} from 'rxjs';
import {CatalogoService} from '../../../core/services/catalogo.service';
import type {DetallePedidoRequest} from '../../../core/models/pedido-api.model';
import {API_SESSION, activeClientSession} from '../../../core/auth/api-session';
import {PedidoService} from '../../../core/services/pedido.service';
import {PedidoProtocolError, PedidoResponse, TipoEntrega} from '../../../core/models/pedido-api.model';
import {buildPedidoRequest, CartDraft, selectionError, validQuantity} from './carrito.model';
export {validQuantity} from './carrito.model';
export type {DraftLine, RestaurantConditions} from './carrito.model';

/** Borrador real. Las dependencias no conectadas no se sustituyen por muestras. */
@Injectable({providedIn: 'root'})
export class CarritoStore {
  private readonly session = inject(API_SESSION);
  private readonly pedidos = inject(PedidoService);
  private readonly catalogo = inject(CatalogoService);
  private readonly draftState = signal<CartDraft | null>(null);
  private readonly result = signal<{owner: string; order: PedidoResponse} | null>(null);
  private readonly sending = signal(false);
  private readonly uncertainState = signal(false);
  private readonly errorState = signal('');
  private request?: Subscription;
  private owner = this.session()?.subject ?? null;
  private attempt = 0;
  private selectionAttempt = 0;
  readonly draft = this.draftState.asReadonly();
  readonly lines = computed(() => this.draft()?.lines ?? []);
  readonly restaurant = computed(() => this.draft()?.restaurant ?? '');
  readonly conditions = computed(() => this.draft()?.conditions ?? {active: false, open: false, salon: false, delivery: false});
  readonly activeTables = computed(() => this.draft()?.tables.filter(t => t.active && t.restaurantId === this.draft()?.restaurantId) ?? []);
  readonly modality = signal<TipoEntrega>('SALON');
  readonly tableId = signal<number | null>(null);
  readonly address = signal('');
  readonly queryState = signal<'ready' | 'loading' | 'error'>('ready');
  readonly submitting = this.sending.asReadonly();
  readonly uncertain = this.uncertainState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasSession = computed(() => activeClientSession(this.session()));
  readonly created = computed(() => this.result()?.owner === this.session()?.subject && activeClientSession(this.session()) ? this.result()?.order : undefined);
  readonly selectionError = computed(() => selectionError(this.draft()));
  readonly count = computed(() => this.lines().reduce((n, l) => n + (validQuantity(l.quantity) ? l.quantity : 0), 0));
  readonly totalCents = computed(() => this.lines().reduce((n, l) => n + l.unitCents * (validQuantity(l.quantity) ? l.quantity : 0), 0));

  constructor() {
    effect(() => {
      const session = this.session();
      const nextOwner = session?.subject ?? null;
      if (nextOwner !== this.owner || (session && !activeClientSession(session))) {
        this.owner = nextOwner;
        untracked(() => this.resetSession());
      }
    });
    inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());
  }

  /** Selección desde carta: consulta los datos reales sin trasladar HTTP al componente. */
  prepareSelection(restauranteId: number, detalles: readonly DetallePedidoRequest[]): Observable<void> {
    return defer(() => {
      const session = this.session();
      if (!activeClientSession(session)) throw new Error('Inicia sesión como cliente para preparar tu pedido.');
      if (this.submitting() || this.uncertain()) throw new Error('Resuelve el envío anterior antes de cambiar el pedido.');
      if (!Number.isSafeInteger(restauranteId) || restauranteId <= 0 || !detalles.length) throw new Error('Selecciona un restaurante y sus platos.');
      const selectionAttempt = ++this.selectionAttempt;
      this.queryState.set('loading'); this.errorState.set('');
      return forkJoin({restaurant: this.catalogo.restaurante(restauranteId), dishes: this.catalogo.platos(restauranteId),
        tables: this.catalogo.mesas(restauranteId)}).pipe(map(data => {
          if (selectionAttempt !== this.selectionAttempt || this.session()?.subject !== session.subject || !activeClientSession(this.session())) throw new Error('La sesión cambió; vuelve a seleccionar tu pedido.');
          const lines = detalles.map(detail => {
            const dish = data.dishes.find(d => d.id === detail.platoId);
            if (!dish) throw new Error('Un plato ya no pertenece a la carta del restaurante.');
            return {id:dish.id, restaurantId:dish.restauranteId, name:dish.nombre, unitCents:Math.round(dish.precio*100),
              available:dish.disponible, quantity:detail.cantidad, notes:detail.notas};
          });
          const r=data.restaurant;
          this.loadDraft({restaurantId:r.id,restaurant:r.nombre,lines,
            conditions:{active:r.activo,open:r.abierto,salon:r.tieneAtencionFisica,delivery:r.aceptaDelivery},
            tables:data.tables.map(t=>({id:t.id,restaurantId:t.restauranteId,label:'Mesa '+t.numero+' · '+t.capacidad+' personas',active:t.activo}))});
        }),catchError(error => {
          if (selectionAttempt === this.selectionAttempt && this.session()?.subject === session.subject) {
            this.queryState.set('error');
            this.errorState.set('No pudimos actualizar la selección. Vuelve a la carta y revisa sus condiciones.');
          }
          return throwError(() => error);
        }),finalize(() => {if (selectionAttempt === this.selectionAttempt && this.queryState()==='loading') this.queryState.set('ready');}));
    });
  }

  /** Punto de integración del catálogo. No acepta IDs de muestra ni modifica la carta. */
  loadDraft(draft: CartDraft): void {
    if (this.submitting() || this.uncertain()) throw new Error('Resuelve el envío anterior antes de cambiar el pedido.');
    if (!activeClientSession(this.session())) throw new Error('Inicia sesión como cliente antes de preparar tu pedido.');
    const error = selectionError(draft);
    if (error) throw new Error(error);
    this.owner = this.session()!.subject;
    this.draftState.set(Object.freeze({...draft, conditions: Object.freeze({...draft.conditions}),
      lines: Object.freeze(draft.lines.map(l => Object.freeze({...l}))),
      tables: Object.freeze(draft.tables.map(t => Object.freeze({...t})))}));
    this.result.set(null);
    this.errorState.set('');
    this.tableId.set(null);
    this.address.set('');
  }
  /** Solo con el dato recibido del restaurante; conserva líneas, modalidad y mesa. */
  updatePhysicalAttention(restaurantId:number,enabled:boolean):void {
    const draft=this.draft();
    if(!this.hasSession()||this.submitting()||!draft||draft.restaurantId!==restaurantId||draft.conditions.salon===enabled)return;
    this.draftState.set({...draft,conditions:{...draft.conditions,salon:enabled}});
  }
  setQuantity(index: number, quantity: number | null): void {
    if (this.submitting() || this.uncertain()) return;
    this.draftState.update(d => d ? {...d, lines: d.lines.map((l, i) => i === index ? {...l, quantity} : l)} : d);
    this.errorState.set('');
  }
  clear(): void {
    if (this.submitting() || this.uncertain()) return;
    this.draftState.set(null); this.tableId.set(null); this.address.set(''); this.errorState.set('');
  }
  rejection(modality: TipoEntrega, table: number | null, address: string): string {
    if (!activeClientSession(this.session())) return 'Inicia sesión como cliente para registrar tu pedido.';
    if (this.uncertain()) return 'Comprueba con el restaurante si el pedido se registró antes de repetirlo.';
    if (this.queryState() !== 'ready') return 'No pudimos consultar las condiciones. Revisa la selección.';
    try {buildPedidoRequest(this.draft(), modality, table, address); return '';}
    catch (error) {return error instanceof Error ? error.message : 'Revisa los datos del pedido.';}
  }
  submit(modality: TipoEntrega, table: number | null, address: string): void {
    if (this.submitting()) return;
    const error = this.rejection(modality, table, address);
    if (error) {this.errorState.set(error); return;}
    const request = buildPedidoRequest(this.draft(), modality, table, address);
    const session = this.session()!;
    const attempt = ++this.attempt;
    this.sending.set(true); this.errorState.set(''); this.result.set(null);
    // El store conserva el resultado aunque cambie la vista mientras se envía el POST.
    this.request = this.pedidos.crear(request).subscribe({
      next: order => {
        if (attempt !== this.attempt || this.session()?.subject !== session.subject || !activeClientSession(this.session())) return;
        if (String(order.clienteId) !== session.subject) {this.fail(new PedidoProtocolError()); return;}
        this.result.set({owner: session.subject, order});
        this.draftState.set(null); this.tableId.set(null); this.address.set('');
        this.sending.set(false);
      },
      error: cause => {if (attempt === this.attempt && this.session()?.subject === session.subject) this.fail(cause);},
      complete: () => {if (attempt === this.attempt) this.sending.set(false);}
    });
  }
  /** Solo tras comprobar con el restaurante que el envío incierto no se registró. */
  allowRetryAfterReview(): void {this.uncertainState.set(false); this.errorState.set('');}
  private fail(cause: unknown): void {
    this.sending.set(false);
    const http = cause instanceof HttpErrorResponse ? cause : null;
    const uncertain = !http || http.status === 0 || http.status >= 500 || (http.status >= 200 && http.status < 300);
    this.uncertainState.set(uncertain);
    if (uncertain) {
      this.errorState.set('No pudimos confirmar el resultado. Comprueba con el restaurante si se registró antes de volver a enviar.');
    } else if (http.status === 401) {
      this.errorState.set('Tu sesión no es válida. Vuelve a iniciar sesión para continuar.');
    } else if (http.status === 403) {
      this.errorState.set('No tienes permiso para registrar este pedido. Inicia sesión como cliente.');
    } else {
      const body = http.error;
      this.errorState.set(body && typeof body === 'object' && typeof body.mensaje === 'string' && body.mensaje.length <= 500 ?
        body.mensaje : 'El restaurante no pudo aceptar el pedido. Revisa la selección y vuelve a intentarlo.');
    }
  }
  private resetSession(): void {
    this.attempt++; this.selectionAttempt++; this.queryState.set('ready'); this.request?.unsubscribe(); this.sending.set(false);
    this.draftState.set(null); this.result.set(null); this.errorState.set(''); this.uncertainState.set(false);
    this.tableId.set(null); this.address.set('');
  }
}
