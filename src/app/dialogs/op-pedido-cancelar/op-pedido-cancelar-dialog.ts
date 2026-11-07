import {Component,inject} from '@angular/core';
import {MAT_DIALOG_DATA,MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
@Component({selector:'rp-op-pedido-cancelar-dialog',imports:[MatDialogModule,MatButtonModule],templateUrl:'./op-pedido-cancelar-dialog.html',styleUrl:'./op-pedido-cancelar-dialog.css'})
export class OpPedidoCancelarDialog{readonly data=inject<{pedidoId:number}>(MAT_DIALOG_DATA);}
