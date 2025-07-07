// File: pars/src/app/core/service/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';
import { HttpErrorResponse } from '@angular/common/http';

// UPDATED: Matches the backend response from the screenshot
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
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

  // UPDATED: More specific keys for each token
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getAccessToken();
    const user = this.storage.get(this.USER_KEY);

    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  // UPDATED: Handles the new response structure
  login(email: string, password: string): Observable<User> {
    return this.api.post<LoginResponse>('auth/login/', { email, password }).pipe(
      tap(response => {
        this.setAccessToken(response.accessToken);
        this.setRefreshToken(response.refreshToken); // Also store the refresh token
        this.setCurrentUser(response.user);
      }),
      map(response => response.user)
    );
  }

  logout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // UPDATED: Assumes register returns the same response as login
  register(userData: { email: string; password: string; }): Observable<User> {
    if (!userData?.email || !userData?.password) {
      return throwError(() => new Error('All registration fields are required'));
    }
    if (userData.password.length < 6) {
      return throwError(() => new Error('Password must be at least 6 characters long'));
    }

    return this.api.post<LoginResponse>('auth/register/', {
      email: userData.email.toLowerCase().trim(),
      password: userData.password
    }).pipe(
      tap({
        next: (response) => {
          if (!response?.accessToken || !response?.user) {
            throw new Error('Invalid server response during registration');
          }
          this.setAccessToken(response.accessToken);
          this.setRefreshToken(response.refreshToken);
          this.setCurrentUser(response.user);
          console.log(`User ${response.user.email} registered successfully`);
        },
        error: (err) => {
          console.error('Registration error:', err);
          throw err;
        }
      }),
      map(response => response.user),
      catchError(error => {
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

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // UPDATED: Renamed from getToken for clarity
  getAccessToken(): string | null {
    return this.storage.get(this.ACCESS_TOKEN_KEY);
  }
  
  private setAccessToken(token: string): void {
    this.storage.set(this.ACCESS_TOKEN_KEY, token);
  }
  
  private setRefreshToken(token: string): void {
    this.storage.set(this.REFRESH_TOKEN_KEY, token);
  }

  private setCurrentUser(user: User): void {
    this.storage.set(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // UPDATED: Clears all authentication-related data
  private clearAuthData(): void {
    this.storage.remove(this.ACCESS_TOKEN_KEY);
    this.storage.remove(this.REFRESH_TOKEN_KEY);
    this.storage.remove(this.USER_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}