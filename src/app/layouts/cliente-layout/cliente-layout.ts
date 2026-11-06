import {Component} from '@angular/core';
import {ClientHeader} from '../../components/client-header/client-header';
import {RouterOutlet} from '@angular/router';
@Component({selector:'rp-cliente-layout',imports:[RouterOutlet,ClientHeader],templateUrl:'./cliente-layout.html',styleUrl:'./cliente-layout.css'})
export class ClienteLayout{}
