import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({
  selector: 'rp-dueno-inicio',
  imports: [WorkspaceShell, RouterLink, MatButtonModule],
  templateUrl: './dueno-inicio.html',
  styleUrls: ['../../../components/workspace-shell/workspace-pages.css', './dueno-inicio.css'],
})
export class DuenoInicioPage {}
