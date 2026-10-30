import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {AuthLayout} from '../../../layouts/auth-layout/auth-layout';

/** Vista visual de bienvenida; no crea una cuenta ni concede una sesión. */
@Component({
 selector:'rp-dueno-bienvenida',
 imports:[RouterLink,MatButtonModule,AuthLayout],
 templateUrl:'./dueno-bienvenida.html',
 styleUrls:['../../../layouts/auth-layout/auth-forms.css','./dueno-bienvenida.css']
})
export class DuenoBienvenidaPage{}
