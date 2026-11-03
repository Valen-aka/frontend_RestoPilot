import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {CategoriaResponse, MesaResponse, PlatoResponse, RestauranteResponse} from '../models/catalogo-api.model';
import {readCategorias, readCartaPlato} from '../models/catalogo-query.model';
import {positiveId} from '../models/pedido-api.model';

function checkedList<T>(value:unknown, valid:(item:T)=>boolean): readonly T[] {
  if (!Array.isArray(value) || value.some(item => !item || typeof item !== 'object' || !valid(item as T))) throw new Error('Los datos del catÃ¡logo no son vÃ¡lidos.');
  const ids = value.map(item => item.id);
  if (new Set(ids).size !== ids.length) throw new Error('El catÃ¡logo contiene identificadores repetidos.');
  return value;
}
@Injectable({providedIn:'root'})
export class CatalogoService {
  private readonly http=inject(HttpClient);
  private readonly base=environment.apiUrl.replace(/\/$/,'');
  restaurantes():Observable<readonly RestauranteResponse[]> {
    return this.http.get<unknown>(this.base+'/restaurantes',{timeout:20000}).pipe(map(data=>checkedList<RestauranteResponse>(data,
      r=>positiveId(r.id)&&typeof r.nombre==='string'&&['activo','abierto','tieneAtencionFisica','aceptaDelivery'].every(k=>typeof r[k as keyof RestauranteResponse]==='boolean'))));
  }
  restaurante(id:number):Observable<RestauranteResponse> {
    return this.http.get<unknown>(this.base+'/restaurantes/'+id,{timeout:20000}).pipe(map(data=>{
      const list=checkedList<RestauranteResponse>([data],r=>r.id===id&&typeof r.nombre==='string'&&['activo','abierto','tieneAtencionFisica','aceptaDelivery'].every(k=>typeof r[k as keyof RestauranteResponse]==='boolean'));
      return list[0];
    }));
  }
  platos(restauranteId:number):Observable<readonly PlatoResponse[]> {
    return this.http.get<unknown>(this.base+'/platos/restaurante/'+restauranteId,{timeout:20000}).pipe(map(data=>checkedList<PlatoResponse>(data,
      p=>positiveId(p.id)&&p.restauranteId===restauranteId&&typeof p.nombre==='string'&&typeof p.precio==='number'&&Number.isFinite(p.precio)&&p.precio>=0&&typeof p.disponible==='boolean')));
  }
  categorias(restauranteId:number):Observable<readonly CategoriaResponse[]> {
    return this.http.get<unknown>(this.base+'/categorias/restaurante/'+restauranteId,{timeout:20000})
      .pipe(map(data=>readCategorias(data,restauranteId)));
  }
  plato(id:number,restauranteId:number):Observable<PlatoResponse> {
    return this.http.get<unknown>(this.base+'/platos/'+id,{timeout:20000})
      .pipe(map(data=>readCartaPlato(data,restauranteId,id)));
  }
  mesas(restauranteId:number):Observable<readonly MesaResponse[]> {
    return this.http.get<unknown>(this.base+'/mesas/restaurante/'+restauranteId,{timeout:20000}).pipe(map(data=>checkedList<MesaResponse>(data,
      m=>positiveId(m.id)&&m.restauranteId===restauranteId&&Number.isInteger(m.numero)&&Number.isInteger(m.capacidad)&&typeof m.activo==='boolean')));
  }
}
