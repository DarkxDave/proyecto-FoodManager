import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  standalone: false
})
export class AdminSidebarComponent {
  @Input() role: string | null = null;
  collapsed = false;

  links = [
    { icon: 'storefront-outline', label: 'Bodegas', path: '/dashboard/bodegas', roles: ['admin'] },
    { icon: 'grid-outline', label: 'Góndolas', path: '/dashboard/gondolas', roles: ['admin'] },
    { icon: 'cart-outline', label: 'Pedidos', path: '/dashboard/pedidos', roles: ['admin','usuario'] },
    { icon: 'people-outline', label: 'Usuarios', path: '/dashboard/usuarios', roles: ['admin'] }
  ];

  constructor(private router: Router) {}

  visibleLinks() {
    return this.links.filter(l => !l.roles || l.roles.includes(this.role || 'usuario'));
  }

  go(path: string) {
    this.router.navigate([path]);
  }
}
