import {Component, input} from '@angular/core';

export type ClientSkeletonKind = 'dashboard' | 'catalog' | 'detail' | 'table' | 'list' | 'cart' | 'payment' | 'floorplan';

@Component({
  selector: 'rp-client-loading-skeleton',
  templateUrl: './client-loading-skeleton.html',
  styleUrl: './client-loading-skeleton.css'
})
export class ClientLoadingSkeleton {
  readonly kind = input.required<ClientSkeletonKind>();
  readonly label = input.required<string>();
}
