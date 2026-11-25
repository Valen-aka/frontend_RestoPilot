export interface ChatReply {
  estado: 'ANSWER' | 'CLARIFICATION_REQUIRED' | 'NO_DATA';
  mensaje: string;
  pedidoId?: number | null;
  datos?: {
    tipo?: string | null;
    fechaInicio: string;
    fechaFin: string;
    unidad?: string | null;
    moneda: string | null;
    platosMasVendidos?: string[] | null;
    estadoPagos?: {
      montoTotal: number;
      pedidosPagados: number;
      pagosPendientes: number;
      metodosPagoUtilizados: Record<string, number>;
    } | null;
    horariosMayorDemanda?: Record<string, number> | null;
    pedidosAtendidos?: number | null;
    reservasCompletadas?: number | null;
    volumenAtenciones?: number | null;
  } | null;
}

export type ChatMessage = { usuario: string } | { asistente: ChatReply };
