import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // Пользователь авторизован, доступ разрешен
  }

  // Пользователь не авторизован, перенаправляем на страницу входа
  return router.createUrlTree(['/auth/login']);
};