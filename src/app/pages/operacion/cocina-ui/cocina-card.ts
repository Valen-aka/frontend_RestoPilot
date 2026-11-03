import {Component, computed, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {PedidoAction} from './pedido-action';
import {KitchenOrder, maxComplexity, maxMinutes, sampleTime, serviceLabel} from './cocina.model';

@Component({selector: 'rp-cocina-card', imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './cocina-card.html', styleUrl: './cocina-card.css'})
export class CocinaCard {
  readonly order = input.required<KitchenOrder>();
  readonly complexity = computed(() => maxComplexity(this.order()));
  readonly minutes = computed(() => maxMinutes(this.order()));
  readonly service = computed(() => serviceLabel(this.order()));
  readonly time = computed(() => sampleTime(this.order()));
}
