import {Component} from '@angular/core';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {LoadingState} from '../../../components/loading-state/loading-state';
@Component({selector:'rp-estado-cargando',imports:[WorkspaceShell,LoadingState],templateUrl:'./estado-cargando.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./estado-cargando.css']})
export class EstadoCargandoPage {}
