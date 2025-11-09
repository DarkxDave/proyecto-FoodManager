import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sing-up',
  templateUrl: './sing-up.page.html',
  styleUrls: ['./sing-up.page.scss'],
  standalone: false,
})
export class SingUpPage implements OnInit {
  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    contrasena: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  loading = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {}

  submit(){
    if(this.form.invalid || this.loading) return;
    this.errorMsg = null;
    this.successMsg = null;
    this.loading = true;
    const { nombre, email, contrasena } = this.form.value;
    this.auth.register(nombre!, email!, contrasena!)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: res => {
          this.successMsg = res.mensaje || 'Registro exitoso';
          // Opcional: redirigir inmediatamente al login
          setTimeout(() => this.router.navigate(['/auth']), 1200);
        },
        error: err => {
          this.errorMsg = err?.error?.mensaje || 'Error al registrar';
        }
      });
  }

}
