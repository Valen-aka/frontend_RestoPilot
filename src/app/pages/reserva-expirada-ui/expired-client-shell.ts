import {Component, DOCUMENT, inject} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'rp-expired-client-shell', imports: [RouterLink],
  templateUrl: './expired-client-shell.html',
  styleUrls: ['../cliente/pedido-ui/pedido-view.css', './expired-client-shell.css']
})
export class ExpiredClientShell {
  private readonly document = inject(DOCUMENT);
  skip(event: Event): void {
    event.preventDefault();
    const main = this.document.getElementById('expiry-client-content');
    main?.focus({preventScroll: true}); main?.scrollIntoView({block: 'start'});
  }
}
