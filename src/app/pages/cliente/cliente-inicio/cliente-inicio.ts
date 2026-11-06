import {Component} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';

@Component({
  selector:'rp-cliente-inicio',
  imports:[RouterLink,MatButtonModule,MatCardModule,WorkspaceShell],
  templateUrl:'./cliente-inicio.html',
  styleUrl:'./cliente-inicio.css'
})
export class ClienteInicioPage {
  readonly route = inject(ActivatedRoute);
}
