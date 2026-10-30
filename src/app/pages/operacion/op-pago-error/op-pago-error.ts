import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {OpPagoRegistrarPage} from '../op-pago-registrar/op-pago-registrar';

@Component({selector:'rp-op-pago-error',imports:[WorkspaceShell,ReactiveFormsModule,RouterLink,MatInputModule,MatButtonModule],templateUrl:'./op-pago-error.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','../op-pago-registrar/op-pago-registrar.css','./op-pago-error.css']})
export class OpPagoErrorPage extends OpPagoRegistrarPage {}
