import {Component, signal} from '@angular/core';
import {PreviewOperation} from '../../../components/preview-operation/preview-operation';
import {PreviewPanel} from '../../../components/preview-operation/preview-panel';
import {CuentaLayout} from '../../../layouts/cuenta-layout/cuenta-layout';
import {EmptyState} from '../../../components/empty-state/empty-state';
@Component({selector:'rp-estado-error',imports:[CuentaLayout,EmptyState,PreviewPanel],templateUrl:'./estado-error.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./estado-error.css']})
export class EstadoErrorPage {
 readonly notice=signal('');
 readonly preview=new PreviewOperation();
 retry(){this.preview.run();}
}
