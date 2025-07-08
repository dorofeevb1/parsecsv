import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/core/service/auth/auth.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        SharedModule, // Импортируем для Angular Material компонентов
        NoopAnimationsModule // Отключаем анимации для тестов
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when created', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should be valid when email and password are provided', () => {
    component.form.controls['email'].setValue('test@example.com');
    component.form.controls['password'].setValue('password123');
    expect(component.form.valid).toBeTrue();
  });

  it('should call authService.login on valid form submission', () => {
    authServiceMock.login.and.returnValue(of({} as any)); // Мокируем успешный ответ
    component.form.setValue({ email: 'test@example.com', password: 'password123' });

    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should navigate to dashboard on successful login', () => {
    authServiceMock.login.and.returnValue(of({} as any));
    component.form.setValue({ email: 'test@example.com', password: 'password123' });

    component.onSubmit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/statistic']);
  });

  it('should display an error message on failed login', () => {
    const errorMsg = 'Invalid credentials';
    authServiceMock.login.and.returnValue(throwError(() => new Error(errorMsg)));
    component.form.setValue({ email: 'test@example.com', password: 'password123' });
    
    component.onSubmit();

    expect(component.loginError).toBe(errorMsg);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should not call authService.login on invalid form submission', () => {
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });
});