export type TipoEntrega = 'SALON' | 'LLEVAR' | 'RECOGER' | 'DELIVERY';
export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
export interface DetallePedidoRequest {
  readonly platoId: number;
  readonly cantidad: number;
  readonly notas: string | null;
}
export interface PedidoRequest {
  readonly restauranteId: number;
  readonly tipoEntrega: TipoEntrega;
  readonly mesaId: number | null;
  readonly direccionEntrega: string | null;
  readonly detalles: readonly DetallePedidoRequest[];
}
export interface DetallePedidoResponse {
  readonly id: number;
  readonly platoId: number;
  readonly nombrePlatoSnapshot: string;
  readonly cantidad: number;
  readonly precioUnitario: number;
  readonly subtotal: number;
  readonly notas: string | null;
}
export interface PedidoResponse {
  readonly id: number;
  readonly restauranteId: number;
  readonly restauranteNombre: string;
  readonly clienteId: number;
  readonly clienteNombre: string;
  readonly mesaId: number | null;
  readonly estado: EstadoPedido;
  readonly tipoEntrega: TipoEntrega;
  readonly direccionEntrega: string | null;
  readonly total: number;
  readonly fechaCreacion: string;
  readonly limiteCancelacion: string | null;
  readonly detalles: readonly DetallePedidoResponse[];
}

export function positiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
export function validQuantity(value: unknown): value is number {
  // Integer.MAX_VALUE: límite técnico del DTO Java, no máximo comercial.
  return positiveId(value) && value <= 2147483647;
}
export function isModality(value: unknown): value is TipoEntrega {
  return ['SALON', 'LLEVAR', 'RECOGER', 'DELIVERY'].includes(value as string);
}
const money = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const text = (value: unknown): value is string => typeof value === 'string' && !!value.trim();
const nullableText = (value: unknown): value is string | null => value === null || typeof value === 'string';
const localDate = (value: unknown): value is string => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?$/.test(value);

/** Un POST puede haberse guardado aunque su respuesta sea incompatible. */
export class PedidoProtocolError extends Error {
  constructor() {super('No pudimos verificar la confirmación. Comprueba con el restaurante si el pedido se registró antes de repetirlo.');}
}
export function confirmedPedido(value: unknown, request: PedidoRequest): PedidoResponse {
  if (!value || typeof value !== 'object') throw new PedidoProtocolError();
  const p = value as PedidoResponse;
  if (!positiveId(p.id) || p.restauranteId !== request.restauranteId || !text(p.restauranteNombre) ||
      !positiveId(p.clienteId) || !text(p.clienteNombre) || p.estado !== 'PENDIENTE' ||
      p.tipoEntrega !== request.tipoEntrega || p.mesaId !== request.mesaId ||
      p.direccionEntrega !== request.direccionEntrega || !money(p.total) || !localDate(p.fechaCreacion) ||
      !(p.limiteCancelacion === null || localDate(p.limiteCancelacion)) ||
      !Array.isArray(p.detalles) || p.detalles.length !== request.detalles.length) throw new PedidoProtocolError();
  const ids = new Set<number>();
  p.detalles.forEach((d, index) => {
    const expected = request.detalles[index];
    if (!d || !positiveId(d.id) || ids.has(d.id) || d.platoId !== expected.platoId ||
        !text(d.nombrePlatoSnapshot) || d.cantidad !== expected.cantidad || !money(d.precioUnitario) ||
        !money(d.subtotal) || !nullableText(d.notas) || d.notas !== expected.notas) throw new PedidoProtocolError();
    ids.add(d.id);
  });
  // El importe confirmado se conserva; no se sustituye por el estimado local.
  return Object.freeze({...p, detalles: Object.freeze(p.detalles.map(d => Object.freeze({...d})))});
}
