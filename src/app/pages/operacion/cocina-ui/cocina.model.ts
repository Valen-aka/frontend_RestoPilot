export type KitchenStatus = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Cancelado';
export type Complexity = 'Alta' | 'Media' | 'Baja';
export type KitchenModality = 'SALON' | 'LLEVAR' | 'RECOGER' | 'DELIVERY';
export interface KitchenLine {
  readonly name: string;
  readonly quantity: number;
  readonly unitCents: number;
  readonly complexity: Complexity;
  readonly preparationMinutes: number;
}
export interface KitchenOrder {
  readonly id: number;
  readonly restaurantId: string;
  readonly customer?: string;
  readonly status: KitchenStatus;
  readonly createdAt: string;
  readonly modality: KitchenModality;
  readonly table?: string;
  readonly address?: string;
  readonly payment: 'Pendiente' | 'Pagado';
  readonly totalCents: number;
  readonly lines: readonly KitchenLine[];
}
export const COMPLEXITY_RANK: Readonly<Record<Complexity, number>> = {Alta: 3, Media: 2, Baja: 1};
export const MODALITY_LABELS: Readonly<Record<KitchenModality, string>> = {
  SALON: 'En salón', LLEVAR: 'Para llevar', RECOGER: 'Recoger', DELIVERY: 'Delivery'
};
export const SAMPLE_RESTAURANT = 'muestra-la-mesa-verde';
export const SAMPLE_ORDERS: readonly KitchenOrder[] = Object.freeze([
  Object.freeze({id: 1042, restaurantId: SAMPLE_RESTAURANT, customer: 'Ana Pérez', status: 'Pendiente' as const,
    createdAt: '2026-10-20T13:30:00-05:00', modality: 'RECOGER' as const, payment: 'Pendiente' as const, totalCents: 6600,
    lines: Object.freeze([
      Object.freeze({name: 'Lomo saltado', quantity: 1, unitCents: 3800, complexity: 'Alta' as const, preparationMinutes: 15}),
      Object.freeze({name: 'Ají de gallina', quantity: 1, unitCents: 2800, complexity: 'Media' as const, preparationMinutes: 10})
    ])}),
  Object.freeze({id: 1041, restaurantId: SAMPLE_RESTAURANT, customer: 'Luis Flores', status: 'Pendiente' as const,
    createdAt: '2026-10-20T13:27:00-05:00', modality: 'SALON' as const, table: 'Mesa 04', payment: 'Pagado' as const, totalCents: 2800,
    lines: Object.freeze([Object.freeze({name: 'Ají de gallina', quantity: 1, unitCents: 2800, complexity: 'Alta' as const, preparationMinutes: 10})])}),
  Object.freeze({id: 1040, restaurantId: SAMPLE_RESTAURANT, customer: 'Carla Ríos', status: 'En preparación' as const,
    createdAt: '2026-10-20T13:24:00-05:00', modality: 'DELIVERY' as const, address: 'Av. Los Olivos 320, departamento 202', payment: 'Pendiente' as const, totalCents: 3800,
    lines: Object.freeze([Object.freeze({name: 'Lomo saltado', quantity: 1, unitCents: 3800, complexity: 'Media' as const, preparationMinutes: 15})])})
]);

export function isActive(order: KitchenOrder): boolean {
  return order.status === 'Pendiente' || order.status === 'En preparación';
}
export function validKitchenOrder(order: KitchenOrder): boolean {
  return Number.isSafeInteger(order.id) && order.id > 0 &&
    ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado'].includes(order.status) &&
    Object.hasOwn(MODALITY_LABELS, order.modality) &&
    Number.isFinite(Date.parse(order.createdAt)) &&
    ['Pendiente', 'Pagado'].includes(order.payment) &&
    Number.isSafeInteger(order.totalCents) && order.totalCents >= 0 &&
    Array.isArray(order.lines) && order.lines.length > 0 && order.lines.every(line =>
      typeof line.name === 'string' && !!line.name.trim() && Number.isSafeInteger(line.quantity) && line.quantity > 0 &&
      Number.isSafeInteger(line.unitCents) && line.unitCents >= 0 && Object.hasOwn(COMPLEXITY_RANK, line.complexity) &&
      Number.isFinite(line.preparationMinutes) && line.preparationMinutes > 0);
}
export function maxComplexity(order: KitchenOrder): Complexity {
  return order.lines.reduce<Complexity>((max, line) =>
    COMPLEXITY_RANK[line.complexity] > COMPLEXITY_RANK[max] ? line.complexity : max, 'Baja');
}
export function maxMinutes(order: KitchenOrder): number {
  return order.lines.reduce((max, line) => Math.max(max, line.preparationMinutes), 0);
}
/** Orden exclusivo de fixtures locales. Una integración futura conserva el orden de la API. */
export function prioritizeSample(orders: readonly KitchenOrder[]): KitchenOrder[] {
  return [...orders].sort((a, b) => COMPLEXITY_RANK[maxComplexity(b)] - COMPLEXITY_RANK[maxComplexity(a)] ||
    maxMinutes(b) - maxMinutes(a) || Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id - b.id);
}
export function orderUnits(order: KitchenOrder): number {
  return order.lines.reduce((sum, line) => sum + line.quantity, 0);
}
export function serviceLabel(order: KitchenOrder): string {
  return MODALITY_LABELS[order.modality] + (order.modality === 'SALON' && order.table ? ` · ${order.table}` : '');
}
export function sampleTime(order: KitchenOrder): string {
  return new Intl.DateTimeFormat('es-PE', {hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima'})
    .format(new Date(order.createdAt));
}
export function sampleDate(order: KitchenOrder): string {
  return new Intl.DateTimeFormat('es-PE', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima'})
    .format(new Date(order.createdAt));
}
