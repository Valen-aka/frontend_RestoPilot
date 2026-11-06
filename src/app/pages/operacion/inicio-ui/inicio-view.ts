import {Component, DestroyRef, computed, effect, inject, input, signal, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RouterLink} from '@angular/router';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {forkJoin, Subscription} from 'rxjs';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {AuthService} from '../../../core/services/auth.service';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {ReporteService} from '../../../core/services/reporte.service';
import {RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {ReporteResponse, emptyReporte} from '../../../core/models/reporte-api.model';
import {ReporteChart} from '../reportes-ui/reporte-chart';
@Component({selector:'rp-inicio-view',imports:[RouterLink,CurrencyPipe,DecimalPipe,MatButtonModule,MatCardModule,WorkspaceShell,ReporteChart],templateUrl:'./inicio-view.html',styleUrl:'./inicio-view.css'})
export class InicioView {
 readonly owner=input(false);readonly auth=inject(AuthService);readonly restaurant=signal<RestauranteResponse|null>(null);readonly report=signal<ReporteResponse|null>(null);readonly state=signal<'loading'|'ready'|'empty'|'error'>('loading');private readonly catalog=inject(CatalogoService);private readonly reports=inject(ReporteService);private readonly destroyRef=inject(DestroyRef);private request?:Subscription;
 readonly today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());readonly period={fechaInicio:this.today,fechaFin:this.today};readonly hours=computed(()=>Object.entries(this.report()?.horariosMayorDemanda??{}).map(([label,value])=>({label,value})));
 constructor(){effect(()=>{this.auth.session();untracked(()=>this.load());});}
 load():void {this.request?.unsubscribe();this.report.set(null);this.restaurant.set(null);this.state.set('loading');const s=this.auth.session();if(!s?.restauranteId||!['DUENO','ADMINISTRADOR'].includes(s.role)){this.state.set('error');return;}this.request=forkJoin({restaurant:this.catalog.restaurante(s.restauranteId),report:this.reports.consultar({...this.period,tipo:'CONSOLIDADO'})}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({next:r=>{if(s.accessToken!==this.auth.session()?.accessToken)return;this.restaurant.set(r.restaurant);this.report.set(r.report);this.state.set(emptyReporte(r.report)?'empty':'ready');},error:()=>{if(s.accessToken===this.auth.session()?.accessToken)this.state.set('error');}});}
}
