import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../service/auth/auth.service';

describe('authGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerMock = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should allow activation when user is authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);
    
    // Запускаем гард в инъекционном контексте TestBed
    const canActivate = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    
    expect(canActivate).toBe(true);
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('should deny activation and redirect to /auth/login when user is not authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(false);
    const urlTree = new UrlTree(); // Мок UrlTree
    routerMock.createUrlTree.withArgs(['/auth/login']).and.returnValue(urlTree);

    const canActivate = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    
    expect(canActivate).toBe(urlTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});