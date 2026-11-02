import {Injectable, computed, signal} from '@angular/core';
import {Modality, OrderSnapshot} from '../pedido-ui/pedido.model';

export interface DraftLine {
  readonly id: string;
  readonly restaurantId: string;
  readonly name: string;
  readonly unitCents: number;
  readonly available: boolean;
  readonly quantity: number | null;
}
export interface SampleTable {
  readonly id: string;
  readonly restaurantId: string;
  readonly label: string;
  readonly active: boolean;
}
export interface RestaurantConditions {
  readonly active: boolean;
  readonly open: boolean;
  readonly salon: boolean;
  readonly delivery: boolean;
}

export const SAMPLE_RESTAURANT_ID = 'muestra-la-mesa-verde';
export function validQuantity(value: number | null): value is number {
  return value !== null && Number.isSafeInteger(value) && value >= 1;
}

/** Borrador local de muestra; sin HTTP, almacenamiento persistente ni operaciones reales. */
@Injectable({providedIn: 'root'})
export class CarritoStore {
  readonly restaurantId = SAMPLE_RESTAURANT_ID;
  readonly restaurant = 'La Mesa Verde';
  readonly lines = signal<readonly DraftLine[]>([
    {id: 'lomo', restaurantId: SAMPLE_RESTAURANT_ID, name: 'Lomo saltado', unitCents: 3800, available: true, quantity: 1},
    {id: 'aji', restaurantId: SAMPLE_RESTAURANT_ID, name: 'Ají de gallina', unitCents: 2800, available: true, quantity: 1}
  ]);
  readonly conditions = signal<RestaurantConditions>({active: true, open: true, salon: true, delivery: true});
  readonly tables = signal<readonly SampleTable[]>([
    {id: 'mesa-04', restaurantId: SAMPLE_RESTAURANT_ID, label: 'Mesa 04 · 4 personas', active: true},
    {id: 'mesa-06', restaurantId: SAMPLE_RESTAURANT_ID, label: 'Mesa 06 · 2 personas', active: true}
  ]);
  readonly modality = signal<Modality>('SALON');
  readonly tableId = signal('');
  readonly address = signal('');
  readonly queryState = signal<'ready' | 'loading' | 'error'>('ready');
  readonly activeTables = computed(() => this.tables().filter(t => t.active && t.restaurantId === this.restaurantId));
  readonly count = computed(() => this.lines().reduce((sum, line) => sum + (validQuantity(line.quantity) ? line.quantity : 0), 0));
  readonly totalCents = computed(() => this.lines().reduce((sum, line) =>
    sum + (validQuantity(line.quantity) ? line.unitCents * line.quantity : 0), 0));
  readonly selectionError = computed(() => {
    const lines = this.lines();
    if (!lines.length) return 'Añade al menos un plato antes de continuar.';
    if (lines.some(l => !validQuantity(l.quantity))) return 'Indica cantidades enteras mayores o iguales a uno.';
    if (lines.some(l => l.restaurantId !== this.restaurantId)) return 'Hay un plato de otro restaurante. Revisa la selección.';
    if (lines.some(l => !l.available)) return 'Un plato ya no está disponible. Revisa la selección.';
    if (lines.some(l => !Number.isSafeInteger(l.unitCents) || l.unitCents < 0) || !Number.isSafeInteger(this.totalCents())) {
      return 'No pudimos calcular el importe. Revisa la selección.';
    }
    return '';
  });

  setQuantity(index: number, quantity: number | null): void {
    this.lines.update(lines => lines.map((line, i) => i === index ? {...line, quantity} : line));
  }

  clear(): void {
    this.lines.set([]);
  }

  rejection(modality: Modality, tableId: string, address: string): string {
    if (this.queryState() === 'loading') return 'Estamos consultando las condiciones de muestra. Espera antes de continuar.';
    if (this.queryState() === 'error') return 'No pudimos consultar las condiciones. Vuelve a abrir esta vista.';
    if (this.selectionError()) return this.selectionError();
    const conditions = this.conditions();
    if (!conditions.active) return 'Este restaurante no está disponible para recibir pedidos.';
    if (!conditions.open) return 'El restaurante está cerrado y no puede recibir pedidos.';
    if (modality === 'SALON') {
      if (!conditions.salon) return 'La atención en salón no está habilitada. Elige otra modalidad.';
      if (!this.activeTables().some(t => t.id === tableId)) return 'Selecciona una mesa activa de este restaurante.';
    }
    if (modality === 'DELIVERY') {
      if (!conditions.delivery) return 'Delivery no está habilitado. Elige otra modalidad.';
      if (!address.trim() || address.length > 255) return 'Indica una dirección de entrega de hasta 255 caracteres.';
    }
    return '';
  }

  snapshot(modality: Modality, tableId: string, address: string): OrderSnapshot | undefined {
    if (this.rejection(modality, tableId, address)) return undefined;
    const table = this.activeTables().find(t => t.id === tableId);
    return Object.freeze({
      id: 1042, restaurant: this.restaurant, requestedAt: '20 oct 2026 · 13:30 (muestra)', modality,
      ...(modality === 'SALON' && table ? {table: table.label} : {}),
      ...(modality === 'DELIVERY' ? {deliveryAddress: address.trim()} : {}),
      ...(modality === 'RECOGER' ? {restaurantAddress: 'Av. Primavera 240, Lima'} : {}),
      lines: Object.freeze(this.lines().map(l => Object.freeze({name: l.name, quantity: l.quantity as number,
        unitPrice: l.unitCents / 100, subtotal: l.unitCents * (l.quantity as number) / 100}))),
      total: this.totalCents() / 100
    });
  }
}
