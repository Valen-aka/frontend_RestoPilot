import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({
  selector: 'rp-op-notificaciones',
  imports: [WorkspaceShell, RouterLink, MatButtonModule],
  templateUrl: './op-notificaciones.html',
  styleUrls: ['../../../components/workspace-shell/workspace-pages.css', './op-notificaciones.css'],
})
export class OpNotificacionesPage {}
