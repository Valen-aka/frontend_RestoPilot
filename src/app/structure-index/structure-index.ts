import {Component} from '@angular/core';
import manifest from '../screen-manifest.json';
@Component({selector:'rp-structure-index',templateUrl:'./structure-index.html',styleUrl:'./structure-index.css'})
export class StructureIndex{readonly frames=manifest;}
