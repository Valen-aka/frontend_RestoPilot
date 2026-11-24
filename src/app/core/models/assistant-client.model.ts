export interface ClientChatRequest {
  readonly mensaje: string;
  readonly restauranteId: number;
}

export interface ClientChatResponse {
  readonly estado: 'ANSWER' | 'CLARIFICATION_REQUIRED' | 'NO_DATA';
  readonly mensaje: string;
  readonly datos?: null;
  readonly pedidoId?: number | null;
}

export class ClientChatContractError extends Error {
  constructor() { super('El asistente devolvió una respuesta no válida. Inténtalo de nuevo.'); }
}

export function readClientChatResponse(value: unknown): ClientChatResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ClientChatContractError();
  const data = value as Record<string, unknown>;
  if (!['ANSWER', 'CLARIFICATION_REQUIRED', 'NO_DATA'].includes(data['estado'] as string)
      || typeof data['mensaje'] !== 'string' || !data['mensaje'].trim()
      || data['datos'] != null
      || data['pedidoId'] != null && (!Number.isSafeInteger(data['pedidoId']) || (data['pedidoId'] as number) <= 0)) {
    throw new ClientChatContractError();
  }
  return {
    estado: data['estado'] as ClientChatResponse['estado'], mensaje: data['mensaje'],
    datos: null, pedidoId: data['pedidoId'] as number | null | undefined,
  };
}
