import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {AtencionFisicaResponse} from '../../core/models/atencion-fisica.model';
@Component({selector:'rp-op-reservas-modulo-confirmar-dialog',imports:[MatDialogModule,MatButtonModule],templateUrl:'./op-reservas-modulo-confirmar-dialog.html',styleUrl:'./op-reservas-modulo-confirmar-dialog.css'})
export class OpReservasModuloConfirmarDialog {readonly data=inject<AtencionFisicaResponse>(MAT_DIALOG_DATA);}
