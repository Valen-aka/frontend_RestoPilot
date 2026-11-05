import {isModality, positiveId, validQuantity} from '../../../core/models/pedido-api.model';
import type {PedidoRequest, TipoEntrega} from '../../../core/models/pedido-api.model';
export {validQuantity} from '../../../core/models/pedido-api.model';

export interface DraftLine {
  readonly id: number;
  readonly restaurantId: number;
  readonly name: string;
  readonly unitCents: number;
  readonly available: boolean;
  readonly quantity: number | null;
  readonly notes?: string | null;
}
export interface CartTable {
  readonly id: number;
  readonly restaurantId: number;
  readonly label: string;
  readonly active: boolean;
}
export interface RestaurantConditions {
  readonly active: boolean;
  readonly open: boolean;
  readonly salon: boolean;
  readonly delivery: boolean;
}
/** Entrada desde catálogo: IDs y condiciones consultados, sin fixtures. */
export interface CartDraft {
  readonly restaurantId: number;
  readonly restaurant: string;
  readonly lines: readonly DraftLine[];
  readonly tables: readonly CartTable[];
  readonly conditions: RestaurantConditions;
}
export function selectionError(draft: CartDraft | null): string {
  if (!draft || !positiveId(draft.restaurantId)) return 'Selecciona un restaurante y sus platos desde la carta.';
  if (!draft.lines.length) return 'Añade al menos un plato antes de continuar.';
  if (draft.lines.some(l => !positiveId(l.id) || l.restaurantId !== draft.restaurantId)) return 'Revisa los platos del restaurante seleccionado.';
  if (draft.lines.some(l => !validQuantity(l.quantity))) return 'Indica cantidades enteras mayores o iguales a uno.';
  if (draft.lines.some(l => !l.available)) return 'Un plato ya no está disponible. Revisa la selección.';
  if (draft.lines.some(l => (l.notes != null && typeof l.notes !== 'string') || (l.notes?.length ?? 0) > 255)) return 'Las notas de cada plato admiten hasta 255 caracteres.';
  if (draft.lines.some(l => !Number.isSafeInteger(l.unitCents) || l.unitCents < 0) ||
      !Number.isSafeInteger(draft.lines.reduce((sum, l) => sum + l.unitCents * (l.quantity ?? 0), 0))) return 'No pudimos calcular el importe estimado.';
  return '';
}
export function buildPedidoRequest(draft: CartDraft | null, modality: TipoEntrega, tableId: number | null, address: string): PedidoRequest {
  const error = selectionError(draft);
  if (error || !draft) throw new Error(error);
  if (!isModality(modality)) throw new Error('Selecciona una modalidad válida.');
  if (!draft.conditions.active) throw new Error('Este restaurante no está disponible para recibir pedidos.');
  if (!draft.conditions.open) throw new Error('El restaurante está cerrado y no puede recibir pedidos.');
  if (modality === 'SALON' && (!draft.conditions.salon || !positiveId(tableId) ||
      !draft.tables.some(t => t.id === tableId && t.active && t.restaurantId === draft.restaurantId))) {
    throw new Error('El consumo en salón requiere atención física y una mesa activa de este restaurante.');
  }
  if (modality === 'DELIVERY' && (!draft.conditions.delivery || !address.trim() || address.trim().length > 255)) {
    throw new Error('Delivery requiere estar habilitado y una dirección válida de hasta 255 caracteres.');
  }
  return Object.freeze({restauranteId: draft.restaurantId, tipoEntrega: modality,
    mesaId: modality === 'SALON' ? tableId : null, direccionEntrega: modality === 'DELIVERY' ? address.trim() : null,
    detalles: Object.freeze(draft.lines.map(l => Object.freeze({platoId: l.id, cantidad: l.quantity as number, notas: l.notes ?? null})))});
}
