import {Component} from '@angular/core';
import {CuentaLayout} from '../../../layouts/cuenta-layout/cuenta-layout';
import {EmptyState} from '../../../components/empty-state/empty-state';
@Component({selector:'rp-estado-error',imports:[CuentaLayout,EmptyState],templateUrl:'./estado-error.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./estado-error.css']})
export class EstadoErrorPage {
}
