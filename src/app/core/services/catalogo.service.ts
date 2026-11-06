import {MesaRequest, MesaContractError, readMesa, readMesas} from '../models/mesas.model';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  CategoriaResponse,
  MesaResponse,
  PlatoRequest,
  PlatoResponse,
  RestauranteResponse
} from '../models/catalogo-api.model';

import { readCategorias } from '../models/catalogo-query.model';
import { positiveId } from '../models/pedido-api.model';

function checkedList<T extends { id: number }>(
  value: unknown,
  valid: (item: T) => boolean
): readonly T[] {
  if (
    !Array.isArray(value) ||
    value.some(
      item =>
        !item ||
        typeof item !== 'object' ||
        !valid(item as T)
    )
  ) {
    throw new Error('Los datos del catálogo no son válidos.');
  }

  const ids = value.map((item: T) => item.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error('El catálogo contiene identificadores repetidos.');
  }

  return value as T[];
}

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly http = inject(HttpClient);

  private readonly base = environment.apiUrl.replace(/\/$/, '');

  // CONSULTAR RESTAURANTES
  restaurantes(): Observable<readonly RestauranteResponse[]> {
    return this.http
      .get<unknown>(this.base + '/restaurantes', {
        timeout: 20000
      })
      .pipe(
        map(data =>
          checkedList<RestauranteResponse>(
            data,
            r =>
              positiveId(r.id) &&
              typeof r.nombre === 'string' &&
              [
                'activo',
                'abierto',
                'tieneAtencionFisica',
                'aceptaDelivery'
              ].every(
                k =>
                  typeof r[k as keyof RestauranteResponse] ===
                  'boolean'
              )
          )
        )
      );
  }

  // CONSULTAR UN RESTAURANTE
  restaurante(id: number): Observable<RestauranteResponse> {
    return this.http
      .get<unknown>(this.base + '/restaurantes/' + id, {
        timeout: 20000
      })
      .pipe(
        map(data => {
          const list = checkedList<RestauranteResponse>(
            [data],
            r =>
              r.id === id &&
              typeof r.nombre === 'string' &&
              [
                'activo',
                'abierto',
                'tieneAtencionFisica',
                'aceptaDelivery'
              ].every(
                k =>
                  typeof r[k as keyof RestauranteResponse] ===
                  'boolean'
              )
          );

          return list[0];
        })
      );
  }

  // LISTAR PLATOS POR RESTAURANTE
  platos(
    restauranteId: number
  ): Observable<readonly PlatoResponse[]> {
    return this.http
      .get<unknown>(
        this.base + '/platos/restaurante/' + restauranteId,
        { timeout: 20000 }
      )
      .pipe(
        map(data =>
          checkedList<PlatoResponse>(
            data,
            p =>
              positiveId(p.id) &&
              p.restauranteId === restauranteId &&
              typeof p.nombre === 'string' &&
              typeof p.precio === 'number' &&
              Number.isFinite(p.precio) &&
              p.precio >= 0 &&
              typeof p.disponible === 'boolean'
          )
        )
      );
  }

  // REGISTRAR NUEVO PLATO
  crearPlato(datos: PlatoRequest): Observable<PlatoResponse> {
    return this.http.post<PlatoResponse>(
      this.base + '/platos',
      datos,
      { timeout: 20000 }
    );
  }

  // OBTENER PLATO POR ID
  obtenerPlato(id: number): Observable<PlatoResponse> {
    return this.http.get<PlatoResponse>(
      this.base + '/platos/' + id,
      { timeout: 20000 }
    );
  }

// ACTUALIZAR PLATO
  actualizarPlato(
    id: number,
    datos: PlatoRequest
  ): Observable<PlatoResponse> {
    return this.http.put<PlatoResponse>(
      this.base + '/platos/' + id,
      datos,
      { timeout: 20000 }
    );
  }
  // CAMBIAR DISPONIBILIDAD DE PLATO
  cambiarDisponibilidadPlato(
    id: number,
    disponible: boolean
  ): Observable<PlatoResponse> {
    return this.http.patch<PlatoResponse>(
      this.base + '/platos/' + id + '/disponibilidad',
      null,
      {
        params: { disponible: String(disponible) },
        timeout: 20000
      }
    );
  }
  // ELIMINAR PLATO
  eliminarPlato(id: number): Observable<void> {
    return this.http.delete(
      this.base + '/platos/' + id,
      {
        observe: 'response',
        timeout: 20000
      }
    ).pipe(
      map(response => {
        if (response.status !== 204) {
          throw new Error(
            'No se pudo confirmar la eliminación del plato.'
          );
        }
      })
    );
  }
  // LISTAR CATEGORÍAS
  categorias(
    restauranteId: number
  ): Observable<readonly CategoriaResponse[]> {
    return this.http
      .get<unknown>(
        this.base + '/categorias/restaurante/' + restauranteId,
        { timeout: 20000 }
      )
      .pipe(
        map(data => readCategorias(data, restauranteId))
      );
  }

  // CREAR CATEGORÍA
  crearCategoria(
    restauranteId: number,
    datos: {
      nombre: string;
      descripcion: string;
    }
  ): Observable<CategoriaResponse> {
    return this.http
      .post<unknown>(
        this.base + '/categorias',
        { restauranteId, ...datos },
        { timeout: 20000 }
      )
      .pipe(
        map(data => readCategorias([data], restauranteId)[0])
      );
  }

  // ACTUALIZAR CATEGORÍA
  actualizarCategoria(
    id: number,
    restauranteId: number,
    datos: {
      nombre: string;
      descripcion: string;
    }
  ): Observable<CategoriaResponse> {
    return this.http
      .put<unknown>(
        this.base + '/categorias/' + id,
        datos,
        { timeout: 20000 }
      )
      .pipe(
        map(data => {
          const categoria = readCategorias(
            [data],
            restauranteId
          )[0];

          if (categoria.id !== id) {
            throw new Error(
              'La confirmación no corresponde a la categoría.'
            );
          }

          return categoria;
        })
      );
  }

  // ELIMINAR CATEGORÍA
  eliminarCategoria(id: number): Observable<void> {
    return this.http
      .delete(this.base + '/categorias/' + id, {
        observe: 'response',
        timeout: 20000
      })
      .pipe(
        map(response => {
          if (response.status !== 204) {
            throw new Error(
              'No pudimos confirmar la eliminación.'
            );
          }
        })
      );
  }

  mesasPropias(restaurantId:number):Observable<readonly MesaResponse[]> {
    return this.http.get<unknown>(this.base+'/mesas',{timeout:20000}).pipe(map(v=>readMesas(v,restaurantId)));
  }
  obtenerMesa(id:number,restaurantId:number):Observable<MesaResponse> {
    return this.http.get<unknown>(this.base+'/mesas/'+id,{timeout:20000}).pipe(map(v=>readMesa(v,restaurantId,id)));
  }
  crearMesa(datos:MesaRequest,restaurantId:number):Observable<MesaResponse> {
    return this.http.post<unknown>(this.base+'/mesas',datos,{observe:'response',timeout:20000}).pipe(map(r=>{
      if(r.status!==201)throw new MesaContractError();const mesa=readMesa(r.body,restaurantId);
      if(!mesa.activo||mesa.numero!==datos.numero||mesa.capacidad!==datos.capacidad||mesa.coordenadaX!==datos.coordenadaX||mesa.coordenadaY!==datos.coordenadaY)throw new MesaContractError();return mesa;
    }));
  }
  actualizarMesa(id:number,datos:MesaRequest,restaurantId:number):Observable<MesaResponse> {
    return this.http.put<unknown>(this.base+'/mesas/'+id,datos,{observe:'response',timeout:20000}).pipe(map(r=>{
      if(r.status!==200)throw new MesaContractError();const mesa=readMesa(r.body,restaurantId,id);
      if(mesa.numero!==datos.numero||mesa.capacidad!==datos.capacidad||mesa.coordenadaX!==datos.coordenadaX||mesa.coordenadaY!==datos.coordenadaY)throw new MesaContractError();return mesa;
    }));
  }
  cambiarEstadoMesa(id:number,activo:boolean,restaurantId:number):Observable<MesaResponse> {
    return this.http.patch<unknown>(this.base+'/mesas/'+id+'/estado',{activo},{observe:'response',timeout:20000}).pipe(map(r=>{
      if(r.status!==200)throw new MesaContractError();const mesa=readMesa(r.body,restaurantId,id);if(mesa.activo!==activo)throw new MesaContractError();return mesa;
    }));
  }
  // LISTAR MESAS
  mesas(
    restauranteId: number
  ): Observable<readonly MesaResponse[]> {
    return this.http
      .get<unknown>(
        this.base + '/mesas/restaurante/' + restauranteId,
        { timeout: 20000 }
      )
      .pipe(
        map(data =>
          checkedList<MesaResponse>(
            data,
            m =>
              positiveId(m.id) &&
              m.restauranteId === restauranteId &&
              Number.isInteger(m.numero) &&
              Number.isInteger(m.capacidad) &&
              typeof m.activo === 'boolean'
          )
        )
      );
  }
}
