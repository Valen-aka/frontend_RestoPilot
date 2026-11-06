import {Component, DOCUMENT, computed, inject, input} from '@angular/core';
import {BaseChartDirective, provideCharts, withDefaultRegisterables} from 'ng2-charts';
import {ChartData, ChartOptions} from 'chart.js';
export interface ReporteBar {readonly label:string;readonly value:number;}
@Component({selector:'rp-reporte-chart',imports:[BaseChartDirective],providers:[provideCharts(withDefaultRegisterables())],templateUrl:'./reporte-chart.html',styleUrl:'./reporte-chart.css'})
export class ReporteChart {
 readonly rows=input<readonly ReporteBar[]>([]);readonly title=input('Resultados');readonly unit=input('Cantidad');
 private readonly document=inject(DOCUMENT);
 readonly data=computed<ChartData<'bar'>>(()=>({labels:this.rows().map(r=>r.label),datasets:[{label:this.unit(),data:this.rows().map(r=>r.value),backgroundColor:this.document.defaultView?.getComputedStyle(this.document.documentElement).getPropertyValue('--rp-primary').trim()||'#1b7954',borderRadius:4}]}));
 readonly options:ChartOptions<'bar'>={responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}},x:{ticks:{autoSkip:true,maxRotation:45}}}};
}
