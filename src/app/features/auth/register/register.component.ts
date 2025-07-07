import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

/**
 * RegisterComponent – форма регистрации нового пользователя.
 * Валидация:
 *  • email (обязательный, валидный формат);
 *  • password (minLength 6);
 *  • confirm  – должен совпадать с password (кастомный валидатор).
 * После успешного создания аккаунта переводит на /dashboard.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  loading = false;

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    },
    { validators: RegisterComponent.passwordMatchValidator }
  );

  constructor(private fb: FormBuilder, private router: Router) {}

  static passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }
  get confirm() {
    return this.form.get('confirm');
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
