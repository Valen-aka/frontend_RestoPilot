import {Component, DestroyRef, DOCUMENT, OnInit, computed, inject, input, signal} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
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
import {PedidoDemoContext} from '../pedido-ui/pedido-demo-context';

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
  readonly demo = inject(PedidoDemoContext);
  private readonly router = inject(Router);
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
  private readonly creationState = this.document.defaultView?.history.state;
  readonly created = this.creationState?.us11Created === true ?
    (Object.hasOwn(this.creationState, 'pedidoId') ? this.demo.orders().find(order => order.id === this.creationState.pedidoId) : this.demo.snapshot()) : undefined;
  readonly title = computed(() => {
    if (this.mode() === 'closed') return 'Volvemos pronto';
    if (this.mode() === 'created') return 'Confirmación de muestra';
    if (this.isEmpty()) return 'Tu pedido';
    return this.mode() === 'delivery' ? '¿Cómo lo vas a disfrutar?' : 'Tu pedido, a tu gusto';
  });
  readonly subtitle = computed(() => {
    if (this.mode() === 'closed') return 'Por ahora no podemos recibir pedidos.';
    if (this.mode() === 'created') return 'Así se verá la confirmación de tu pedido.';
    if (this.isEmpty()) return 'Encuentra tu próximo favorito.';
    return this.mode() === 'delivery' ? 'Elige la opción que va contigo.' : 'Una buena elección, dos veces.';
  });
  readonly form = new FormGroup({
    modality: new FormControl<Modality>('SALON', {nonNullable: true}),
    table: new FormControl('', {nonNullable: true}),
    address: new FormControl('', {nonNullable: true})
  });
  readonly quantities = this.store.lines().map(line => new FormControl<number | null>(line.quantity,
    [Validators.required, control => validQuantity(control.value) ? null : {quantity: true}]));
  readonly canContinue = computed(() => !this.store.selectionError() && this.store.queryState() === 'ready');

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
      void this.router.navigate(['/cliente/entrega'], {queryParams: {vista: MODALITY_VISTAS[value]}});
    });
    this.form.controls.table.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.store.tableId.set(value); this.message.set('');
    });
    this.form.controls.address.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.store.address.set(value); this.message.set('');
    });
    this.quantities.forEach((control, index) => control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {this.store.setQuantity(index, value); this.message.set('');}));
  }

  continue(): void {
    this.quantities.forEach(control => control.markAsTouched());
    if (!this.canContinue()) {this.message.set(this.store.selectionError() || 'No pudimos consultar la selección.'); return;}
    void this.router.navigate(['/cliente/entrega'], {queryParams: {vista: MODALITY_VISTAS[this.store.modality()]}});
  }

  confirm(): void {
    this.form.markAllAsTouched();
    const {modality, table, address} = this.form.getRawValue();
    const rejection = this.store.rejection(modality, table, address);
    if (rejection || this.form.invalid) {
      this.message.set(rejection || 'Revisa los datos de tu modalidad.');
      setTimeout(() => this.document.getElementById('cart-feedback')?.focus(), 0);
      return;
    }
    const snapshot = this.store.snapshot(modality, table, address);
    if (!snapshot) return;
    const created = this.demo.remember(snapshot);
    void this.router.navigate(['/cliente/pedido'], {queryParams: {vista: 'cliente-pedido-creado'}, state: {us11Created: true, pedidoId: created.id}});
  }

  emptyCart(): void {
    this.dialog.open(VaciarDialog, {width: '460px', maxWidth: 'calc(100vw - 32px)',
      ariaLabel: 'Confirmar vaciado del carrito', autoFocus: 'first-tabbable', restoreFocus: false})
      .afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed => {
        if (!confirmed) {this.document.getElementById('empty-cart')?.focus(); return;}
        this.store.clear();
        this.message.set('Se vació el carrito de muestra.');
        setTimeout(() => this.document.getElementById('cart-empty-title')?.focus(), 0);
      });
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('cart-content');
    main?.focus({preventScroll: true});
    main?.scrollIntoView({block: 'start'});
  }

  reopenSample(): void {
    this.store.queryState.set('ready');
    this.message.set('Se reabrió la vista local de muestra. No se consultó ningún servicio.');
  }
}
