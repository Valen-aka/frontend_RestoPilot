import {Component, computed, input, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MesaResponse} from '../../../core/models/catalogo-api.model';
import {MesaRequest, projectMesas} from '../../../core/models/mesas.model';
@Component({selector:'rp-plano-mesas',imports:[RouterLink,MatButtonModule],templateUrl:'./plano-mesas.html',styleUrl:'./plano-mesas.css'})
export class PlanoMesas {
 readonly mesas=input<readonly MesaResponse[]>([]);readonly preview=input<MesaRequest|null>(null);readonly selectedKey=signal('');
 readonly points=computed(()=>projectMesas(this.mesas()));
 readonly missing=computed(()=>this.mesas().filter(r=>r.coordenadaX===null||r.coordenadaY===null));
 readonly selected=computed(()=>this.points().find(p=>p.key===this.selectedKey()));
 allInactive(rows:readonly MesaResponse[]):boolean{return rows.every(m=>!m.activo);}
 label(rows:readonly MesaResponse[]):string{return rows.length===1?'Mesa '+rows[0].numero:rows.length+' mesas en la misma ubicación';}
}
