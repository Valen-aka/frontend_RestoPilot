import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({
  selector: 'rp-cliente-notificaciones',
  imports: [WorkspaceShell, RouterLink, MatButtonModule],
  templateUrl: './cliente-notificaciones.html',
  styleUrls: ['../../../components/workspace-shell/workspace-pages.css', './cliente-notificaciones.css'],
})
export class ClienteNotificacionesPage {}
