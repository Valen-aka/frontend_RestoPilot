import {Subscription} from 'rxjs';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {AuthService} from '../../../core/services/auth.service';
import {Component, DestroyRef, DOCUMENT, OnInit, computed, effect, inject, input, signal, untracked} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CarritoStore, validQuantity} from './carrito-store';
import {CarritoTable} from './carrito-table';
import {VaciarDialog} from './vaciar-dialog';
import {MODALITY_LABELS, Modality} from '../pedido-ui/pedido.model';

export type CartMode = 'cart' | 'empty' | 'delivery' | 'closed' | 'created';
const MODALITY_VISTAS: Record<Modality, string> = {
  SALON: 'cliente-entrega-salon', DELIVERY: 'cliente-entrega-delivery',
  LLEVAR: 'cliente-entrega-llevar', RECOGER: 'cliente-entrega-recoger'
};

@Component({
  selector: 'rp-carrito-view',
  imports: [CurrencyPipe, RouterLink, ReactiveFormsModule, MatButtonModule, MatButtonToggleModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, CarritoTable],
  templateUrl: './carrito-view.html',
  styleUrls: ['../pedido-ui/pedido-view.css', './carrito-view.css']
})
export class CarritoView implements OnInit {
  readonly store = inject(CarritoStore);
  private readonly physicalApi=inject(CatalogoService);
  private physicalRequest?:Subscription;
  private physicalGeneration=0;
  readonly physicalState=signal<'idle'|'checking'|'enabled'|'disabled'|'error'>('idle');
  readonly physicalBusy=signal(false);
  private readonly auth = inject(AuthService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  readonly mode = input<CartMode>('cart');
  readonly initialModality = input<Modality>('SALON');
  readonly labels = MODALITY_LABELS;
  readonly options: readonly {value: Modality; label: string}[] = [
    {value: 'SALON', label: 'En salón'}, {value: 'DELIVERY', label: 'Delivery'},
    {value: 'LLEVAR', label: 'Para llevar'}, {value: 'RECOGER', label: 'Recoger'}
  ];
  readonly message = signal('');
  readonly isEmpty = computed(() => this.mode() === 'empty' || this.store.lines().length === 0);
  readonly created = computed(() => {
    const id = Number(this.route.snapshot.queryParamMap.get('pedidoId'));
    const order = this.store.created();
    return order && order.id === id ? order : undefined;
  });
  readonly title = computed(() => {
    if (this.mode() === 'closed') return 'Volvemos pronto';
    if (this.mode() === 'created') return 'Confirmación del pedido';
    if (this.isEmpty()) return 'Tu pedido';
    return this.mode() === 'delivery' ? '¿Cómo lo vas a disfrutar?' : 'Tu pedido, a tu gusto';
  });
  readonly subtitle = computed(() => {
    if (this.mode() === 'closed') return 'Por ahora no podemos recibir pedidos.';
    if (this.mode() === 'created') return 'Revisa la confirmación recibida del restaurante.';
    if (this.isEmpty()) return 'Encuentra tu próximo favorito.';
    return this.mode() === 'delivery' ? 'Elige la opción que va contigo.' : 'Una buena elección, dos veces.';
  });
  readonly form = new FormGroup({
    modality: new FormControl<Modality>('SALON', {nonNullable: true}),
    table: new FormControl<number | null>(null),
    address: new FormControl('', {nonNullable: true})
  });
  readonly quantities = signal<readonly FormControl<number | null>[]>([]);
  private readonly lineIds = computed(() => JSON.stringify(this.store.lines().map(line => line.id)));
  readonly canContinue = computed(() => !this.store.selectionError() && this.store.queryState() === 'ready' &&
    this.store.hasSession() && !this.store.submitting() && !this.store.uncertain());

  constructor() {
    this.destroyRef.onDestroy(()=>{this.physicalGeneration++;this.physicalRequest?.unsubscribe();});
    effect(()=>{const mode=this.mode(),rid=this.store.draft()?.restaurantId;this.auth.session();if(mode==='delivery'&&rid&&this.store.hasSession())untracked(()=>this.checkPhysical());});
    effect(onCleanup => {
      this.lineIds();
      const fields = untracked(() => this.store.lines()).map(line => new FormControl<number | null>(line.quantity,
        [Validators.required, control => validQuantity(control.value) ? null : {quantity: true}]));
      this.quantities.set(fields);
      const subscriptions = fields.map((control, index) => control.valueChanges.subscribe(value => {
        this.store.setQuantity(index, value); this.message.set('');
      }));
      onCleanup(() => subscriptions.forEach(subscription => subscription.unsubscribe()));
    });
    effect(() => {
      const pending = this.store.submitting() || this.store.uncertain();
      if (pending) this.form.disable({emitEvent: false}); else this.form.enable({emitEvent: false});
      this.quantities().forEach(control => pending ? control.disable({emitEvent:false}) : control.enable({emitEvent:false}));
      const order = this.store.created();
      if (order && this.mode() === 'delivery') void this.router.navigate(['/cliente/pedido'],
        {queryParams: {vista: 'cliente-pedido-creado', pedidoId: order.id}});
    });
  }

  ngOnInit(): void {
    if (this.mode() === 'delivery') this.store.modality.set(this.initialModality());
    const modality = this.store.modality();
    this.form.setValue({modality, table: this.store.tableId(), address: this.store.address()}, {emitEvent: false});
    if (modality === 'SALON') this.form.controls.table.setValidators([Validators.required,
      control => this.store.activeTables().some(t => t.id === control.value) ? null : {table: true}]);
    if (modality === 'DELIVERY') this.form.controls.address.setValidators([
      Validators.required, Validators.maxLength(255), control => control.value.trim() ? null : {blank: true}]);
    this.form.controls.table.updateValueAndValidity({emitEvent: false});
    this.form.controls.address.updateValueAndValidity({emitEvent: false});
    this.form.controls.modality.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      if (!(value in MODALITY_VISTAS)) return;
      this.store.modality.set(value);
      this.store.tableId.set(null); this.store.address.set('');
      void this.router.navigate(['/cliente/entrega'], {queryParams: {vista: MODALITY_VISTAS[value]}});
    });
    this.form.controls.table.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.store.tableId.set(value); this.message.set('');
    });
    this.form.controls.address.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.store.address.set(value); this.message.set('');
    });
  }

  continue(): void {
    this.quantities().forEach(control => control.markAsTouched());
    if (!this.canContinue()) {this.message.set(this.store.selectionError() || 'No pudimos consultar la selección.'); return;}
    void this.router.navigate(['/cliente/entrega'], {queryParams: {vista: MODALITY_VISTAS[this.store.modality()]}});
  }

  confirm(): void {
    if(this.physicalBusy()||this.store.submitting())return;
    this.form.markAllAsTouched();
    const {modality, table, address} = this.form.getRawValue();
    const rejection = this.store.rejection(modality, table, address);
    if (rejection || this.form.invalid) {
      this.message.set(rejection || 'Revisa los datos de tu modalidad.');
      setTimeout(() => this.document.getElementById('cart-feedback')?.focus(), 0);
      return;
    }
    if(modality==='SALON')this.checkPhysical(()=>this.store.submit(modality,table,address));
    else this.store.submit(modality, table, address);
  }

  /** Reconsulta el dato vigente; no cambia el carrito ni infiere permisos. */
  checkPhysical(onEnabled?:()=>void):void {
    const rid=this.store.draft()?.restaurantId;if(!rid||!this.store.hasSession()||this.store.submitting())return;
    const token=this.auth.session()?.accessToken,generation=++this.physicalGeneration;
    this.physicalRequest?.unsubscribe();this.physicalState.set('checking');this.physicalBusy.set(true);
    this.physicalRequest=this.physicalApi.restaurante(rid).subscribe({next:restaurant=>{
      if(generation!==this.physicalGeneration||token!==this.auth.session()?.accessToken)return;
      this.physicalBusy.set(false);this.physicalState.set(restaurant.tieneAtencionFisica?'enabled':'disabled');
      this.store.updatePhysicalAttention(rid,restaurant.tieneAtencionFisica);
      if(!restaurant.tieneAtencionFisica)this.message.set('La atención en salón está pausada. Elige otra modalidad.');
      else {this.message.set('');onEnabled?.();}
    },error:()=>{if(generation!==this.physicalGeneration)return;this.physicalBusy.set(false);this.physicalState.set('error');this.message.set('No pudimos verificar la atención en salón. Actualiza sus condiciones antes de confirmar.');}});
  }

  emptyCart(): void {
    this.dialog.open(VaciarDialog, {width: '460px', maxWidth: 'calc(100vw - 32px)',
      ariaLabel: 'Confirmar vaciado del carrito', autoFocus: 'first-tabbable', restoreFocus: false})
      .afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed => {
        if (!confirmed) {this.document.getElementById('empty-cart')?.focus(); return;}
        this.store.clear();
        this.message.set('Se vació el carrito.');
        setTimeout(() => this.document.getElementById('cart-empty-title')?.focus(), 0);
      });
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('cart-content');
    main?.focus({preventScroll: true});
    main?.scrollIntoView({block: 'start'});
  }

  logout(): void {this.auth.logout(); void this.router.navigate(['/auth/login']);}

  retryConditions(): void {
    this.message.set('Vuelve a la carta para actualizar la selección y sus condiciones.');
  }
}
