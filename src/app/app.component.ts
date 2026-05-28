import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface NavigationItem {
  label: string;
  icon: 'dashboard' | 'transactions' | 'clients' | 'settings';
  route?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly sidebarOpen = signal(false);
  readonly navigation = NAVIGATION_ITEMS;
  readonly iconPaths = ICON_PATHS;

  readonly isOnline = toSignal(
    merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ),
    { initialValue: navigator.onLine }
  );

  readonly connectionLabel = computed(() => (this.isOnline() ? 'Online' : 'Offline'));

  toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard'
  },
  {
    label: 'Transacciones',
    icon: 'transactions',
    disabled: true
  },
  {
    label: 'Clientes',
    icon: 'clients',
    disabled: true
  },
  {
    label: 'Configuración',
    icon: 'settings',
    disabled: true
  }
];

const ICON_PATHS: Record<NavigationItem['icon'], string> = {
  dashboard:
    'M4.5 5.25A2.25 2.25 0 0 1 6.75 3h3A2.25 2.25 0 0 1 12 5.25v3A2.25 2.25 0 0 1 9.75 10.5h-3A2.25 2.25 0 0 1 4.5 8.25v-3Zm7.5 0A2.25 2.25 0 0 1 14.25 3h3a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 17.25 15h-3A2.25 2.25 0 0 1 12 12.75v-7.5Zm-7.5 9A2.25 2.25 0 0 1 6.75 12h3A2.25 2.25 0 0 1 12 14.25v4.5A2.25 2.25 0 0 1 9.75 21h-3A2.25 2.25 0 0 1 4.5 18.75v-4.5Zm9.75-.75a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75Zm2.25 0a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75Z',
  transactions:
    'M5.25 4.5A2.25 2.25 0 0 1 7.5 2.25h9A2.25 2.25 0 0 1 18.75 4.5v15A2.25 2.25 0 0 1 16.5 21.75h-9A2.25 2.25 0 0 1 5.25 19.5v-15Zm3 2.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Zm0 4.5a.75.75 0 0 0 0 1.5h5.25a.75.75 0 0 0 0-1.5H8.25Zm0 4.5a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z',
  clients:
    'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-6.75 7.5a6.75 6.75 0 0 1 13.5 0 .75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75Zm13.03-7.03a3.25 3.25 0 1 0-1.31-6.23 5.74 5.74 0 0 1 .15 1.26c0 1.27-.42 2.45-1.13 3.4a3.23 3.23 0 0 0 2.29 1.57Zm1.42 2.22a8.31 8.31 0 0 1 2.55 5.06.75.75 0 0 1-.74.85h-1.66a8.27 8.27 0 0 0-1.3-3.95c.45-.59.84-1.25 1.15-1.96Z',
  settings:
    'M12 8.25A3.75 3.75 0 1 0 15.75 12 3.75 3.75 0 0 0 12 8.25Zm8.8 4.43-.92-.53a1.1 1.1 0 0 1-.53-1.24l.28-1.02a1.75 1.75 0 0 0-1.21-2.12l-1.06-.31a1.1 1.1 0 0 1-.76-.84l-.2-1.05a1.75 1.75 0 0 0-1.72-1.42h-1.23a1.1 1.1 0 0 1-1.03-.7L11.96 2.4a1.75 1.75 0 0 0-2.2 0l-.46 1.05a1.1 1.1 0 0 1-1.03.7H7.04a1.75 1.75 0 0 0-1.72 1.42l-.2 1.05a1.1 1.1 0 0 1-.76.84l-1.06.31A1.75 1.75 0 0 0 2.09 9.9l.28 1.02a1.1 1.1 0 0 1-.53 1.24l-.92.53a1.75 1.75 0 0 0 0 3.02l.92.53c.43.25.64.76.53 1.24l-.28 1.02a1.75 1.75 0 0 0 1.21 2.12l1.06.31c.46.13.78.5.86.97l.2 1.05a1.75 1.75 0 0 0 1.72 1.42h1.23c.46 0 .87.28 1.03.7l.46 1.05a1.75 1.75 0 0 0 2.2 0l.46-1.05a1.1 1.1 0 0 1 1.03-.7h1.23a1.75 1.75 0 0 0 1.72-1.42l.2-1.05c.08-.47.4-.84.86-.97l1.06-.31a1.75 1.75 0 0 0 1.21-2.12l-.28-1.02a1.1 1.1 0 0 1 .53-1.24l.92-.53a1.75 1.75 0 0 0 0-3.02Z'
};
