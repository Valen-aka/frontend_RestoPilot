import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {CategoriaResponse} from '../../../core/models/catalogo-api.model';
import {positiveId} from '../../../core/models/pedido-api.model';
import {CatalogoService} from '../../../core/services/catalogo.service';

export interface CategoriaDatos {nombre:string; descripcion:string;}
export function categoriaValida(datos:CategoriaDatos):boolean {
  return typeof datos.nombre==='string' && !!datos.nombre.trim() && datos.nombre.length<=100 && typeof datos.descripcion==='string';
}

/** Proveer por pantalla, no en root: destruir la pantalla cancela su contexto. */
@Injectable()
export class CategoriasStore {
  private readonly session=inject(API_SESSION);
  private readonly api=inject(CatalogoService);
  private readonly key=computed(()=>{const s=this.session();return activeOperationSession(s)?s.subject+':'+s.restauranteId+':'+s.accessToken:'';});
  private readonly owner=signal('');
  private readonly values=signal<readonly CategoriaResponse[]>([]);
  private readonly status=signal<'idle'|'loading'|'ready'|'error'>('idle');
  readonly selectedId=signal<number|null>(null);
  readonly issue=signal('');
  readonly busy=signal(false);
  readonly uncertain=signal(false);
  readonly notice=signal('');
  readonly hasSession=computed(()=>!!this.key());
  readonly entries=computed(()=>this.key() && this.owner()===this.key()?this.values():[]);
  readonly selected=computed(()=>this.entries().find(c=>c.id===this.selectedId()));
  readonly state=computed(()=>!this.hasSession()?'error':this.owner()!==this.key()?'idle':this.status());
  readonly problem=computed(()=>!this.hasSession()?'Necesitas una sesión de dueño o administrador con restaurante asignado.':this.issue());
  private query?:Subscription;
  private mutation?:Subscription;
  private version=0;
  private disposed=false;
  private resolve?: (ok:boolean)=>void;
  constructor() {
    effect(()=>{const key=this.key();untracked(()=>{if(key!==this.owner())this.reset();});});
    inject(DestroyRef).onDestroy(()=>{this.disposed=true;this.reset();});
  }
  /** Invocar también al cambiar de ID/contexto cuando el componente no se destruya. */
  reset():void {
    this.version++;this.query?.unsubscribe();this.mutation?.unsubscribe();
    this.resolve?.(false);this.resolve=undefined;
    this.owner.set(this.key());this.values.set([]);this.status.set('idle');this.selectedId.set(null);
    this.busy.set(false);this.uncertain.set(false);this.issue.set('');this.notice.set('');
  }
  load(id:number|null=null):void {
    if(this.disposed || this.busy())return;
    this.reset();this.selectedId.set(id);
    const s=this.session();if(!activeOperationSession(s))return;
    if(id!==null && !positiveId(id)){this.status.set('error');this.issue.set('Selecciona una categoría válida.');return;}
    const version=this.version,key=this.key();this.status.set('loading');
    this.query=this.api.categorias(s.restauranteId).subscribe({next:items=>{
      if(!this.current(version,key))return;
      this.values.set(items);this.status.set('ready');
      if(id!==null && !items.some(c=>c.id===id)){this.status.set('error');this.issue.set('La categoría no está disponible en tu restaurante.');}
    },error:error=>{if(this.current(version,key)){this.status.set('error');this.issue.set(this.errorMessage(error));}}});
  }
  create(datos:CategoriaDatos):Promise<boolean> {return this.save(null,datos);}
  update(datos:CategoriaDatos):Promise<boolean> {
    const id=this.selected()?.id;return id?this.save(id,datos):Promise.resolve(false);
  }
  private save(id:number|null,datos:CategoriaDatos):Promise<boolean> {
    const s=this.session();
    if(!activeOperationSession(s)||!this.canMutate())return Promise.resolve(false);
    if(!categoriaValida(datos)){this.issue.set('Ingresa un nombre de hasta 100 caracteres.');return Promise.resolve(false);}
    const body={nombre:datos.nombre.trim(),descripcion:datos.descripcion};
    return this.execute(()=>id===null?this.api.crearCategoria(s.restauranteId,body):this.api.actualizarCategoria(id,s.restauranteId,body),categoria=>{
      this.values.update(items=>id===null?[...items,categoria]:items.map(c=>c.id===id?categoria:c));
      this.selectedId.set(categoria.id);this.notice.set(id===null?'Categoría creada.':'Categoría actualizada.');
    });
  }
  /** La UI debe pasar true solo tras la confirmación explícita del diálogo. */
  remove(confirmed:boolean):Promise<boolean> {
    const id=this.selected()?.id;
    if(!confirmed||!id||!this.canMutate())return Promise.resolve(false);
    return this.execute(()=>this.api.eliminarCategoria(id),()=>{
      this.values.update(items=>items.filter(c=>c.id!==id));this.selectedId.set(null);this.notice.set('Categoría eliminada.');
    });
  }
  private canMutate():boolean {
    return !this.disposed && this.hasSession() && this.owner()===this.key() && this.status()==='ready' && !this.busy() && !this.uncertain();
  }
  private current(version:number,key:string):boolean {
    const s=this.session();return !this.disposed && activeOperationSession(s) && version===this.version && key===this.key();
  }
  private execute<T>(request:()=>Observable<T>,apply:(value:T)=>void):Promise<boolean> {
    this.query?.unsubscribe();const version=++this.version,key=this.key();
    this.busy.set(true);this.issue.set('');this.notice.set('');
    return new Promise(resolve=>{
      this.resolve=resolve;
      const finish=(ok:boolean)=>{this.busy.set(false);this.resolve=undefined;resolve(ok);};
      this.mutation=request().subscribe({next:value=>{
        if(!this.current(version,key)){this.reset();return;}
        apply(value);finish(true);
      },error:error=>{
        if(!this.current(version,key)){this.reset();return;}
        const status=error instanceof HttpErrorResponse?error.status:0;
        const uncertain=status===0||status>=500;
        this.uncertain.set(uncertain);
        this.issue.set(uncertain?'No pudimos confirmar la operación. Consulta el listado antes de repetirla; podría haberse guardado.':this.errorMessage(error));
        if([401,403,404].includes(status)){this.values.set([]);this.status.set('error');}
        finish(false);
      }});
    });
  }
  private errorMessage(error:unknown):string {
    const status=error instanceof HttpErrorResponse?error.status:0;
    return status===401?'La sesión expiró. Vuelve a iniciar sesión.':status===403?'No tienes permiso para gestionar esta categoría.':
      status===404?'La categoría ya no está disponible.':status===409?'No se puede completar la operación: la categoría tiene datos asociados o cambió. Actualiza el listado.':
      status===400?'Revisa los datos: el nombre es obligatorio y admite hasta 100 caracteres.':'No pudimos consultar las categorías. Intenta nuevamente.';
  }
}
