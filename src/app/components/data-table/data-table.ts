import {Component} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
@Component({selector:'rp-data-table',imports:[MatTableModule,MatPaginatorModule],templateUrl:'./data-table.html',styleUrl:'./data-table.css'})
export class DataTable{}
