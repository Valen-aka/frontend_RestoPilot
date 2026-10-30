import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({
  selector: 'rp-dueno-administrador-creado',
  imports: [WorkspaceShell, RouterLink, MatButtonModule],
  templateUrl: './dueno-administrador-creado.html',
  styleUrls: ['../../../components/workspace-shell/workspace-pages.css', './dueno-administrador-creado.css'],
})
export class DuenoAdministradorCreadoPage {}
