import { Component } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage {
  userRole: string | null = null;
  userName: string | null = null;

  constructor(private auth: AuthService, private http: HttpClient) {
    const token = this.auth.getToken();
    if (token) {
      this.http.get<any>(`${environment.apiBaseUrl}/api/auth/me`).subscribe({
        next: (u) => {
          this.userRole = u.rol || null;
          this.userName = u.nombre || null;
        },
        error: () => {
          this.userRole = null;
        }
      });
    }
  }
}
