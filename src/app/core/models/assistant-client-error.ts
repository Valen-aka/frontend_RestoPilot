import { HttpErrorResponse } from '@angular/common/http';
import { ClientChatContractError } from './assistant-client.model';

export function clientChatErrorMessage(error: unknown): string {
  if (error instanceof ClientChatContractError) return error.message;
  if (!(error instanceof HttpErrorResponse)) return 'No se pudo completar la consulta. Puedes volver a enviar el mensaje.';
  switch (error.status) {
    case 400: return 'Revisa el mensaje y el restaurante seleccionado antes de volver a enviar.';
    case 401: return 'El asistente no pudo validar tu sesión. Vuelve a iniciar sesión si el problema continúa.';
    case 403: return 'Tu cuenta no tiene permiso para utilizar el asistente del cliente.';
    case 429: return 'Hay demasiadas consultas. Espera un momento antes de volver a enviar.';
    case 502: return 'El asistente no pudo completar la respuesta. Puedes volver a enviar el mensaje.';
    case 503: return 'El asistente no está disponible en este momento. Inténtalo más tarde.';
    case 0: return error.error?.name === 'TimeoutError' || error.error?.type === 'timeout'
      ? 'La consulta tardó demasiado. Puedes volver a enviar el mensaje.'
      : 'No se pudo conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.';
    default: return 'No se pudo completar la consulta. Puedes volver a enviar el mensaje.';
  }
}
