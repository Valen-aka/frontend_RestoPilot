import {Component, DestroyRef, DOCUMENT, computed, effect, inject, input, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {AuthService} from '../../../core/services/auth.service';
import {ReportesStore} from './reportes-store';
import {ReporteChart, ReporteBar} from './reporte-chart';
import {ReporteQuery, TipoReporte, reporteDate, reporteTipos, validReporteQuery} from '../../../core/models/reporte-api.model';
@Component({selector:'rp-reportes-view',imports:[RouterLink,ReactiveFormsModule,CurrencyPipe,DecimalPipe,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatTableModule,MatProgressSpinnerModule,WorkspaceShell,ReporteChart],providers:[ReportesStore],templateUrl:'./reportes-view.html',styleUrl:'./reportes-view.css'})
export class ReportesView {
 readonly payments=input(false);readonly store=inject(ReportesStore);readonly router=inject(Router);private readonly route=inject(ActivatedRoute);private readonly auth=inject(AuthService);private readonly document=inject(DOCUMENT);private readonly destroyRef=inject(DestroyRef);
 readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});readonly tipos=reporteTipos;
 readonly form=new FormGroup({fechaInicio:new FormControl('',{nonNullable:true,validators:[Validators.required,c=>reporteDate(c.value)?null:{fecha:true}]}),fechaFin:new FormControl('',{nonNullable:true,validators:[Validators.required,c=>reporteDate(c.value)?null:{fecha:true}]}),tipo:new FormControl<TipoReporte>('CONSOLIDADO',{nonNullable:true})});
 private readonly values=toSignal(this.form.valueChanges,{initialValue:this.form.getRawValue()});
 readonly draft=computed<ReporteQuery>(()=>{this.values();const q=this.form.getRawValue();return {...q,tipo:this.payments()?'PAGOS':q.tipo};});
 readonly draftValid=computed(()=>validReporteQuery(this.draft()));
 readonly changed=computed(()=>{const q=this.store.query();return !!q&&JSON.stringify(q)!==JSON.stringify(this.draft());});
 readonly queryParams=computed(()=>{const q=this.store.query()??this.draft();return {fechaInicio:q.fechaInicio||null,fechaFin:q.fechaFin||null};});
 readonly validationProblem=computed(()=>this.store.state()==='invalid'?(this.draftValid()?'':!reporteDate(this.draft().fechaInicio)||!reporteDate(this.draft().fechaFin)?'Completa ambas fechas con valores válidos.':this.draft().fechaInicio>this.draft().fechaFin?'La fecha inicial no puede ser posterior a la final.':'Selecciona un tipo de reporte válido.'):this.store.problem());
 readonly title=computed(()=>this.store.state()==='empty'?'Todavía no hay datos en este período':this.store.state()==='invalid'&&!this.draftValid()?'Revisa el período':this.payments()?'Los números, claros':'Decisiones con mejores ingredientes');
 readonly demanda=computed<readonly ReporteBar[]>(()=>Object.entries(this.store.report()?.horariosMayorDemanda??{}).map(([label,value])=>({label,value})));
 readonly metodos=computed<readonly ReporteBar[]>(()=>Object.entries(this.store.report()?.estadoPagos?.metodosPagoUtilizados??{}).map(([label,value])=>({label,value})));
 readonly atenciones=computed<readonly ReporteBar[]>(()=>{const r=this.store.report();return r?.pedidosAtendidos!==null&&r?.pedidosAtendidos!==undefined&&r.reservasCompletadas!==null?[{label:'Pedidos atendidos',value:r.pedidosAtendidos},{label:'Reservas completadas',value:r.reservasCompletadas}]:[];});
 readonly platos=computed(()=>this.store.report()?.platosMasVendidos?.map((label,index)=>({index:index+1,label}))??[]);
 constructor(){effect(()=>{const p=this.params(),pagos=this.payments();this.store.session();untracked(()=>{const query={fechaInicio:p.get('fechaInicio')||'',fechaFin:p.get('fechaFin')||'',tipo:(pagos?'PAGOS':p.get('tipo')||'CONSOLIDADO') as TipoReporte};this.form.reset(query);this.store.load(query,pagos,p.has('fechaInicio')||p.has('fechaFin')||p.has('tipo'));});});}
 consult():void {this.form.markAllAsTouched();const query=this.draft();if(!this.draftValid()){this.store.load(query,this.payments(),true);return;}const path=this.payments()?'/operacion/reportes/pagos':'/operacion/reportes',tree=this.router.createUrlTree([path],{queryParams:{fechaInicio:query.fechaInicio,fechaFin:query.fechaFin,...(!this.payments()?{tipo:query.tipo}:{})}});if(this.router.url===this.router.serializeUrl(tree))this.store.load(query,this.payments(),true);else void this.router.navigateByUrl(tree);}
 retry():void {const p=this.params();this.store.load({fechaInicio:p.get('fechaInicio')||'',fechaFin:p.get('fechaFin')||'',tipo:(this.payments()?'PAGOS':p.get('tipo')||'CONSOLIDADO') as TipoReporte},this.payments(),true);}
 changePeriod():void {this.document.getElementById('reporte-inicio')?.focus();}
 logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
}
