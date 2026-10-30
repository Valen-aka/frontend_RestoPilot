import {Component} from '@angular/core';
import {CuentaLayout} from '../../../layouts/cuenta-layout/cuenta-layout';
import {EmptyState} from '../../../components/empty-state/empty-state';
@Component({selector:'rp-estado-sesion-expirada',imports:[CuentaLayout,EmptyState],templateUrl:'./estado-sesion-expirada.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./estado-sesion-expirada.css']})
export class EstadoSesionExpiradaPage {}
