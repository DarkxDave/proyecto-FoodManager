import { Component, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ProductosService } from 'src/app/shared/services/productos.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnDestroy {
  userRole: string | null = null;
  userName: string | null = null;
  alertCount = 0;
  private alertInterval: any;

  constructor(private auth: AuthService, private http: HttpClient, private productosSvc: ProductosService) {
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
    this.cargarAlertas();
    this.alertInterval = setInterval(() => this.cargarAlertas(), 30000);
  }

  cargarAlertas() {
    this.productosSvc.alertas().subscribe({
      next: (items) => {
        this.alertCount = (items || []).filter(a => (a.stock_actual ?? 0) <= 20).length;
      },
      error: () => { /* silencioso */ }
    });
  }

  ngOnDestroy(): void {
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
    }
  }
}
