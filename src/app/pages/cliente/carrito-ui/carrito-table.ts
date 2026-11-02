import {Component, input} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {DraftLine, validQuantity} from './carrito-store';

@Component({
  selector: 'rp-carrito-table',
  imports: [CurrencyPipe, ReactiveFormsModule, MatTableModule, MatFormFieldModule, MatInputModule],
  templateUrl: './carrito-table.html',
  styleUrl: './carrito-table.css'
})
export class CarritoTable {
  readonly lines = input.required<readonly DraftLine[]>();
  readonly controls = input<readonly FormControl<number | null>[] | undefined>();
  readonly columns = ['name', 'quantity', 'unitPrice', 'subtotal'];
  readonly isQuantity = validQuantity;
  readonly trackLine = (_index: number, line: DraftLine) => line.id;
}
