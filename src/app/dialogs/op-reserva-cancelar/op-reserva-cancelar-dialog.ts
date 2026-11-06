import {Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ReservaResponse} from '../../core/models/reserva-api.model';
@Component({selector:'rp-op-reserva-cancelar-dialog',imports:[ReactiveFormsModule,MatDialogModule,MatButtonModule,MatFormFieldModule,MatInputModule],templateUrl:'./op-reserva-cancelar-dialog.html',styleUrl:'./op-reserva-cancelar-dialog.css'})
export class OpReservaCancelarDialog {
 readonly reservation=inject<ReservaResponse>(MAT_DIALOG_DATA);readonly ref=inject(MatDialogRef<OpReservaCancelarDialog,string|false>);
 readonly reason=new FormControl('',{nonNullable:true,validators:Validators.maxLength(300)});
 confirm():void {this.reason.markAsTouched();if(this.reason.valid)this.ref.close(this.reason.value);}
}
