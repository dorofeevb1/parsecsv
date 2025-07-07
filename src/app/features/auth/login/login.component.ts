import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs'; // Import finalize
import { AuthService } from 'src/app/core/service/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  loginError: string | null = null; // To show errors in the template

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.loginError = null;
    
    const { email, password } = this.form.getRawValue();

    this.authService.login(email!, password!).pipe(
      finalize(() => this.loading = false) // Ensures loading is always set to false
    ).subscribe({
      next: (user) => {
        this.router.navigate(['/dashboard/statistic']);
      },
      error: (err: Error) => {
        this.loginError = err.message; // Display the error to the user
        console.error('Login failed', err);
      }
    });
  }
}