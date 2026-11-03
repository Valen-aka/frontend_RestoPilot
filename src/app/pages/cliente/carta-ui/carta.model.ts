import {positiveId} from '../../../core/models/pedido-api.model';

export interface CartaContext {restauranteId: number | null; categoriaId: number | null; platoId: number | null; detail: boolean; invalid: boolean;}
export function readId(values: readonly string[]): number | null {
  return values.length === 1 && /^[1-9]\d*$/.test(values[0]) && positiveId(Number(values[0])) ? Number(values[0]) : null;
}
export function cartaContext(params: {getAll(name: string): string[]}, detail: boolean): CartaContext {
  const keys = ['restauranteId', 'categoriaId', 'platoId'];
  const values = keys.map(k => params.getAll(k));
  const [restauranteId, categoriaId, platoId] = values.map(readId);
  return {restauranteId, categoriaId, platoId, detail,
    invalid: values.some((v, i) => v.length > 0 && readId(v) === null) ||
      (!!categoriaId && !restauranteId) || (detail && (!platoId || !restauranteId))};
}
/** Solo URL web o recurso local; nunca imágenes de muestra como respaldo. */
export function dishImage(value: string | null): string | null {
  if (!value) return null;
  if (/^\/(?!\/)[^\\]*$/.test(value)) return value;
  try {const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;} catch {return null;}
}
