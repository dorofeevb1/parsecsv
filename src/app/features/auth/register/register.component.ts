import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/service/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  loading = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required]
  }, { 
    validators: this.passwordMatchValidator 
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  private passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get confirm() { return this.form.get('confirm'); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.form.value;

    this.authService.register({ 
      email: email as string,
      password: password as string
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (user) => {
        this.showSuccess('Регистрация прошла успешно!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err);
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.status === 409) {
      return 'Пользователь с таким email уже существует';
    }
    return error?.message || 'Произошла ошибка при регистрации';
  }
}