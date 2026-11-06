import {SessionBoundary} from './core/services/session-boundary.service';
import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
@Component({selector:'rp-root',imports:[RouterOutlet],templateUrl:'./app.html',styleUrl:'./app.css'})
export class App{constructor(){inject(SessionBoundary);}}
