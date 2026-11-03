import type {CategoriaResponse, PlatoResponse} from './catalogo-api.model';
import {positiveId} from './pedido-api.model';

const nullableText = (v: unknown) => v === null || typeof v === 'string';
export function readCartaPlato(value: unknown, restauranteId: number, id?: number): PlatoResponse {
  const p = value as PlatoResponse;
  if (!p || !positiveId(p.id) || (id !== undefined && p.id !== id) || p.restauranteId !== restauranteId ||
      !positiveId(p.categoriaId) || typeof p.categoriaNombre !== 'string' || typeof p.nombre !== 'string' || !p.nombre.trim() ||
      typeof p.precio !== 'number' || !Number.isFinite(p.precio) || p.precio < 0 || typeof p.disponible !== 'boolean' ||
      ![p.descripcion, p.ingredientes, p.alergenos, p.complejidad, p.imagenUrl].every(nullableText) ||
      !(p.tiempoPreparacionMinutos === null || (Number.isInteger(p.tiempoPreparacionMinutos) && p.tiempoPreparacionMinutos >= 0))) {
    throw new Error('No pudimos interpretar los datos del plato.');
  }
  return p;
}
export function readCategorias(value: unknown, restauranteId: number): readonly CategoriaResponse[] {
  if (!Array.isArray(value) || value.some(c => !c || !positiveId(c.id) || c.restauranteId !== restauranteId ||
      typeof c.nombre !== 'string' || !c.nombre.trim() || !nullableText(c.descripcion)) ||
      new Set(value.map(c => c.id)).size !== value.length) throw new Error('No pudimos interpretar las categorías.');
  return value;
}
