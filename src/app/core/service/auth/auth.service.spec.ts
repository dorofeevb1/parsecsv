import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService, User } from './auth.service';
import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';

describe('AuthService', () => {
  let authService: AuthService;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let storageServiceMock: jasmine.SpyObj<StorageService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockUser: User = { id: 1, email: 'test@test.com', name: 'Test User', role: 'user' };
  const mockLoginResponse = {
    accessToken: 'access_token_123',
    refreshToken: 'refresh_token_456',
    user: mockUser
  };

  beforeEach(() => {
    // Создаем моки для всех зависимостей
    apiServiceMock = jasmine.createSpyObj('ApiService', ['post']);
    storageServiceMock = jasmine.createSpyObj('StorageService', ['get', 'set', 'remove']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user, store tokens and user data, and emit user', (done) => {
      apiServiceMock.post.and.returnValue(of(mockLoginResponse));

      authService.login('test@test.com', 'password').subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(apiServiceMock.post).toHaveBeenCalledWith('auth/login/', { email: 'test@test.com', password: 'password' });
        
        // Проверяем, что токены и пользователь были сохранены
        expect(storageServiceMock.set).toHaveBeenCalledWith('access_token', mockLoginResponse.accessToken);
        expect(storageServiceMock.set).toHaveBeenCalledWith('refresh_token', mockLoginResponse.refreshToken);
        expect(storageServiceMock.set).toHaveBeenCalledWith('current_user', JSON.stringify(mockUser));

        // Проверяем, что BehaviorSubject был обновлен
        authService.currentUser$.subscribe(currentUser => {
          expect(currentUser).toEqual(mockUser);
          done();
        });
      });
    });

    it('should handle login failure', () => {
      const errorResponse = new Error('Invalid credentials');
      apiServiceMock.post.and.returnValue(throwError(() => errorResponse));

      authService.login('wrong@test.com', 'wrong').subscribe({
        next: () => fail('login should have failed'),
        error: (err) => {
          expect(err).toEqual(errorResponse);
          expect(storageServiceMock.set).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('logout', () => {
    it('should clear all auth data, emit null user, and navigate to login', () => {
      authService.logout();

      expect(storageServiceMock.remove).toHaveBeenCalledWith('access_token');
      expect(storageServiceMock.remove).toHaveBeenCalledWith('refresh_token');
      expect(storageServiceMock.remove).toHaveBeenCalledWith('current_user');

      expect(authService.getCurrentUser()).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if access token exists', () => {
      storageServiceMock.get.withArgs('access_token').and.returnValue('some_token');
      expect(authService.isAuthenticated()).toBeTrue();
    });

    it('should return false if access token does not exist', () => {
      storageServiceMock.get.withArgs('access_token').and.returnValue(null);
      expect(authService.isAuthenticated()).toBeFalse();
    });
  });
});