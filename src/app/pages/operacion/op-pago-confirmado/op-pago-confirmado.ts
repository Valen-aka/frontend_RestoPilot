import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({selector:'rp-op-pago-confirmado',imports:[WorkspaceShell,RouterLink,MatButtonModule],templateUrl:'./op-pago-confirmado.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./op-pago-confirmado.css']})
export class OpPagoConfirmadoPage {}
