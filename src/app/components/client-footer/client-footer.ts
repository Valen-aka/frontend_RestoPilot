import {Component, input, output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
@Component({selector:'rp-client-footer',imports:[RouterLink,MatButtonModule],templateUrl:'./client-footer.html',styleUrl:'./client-footer.css'})
export class ClientFooter {
 readonly restaurant = input<string|null>(null);
 readonly signedIn = input(false);
 readonly logout = output<void>();
}
