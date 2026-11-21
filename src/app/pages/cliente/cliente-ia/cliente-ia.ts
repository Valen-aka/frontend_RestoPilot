import {Component} from '@angular/core';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'rp-cliente-ia',
  imports: [WorkspaceShell],
  templateUrl: './cliente-ia.html',
  styleUrl: './cliente-ia.css',
})
export class ClienteIaPage {
  readonly available = Boolean(environment.assistantApiUrl);
}