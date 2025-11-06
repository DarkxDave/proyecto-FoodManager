import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: {
    id_usuario: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiBaseUrl + '/api/auth';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(email: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, contrasena }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
