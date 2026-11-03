import {Component, DOCUMENT, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'rp-expired-client-shell', imports: [RouterLink, MatButtonModule],
  templateUrl: './expired-client-shell.html',
  styleUrls: ['../cliente/pedido-ui/pedido-view.css', './expired-client-shell.css']
})
export class ExpiredClientShell {
  private readonly auth=inject(AuthService);
  private readonly router=inject(Router);
  logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
  private readonly document = inject(DOCUMENT);
  skip(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('expiry-client-content');
    main?.focus({preventScroll: true}); main?.scrollIntoView({block: 'start'});
  }
}
