/**
 * Utilidades de fecha y hora configuradas específicamente para Lima, Perú (America/Lima, UTC-5).
 * Resuelve US05 - 024: Evita que new Date().toISOString() en UTC rechace reservas nocturnas válidas.
 */

export function getFechaLima(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date); // Formato YYYY-MM-DD en hora de Lima
}

export function getHoraLima(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return formatter.format(date); // Formato HH:mm en hora de Lima
}
