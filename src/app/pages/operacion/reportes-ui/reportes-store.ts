import {DestroyRef, Injectable, computed, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {forkJoin, Subscription} from 'rxjs';
import {API_SESSION, activeOperationSession} from '../../../core/auth/api-session';
import {ReporteService} from '../../../core/services/reporte.service';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {ReporteQuery, ReporteResponse, ReporteContractError, emptyReporte, validReporteQuery} from '../../../core/models/reporte-api.model';
@Injectable()
export class ReportesStore {
 readonly session=inject(API_SESSION);private readonly api=inject(ReporteService);private readonly catalog=inject(CatalogoService);private request?:Subscription;private generation=0;
 readonly restaurant=signal<RestauranteResponse|null>(null);readonly report=signal<ReporteResponse|null>(null);readonly query=signal<ReporteQuery|null>(null);
 readonly state=signal<'idle'|'loading'|'ready'|'empty'|'invalid'|'error'>('idle');readonly problem=signal('');readonly hasSession=computed(()=>activeOperationSession(this.session()));
 constructor(){inject(DestroyRef).onDestroy(()=>{this.generation++;this.request?.unsubscribe();});}
 load(query:ReporteQuery,pagos:boolean,explicit:boolean):void {
  const generation=++this.generation;this.request?.unsubscribe();this.report.set(null);this.restaurant.set(null);this.problem.set('');this.query.set(null);
  const session=this.session();if(!activeOperationSession(session)){this.state.set('error');this.problem.set('Necesitas una sesión de dueño o administrador con restaurante asignado.');return;}
  if(!validReporteQuery(query)||pagos&&query.tipo!=='PAGOS'){
   this.state.set(explicit?'invalid':'idle');if(explicit)this.problem.set('Completa ambas fechas y el tipo de reporte. La fecha inicial no puede ser posterior a la final.');
   this.request=this.catalog.restaurante(session.restauranteId).subscribe({next:r=>{if(generation===this.generation)this.restaurant.set(r);},error:()=>{}});return;
  }
  this.query.set(query);this.state.set('loading');
  this.request=forkJoin({restaurant:this.catalog.restaurante(session.restauranteId),report:this.api.consultar(query,pagos)}).subscribe({next:data=>{if(generation!==this.generation||session.accessToken!==this.session()?.accessToken)return;this.restaurant.set(data.restaurant);this.report.set(data.report);this.state.set(emptyReporte(data.report)?'empty':'ready');},error:cause=>{if(generation!==this.generation)return;this.report.set(null);this.state.set('error');this.problem.set(this.message(cause));}});
 }
 private message(cause:unknown):string {if(cause instanceof ReporteContractError)return 'La respuesta del reporte está incompleta o no corresponde al tipo solicitado.';if(cause instanceof HttpErrorResponse){if([401,403].includes(cause.status))return 'No tienes permiso para consultar estos reportes.';if(cause.status===400&&typeof cause.error?.mensaje==='string'&&cause.error.mensaje.length<=500)return cause.error.mensaje;}return 'No pudimos consultar el reporte. Vuelve a intentarlo.';}
}
