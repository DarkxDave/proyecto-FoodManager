import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage {
  userEmail = localStorage.getItem('auth_token') ? 'Usuario autenticado' : 'Invitado';
}
