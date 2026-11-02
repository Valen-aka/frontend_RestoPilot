export type OrderStatus = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Cancelado';
export type QueryState = 'ready' | 'loading' | 'not-found' | 'error';
export type PaymentState = 'paid' | 'pending' | 'missing';
export type Modality = 'SALON' | 'LLEVAR' | 'RECOGER' | 'DELIVERY';

export interface OrderLine {
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;
}
export interface OrderSnapshot {
  readonly id: number;
  readonly restaurant: string;
  readonly requestedAt: string;
  readonly modality: Modality;
  readonly restaurantAddress?: string;
  readonly deliveryAddress?: string;
  readonly table?: string;
  readonly lines: readonly OrderLine[];
  readonly total: number;
}
export interface PaymentSnapshot {
  readonly orderId: number;
  readonly amount: number;
  readonly method: string;
  readonly reference?: string;
  readonly registeredAt: string;
}
export const SAMPLE_PAYMENT: PaymentSnapshot = Object.freeze({
  orderId: 1042, amount: 66, method: 'Yape', reference: 'OP-204812',
  registeredAt: '20 oct 2026 · 13:35'
});
export const SAMPLE_ORDER: OrderSnapshot = Object.freeze({
  id: 1042,
  restaurant: 'La Mesa Verde',
  requestedAt: '20 oct 2026 · 13:30',
  modality: 'RECOGER' as const,
  restaurantAddress: 'Av. Primavera 240, Lima',
  lines: Object.freeze([
    Object.freeze({name: 'Lomo saltado', quantity: 1, unitPrice: 38, subtotal: 38}),
    Object.freeze({name: 'Ají de gallina', quantity: 1, unitPrice: 28, subtotal: 28})
  ]),
  total: 66
});
export const ORDER_VISTAS = [
  'cliente-pedido-detalle', 'cliente-pedido-listo',
  'cliente-pedido-entregado', 'cliente-pedido-cancelado'
] as const;
export type OrderVista = typeof ORDER_VISTAS[number];
export function validOrderVista(value: unknown): OrderVista {
  return ORDER_VISTAS.includes(value as OrderVista) ? value as OrderVista : 'cliente-pedido-detalle';
}
export function vistaForStatus(status: OrderStatus): OrderVista {
  switch (status) {
    case 'Listo': return 'cliente-pedido-listo';
    case 'Entregado': return 'cliente-pedido-entregado';
    case 'Cancelado': return 'cliente-pedido-cancelado';
    default: return 'cliente-pedido-detalle';
  }
}
export function stageIndex(status: OrderStatus): number {
  return ['Pendiente', 'En preparación', 'Listo', 'Entregado'].indexOf(status);
}
export const MODALITY_LABELS: Record<Modality, string> = {
  SALON: 'En salón', LLEVAR: 'Para llevar', RECOGER: 'Recoger en restaurante', DELIVERY: 'Delivery'
};
