import type {CategoriaResponse} from './catalogo-api.model';
import {positiveId} from './pedido-api.model';

const nullableText = (v: unknown) => v === null || typeof v === 'string';
export function readCategorias(value: unknown, restauranteId: number): readonly CategoriaResponse[] {
  if (!Array.isArray(value) || value.some(c => !c || !positiveId(c.id) || c.restauranteId !== restauranteId ||
      typeof c.nombre !== 'string' || !c.nombre.trim() || !nullableText(c.descripcion)) ||
      new Set(value.map(c => c.id)).size !== value.length) throw new Error('No pudimos interpretar las categorías.');
  return value;
}
