/**
 * Modelos de datos para el flujo de reservas (Cliente y Operación).
 * Alineado con US05, US06, US07, US08, US09 y SPEC.md.
 */

export type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'RECHAZADA'
  | 'CANCELADA'
  | 'EXPIRADA'
  | 'COMPLETADA';

export interface MesaPlano {
  id: number;
  numero: string;
  capacidad: number;
  zona: 'Terraza' | 'Salón Principal' | 'Ventanal' | 'Zona VIP';
  disponible: boolean;
  motivoNoDisponible?: string;
  x?: number; // posición relativa en el plano
  y?: number;
}

export interface ReservaDraft {
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  comensales: number;
  restauranteId?: number;
  restauranteNombre?: string;
  mesaId?: number;
  mesaNumero?: string;
  zona?: string;
  notas?: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
}

export interface ReservaItem {
  id: number;
  codigo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  comensales: number;
  mesaId: number;
  mesaNumero: string;
  zona: string;
  estado: EstadoReserva;
  solicitadaEn: string;
  notas?: string;
  motivoRechazo?: string;
  nombreCliente: string;
  telefonoCliente: string;
}

export const ESTADO_RESERVA_LABELS: Record<EstadoReserva, string> = {
  PENDIENTE: 'Pendiente de confirmación',
  CONFIRMADA: 'Confirmada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
  COMPLETADA: 'Completada'
};

export const ESTADO_RESERVA_VISTAS: Record<EstadoReserva, string> = {
  PENDIENTE: 'cliente-reserva-pendiente',
  CONFIRMADA: 'cliente-reserva-confirmada',
  RECHAZADA: 'cliente-reserva-rechazada',
  CANCELADA: 'cliente-reserva-cancelada',
  EXPIRADA: 'cliente-reserva-expirada',
  COMPLETADA: 'cliente-reserva-completada'
};
