import {Component,Input} from '@angular/core';
@Component({selector:'rp-form-errors',templateUrl:'./form-errors.html',styleUrl:'./form-errors.css'})
export class FormErrors{@Input() messages:readonly string[]=[];}
