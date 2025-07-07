// src/app/core/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';
import { HttpErrorResponse } from '@angular/common/http';


interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private router: Router
  ) {
    // При инициализации проверяем наличие токена в хранилище
    this.initializeAuthState();
  }

  // Инициализация состояния аутентификации
  private initializeAuthState(): void {
    const token = this.getToken();
    const user = this.storage.get(this.USER_KEY);

    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  // Вход в систему
  login(email: string, password: string): Observable<User> {
    return this.api.post<LoginResponse>('auth/login', { email, password }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setCurrentUser(response.user);
      }),
      map(response => response.user)
    );
  }

  // Выход из системы
  logout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth']);
  }

  // Регистрация
// Улучшенная версия метода register в AuthService
register(userData: {
  email: string;
  password: string;
}): Observable<User> {
  // Валидация входных данных перед отправкой
  if (!userData?.email || !userData?.password) {
    return throwError(() => new Error('All registration fields are required'));
  }

  // Проверка сложности пароля (опционально)
  if (userData.password.length < 6) {
    return throwError(() => new Error('Password must be at least 6 characters long'));
  }

  return this.api.post<LoginResponse>('auth/register', {

    email: userData.email.toLowerCase().trim(),
    password: userData.password
  }).pipe(
    tap({
      next: (response) => {
        if (!response?.token || !response?.user) {
          throw new Error('Invalid server response');
        }
        this.setToken(response.token);
        this.setCurrentUser(response.user);
        
        // Логирование успешной регистрации
        console.log(`User ${response.user.email} registered successfully`);
      },
      error: (err) => {
        console.error('Registration error:', err);
        throw err; // Пробрасываем ошибку дальше
      }
    }),
    map(response => response.user),
    catchError(error => {
      // Преобразование ошибок HTTP в пользовательские сообщения
      let errorMessage = 'Registration failed';
      
      if (error instanceof HttpErrorResponse) {
        if (error.status === 409) {
          errorMessage = 'Email already exists';
        } else if (error.status >= 500) {
          errorMessage = 'Server error, please try again later';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
}

  // Проверка авторизации
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Получение текущего пользователя
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Получение токена
  getToken(): string | null {
    return this.storage.get(this.TOKEN_KEY);
  }

  // Обновление токена
  refreshToken(): Observable<{ token: string }> {
    return this.api.post<{ token: string }>('auth/refresh', {}).pipe(
      tap(response => {
        this.setToken(response.token);
      })
    );
  }

  // Установка токена
  private setToken(token: string): void {
    this.storage.set(this.TOKEN_KEY, token);
  }

  // Установка текущего пользователя
  private setCurrentUser(user: User): void {
    this.storage.set(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Очистка данных аутентификации
  private clearAuthData(): void {
    this.storage.remove(this.TOKEN_KEY);
    this.storage.remove(this.USER_KEY);
  }

  // Проверка роли пользователя
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}