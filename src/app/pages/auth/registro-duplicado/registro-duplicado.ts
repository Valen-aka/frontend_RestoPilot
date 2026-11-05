import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';

@Component({selector: 'rp-registro-duplicado', imports: [RouterLink, MatButtonModule], templateUrl: './registro-duplicado.html', styleUrls: ['../../../layouts/auth-layout/auth-forms.css', './registro-duplicado.css']})
export class RegistroDuplicadoPage {}
