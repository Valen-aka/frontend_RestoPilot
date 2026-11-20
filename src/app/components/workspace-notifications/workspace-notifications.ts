import {DatePipe, DOCUMENT} from '@angular/common';
import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {Component, DestroyRef, effect, ElementRef, inject, input, output, signal, untracked, viewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {API_SESSION} from '../../core/auth/api-session';
import {NotificacionesStore} from '../../pages/notificaciones-ui/notificaciones-store';
import {UiIcon} from '../ui-icon/ui-icon';

@Component({
  selector: 'rp-workspace-notification-list',
  imports: [A11yModule, DatePipe, MatButtonModule, RouterLink],
  templateUrl: './workspace-notification-list.html',
  styleUrl: './workspace-notifications.css',
})
export class WorkspaceNotificationList {
  readonly historyUrl = input.required<string>();
  readonly dismiss = output<void>();
  readonly notifications = inject(NotificacionesStore);
}

@Component({
  selector: 'rp-workspace-notifications',
  providers: [NotificacionesStore],
  imports: [OverlayModule, MatButtonModule, UiIcon, WorkspaceNotificationList],
  templateUrl: './workspace-notifications.html',
  styleUrl: './workspace-notifications.css',
})
export class WorkspaceNotifications {
  readonly historyUrl = input('/operacion/notificaciones');
  readonly open = signal(false);
  readonly unread = signal(false);
  readonly showAlert = signal(false);
  private readonly notifications = inject(NotificacionesStore);
  private readonly session = inject(API_SESSION);
  private readonly document = inject(DOCUMENT);
  private sessionToken: string | undefined;
  private latestId: number | undefined;

  constructor() {
    effect(() => {
      const token = this.session()?.accessToken;
      const state = this.notifications.state();
      const current = this.notifications.current();
      const messages = this.notifications.messages();

      if (token !== this.sessionToken) {
        this.sessionToken = token;
        this.latestId = undefined;
        this.unread.set(false);
        this.showAlert.set(false);
        this.open.set(false);
      }

      if (!token || !current || (state !== 'ready' && state !== 'empty')) return;

      const latest = messages.reduce((max, message) => Math.max(max, message.id), 0);
      if (this.latestId !== undefined && latest > this.latestId && !untracked(this.open)) {
        this.unread.set(true);
        this.showAlert.set(true);
      }
      this.latestId = Math.max(this.latestId ?? 0, latest);
    });

    effect(onCleanup => {
      if (!this.showAlert()) return;
      const timeout = setTimeout(() => this.showAlert.set(false), 5000);
      onCleanup(() => clearTimeout(timeout));
    });

    const refresh = () => {
      if (!this.document.hidden && this.session() && !this.open() && this.notifications.state() !== 'loading') {
        this.notifications.load(0);
      }
    };
    const poll = setInterval(refresh, 15000);
    this.document.addEventListener('visibilitychange', refresh);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(poll);
      this.document.removeEventListener('visibilitychange', refresh);
    });
  }
  private readonly bell = viewChild.required('bell', {read: ElementRef<HTMLButtonElement>});

  toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }
    this.unread.set(false);
    this.showAlert.set(false);
    this.open.set(true);
    if (this.notifications.state() !== 'loading') this.notifications.load(0);
  }

  close(): void {
    this.open.set(false);
    this.bell().nativeElement.focus();
  }
}
