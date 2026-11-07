export type EstadoPago = 'PENDIENTE' | 'PAGADO';
export type MetodoPago = 'YAPE' | 'PLIN' | 'TARJETA' | 'EFECTIVO';
export interface PagoRequest {
  readonly monto:number;
  readonly metodo:MetodoPago;
  readonly codigoReferencia:string|null;
  readonly estado:EstadoPago;
}
export interface PagoResponse {
  readonly mensaje: string;
  readonly id: number;
  readonly pedidoId: number;
  readonly monto: number;
  readonly metodo: MetodoPago | null;
  readonly estado: EstadoPago;
  readonly codigoReferencia: string | null;
  readonly fechaPago: string | null;
  readonly creadoEn: string | null;
}
