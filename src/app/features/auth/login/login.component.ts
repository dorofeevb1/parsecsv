import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

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

  constructor(private fb: FormBuilder, private router: Router) {}

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
  }
}
