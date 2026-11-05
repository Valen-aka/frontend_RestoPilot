export interface RestauranteResponse {
  readonly id:number; readonly nombre:string; readonly direccion:string|null;
  readonly activo:boolean; readonly abierto:boolean;
  readonly tieneAtencionFisica:boolean; readonly aceptaDelivery:boolean;
  readonly horaApertura:string|null; readonly horaCierre:string|null;
}
export interface PlatoResponse {
  readonly id:number; readonly restauranteId:number; readonly categoriaId:number;
  readonly categoriaNombre:string; readonly nombre:string; readonly descripcion:string|null;
  readonly precio:number; readonly ingredientes:string|null; readonly alergenos:string|null;
  readonly complejidad:string|null; readonly tiempoPreparacionMinutos:number|null;
  readonly disponible:boolean; readonly imagenUrl:string|null;
  readonly creadoEn:string; readonly actualizadoEn:string|null;
}
export interface MesaResponse {
  readonly id:number; readonly restauranteId:number; readonly restauranteNombre:string;
  readonly numero:number; readonly capacidad:number; readonly coordenadaX:number|null; readonly coordenadaY:number|null;
  readonly activo:boolean; readonly creadoEn:string; readonly actualizadoEn:string|null; readonly mensaje?:string;
}

/** Lectura de la entidad Categoria serializada por CategoriaController. */
export interface CategoriaResponse {
  readonly id: number;
  readonly restauranteId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly creadoEn: string;
  readonly actualizadoEn: string | null;
}
  export interface PlatoRequest {
  restauranteId: number;
  categoriaId: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  ingredientes: string | null;
  alergenos: string | null;
  complejidad: 'BAJA' | 'MEDIA' | 'ALTA';
  tiempoPreparacionMinutos: number;
  disponible: boolean;
  imagenUrl: string | null;

}
