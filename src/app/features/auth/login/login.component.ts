import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/core/service/auth/auth.service';

/**
 * LoginComponent – форма входа.
 * Реализует реактивную форму (FormBuilder) с валидацией email + password.
 * При submit вызывает AuthService.login(), обрабатывает Observable:
 *   • success – snackbar, переход на /dashboard.
 *   • error   – snackbar с текстом ошибки.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value as { email: string; password: string };
    this.loading = true;
     this.authService.login(email, password).subscribe({
      next: (user) => {
        console.log('Logged in as', user.name);
        // Перенаправление на защищенную страницу
      },
      error: (err) => {
        console.error('Login failed', err);
      }
    });
  }
}
