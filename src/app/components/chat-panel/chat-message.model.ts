export interface ChatReply {
  estado: 'ANSWER' | 'CLARIFICATION_REQUIRED' | 'NO_DATA';
  mensaje: string;
  datos?: {
    fechaInicio: string;
    fechaFin: string;
    moneda: string | null;
    platosMasVendidos?: string[] | null;
    estadoPagos?: {
      montoTotal: number;
      pedidosPagados: number;
      pagosPendientes: number;
      metodosPagoUtilizados: Record<string, number>;
    } | null;
  } | null;
}

export type ChatMessage = { usuario: string } | { asistente: ChatReply };
