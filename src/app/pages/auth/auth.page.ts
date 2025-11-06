import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage implements OnInit {


  form = new FormGroup({

    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  loading = false;
  errorMsg: string | null = null;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
  }

  submit(){
    if(this.form.invalid || this.loading) return;
    this.errorMsg = null;
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email!, password!)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: res => {
          console.log('Login ok', res);
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          this.errorMsg = err?.error?.mensaje || 'Error al iniciar sesión';
        }
      });
  }

}
