import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MesaResponse} from '../../core/models/catalogo-api.model';
@Component({selector:'rp-op-mesa-desactivar-dialog',imports:[MatDialogModule,MatButtonModule],templateUrl:'./op-mesa-desactivar-dialog.html',styleUrl:'./op-mesa-desactivar-dialog.css'})
export class OpMesaDesactivarDialog {readonly mesa=inject<MesaResponse>(MAT_DIALOG_DATA);}
