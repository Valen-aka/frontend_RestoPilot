import {Component} from '@angular/core';
import {CocinaView} from '../cocina-ui/cocina-view';

/** US15: consulta de muestra, sin transiciones ni servicios. */
@Component({selector:'rp-op-cocina',imports:[CocinaView],templateUrl:'./op-cocina.html',styleUrl:'./op-cocina.css'})
export class OpCocinaPage {}
