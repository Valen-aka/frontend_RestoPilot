export type OrderStatus = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Cancelado';
export type QueryState = 'ready' | 'loading' | 'not-found' | 'error' | 'missing-id' | 'unauthenticated' | 'forbidden';
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
  readonly method?: string;
  readonly reference?: string;
  readonly registeredAt?: string;
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

export interface ClientOrderRecord {
  readonly clientId: string;
  readonly createdAt: string;
  readonly order: OrderSnapshot;
  readonly status: OrderStatus;
  readonly payment: PaymentState;
  readonly paymentRecord?: PaymentSnapshot;
}
export const SAMPLE_CLIENT_ID = 'cliente-de-muestra';
export const SAMPLE_CLIENT_ORDERS: readonly ClientOrderRecord[] = Object.freeze([
  Object.freeze({clientId: SAMPLE_CLIENT_ID, createdAt: '2026-10-20T13:30:00-05:00', order: SAMPLE_ORDER,
    status: 'En preparación' as const, payment: 'paid' as const, paymentRecord: SAMPLE_PAYMENT}),
  Object.freeze({clientId: SAMPLE_CLIENT_ID, createdAt: '2026-10-19T20:15:00-05:00',
    order: Object.freeze({id: 1034, restaurant: 'La Mesa Verde', requestedAt: '19 oct 2026 · 20:15', modality: 'DELIVERY' as const,
      deliveryAddress: 'Av. Los Olivos 320, departamento 202',
      lines: Object.freeze([Object.freeze({name: 'Lomo saltado', quantity: 1, unitPrice: 38, subtotal: 38})]), total: 38}),
    status: 'Entregado' as const, payment: 'paid' as const,
    paymentRecord: Object.freeze({orderId: 1034, amount: 38, method: 'Efectivo', registeredAt: '19 oct 2026 · 20:20'})}),
  Object.freeze({clientId: SAMPLE_CLIENT_ID, createdAt: '2026-10-18T12:10:00-05:00',
    order: Object.freeze({id: 1028, restaurant: 'La Mesa Verde', requestedAt: '18 oct 2026 · 12:10', modality: 'SALON' as const,
      table: 'Mesa 02', lines: Object.freeze([Object.freeze({name: 'Ají de gallina', quantity: 1, unitPrice: 28, subtotal: 28})]), total: 28}),
    status: 'Cancelado' as const, payment: 'missing' as const})
]);
/** Solo filtra fixtures propios; no acredita permisos ni sesión. */
export function clientOrderHistory(records: readonly ClientOrderRecord[]): ClientOrderRecord[] {
  return records.filter(record => record.clientId === SAMPLE_CLIENT_ID).sort((a, b) =>
    Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.order.id - a.order.id);
}
export function findClientOrder(records: readonly ClientOrderRecord[], id: unknown): ClientOrderRecord | undefined {
  if (!Number.isSafeInteger(id) || (id as number) < 1) return undefined;
  const matches = records.filter(record => record.clientId === SAMPLE_CLIENT_ID && record.order.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}
export function validClientOrder(record: ClientOrderRecord): boolean {
  const order = record.order;
  return Number.isSafeInteger(order.id) && order.id > 0 && Number.isFinite(Date.parse(record.createdAt)) &&
    !!order.restaurant?.trim() && Object.hasOwn(MODALITY_LABELS, order.modality) &&
    ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado'].includes(record.status) &&
    ['paid', 'pending', 'missing'].includes(record.payment) && Number.isFinite(order.total) && order.total >= 0 &&
    order.lines.length > 0 && order.lines.every(line => !!line.name?.trim() && Number.isSafeInteger(line.quantity) && line.quantity > 0 &&
      Number.isFinite(line.unitPrice) && line.unitPrice >= 0 && Number.isFinite(line.subtotal) && line.subtotal >= 0);
}
