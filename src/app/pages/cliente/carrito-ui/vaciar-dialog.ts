import {Component} from '@angular/core';
import {A11yModule} from '@angular/cdk/a11y';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'rp-vaciar-dialog',
  imports: [A11yModule, MatButtonModule, MatDialogModule],
  templateUrl: './vaciar-dialog.html',
  styleUrl: './vaciar-dialog.css'
})
export class VaciarDialog {}
