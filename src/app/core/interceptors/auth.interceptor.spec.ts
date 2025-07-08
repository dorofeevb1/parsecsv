import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpRequest } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../service/auth/auth.service';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  const testUrl = 'http://localhost:8000/api/data';

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['getAccessToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should add an Authorization header when a token is available', () => {
    const token = 'my-secret-token';
    authServiceMock.getAccessToken.and.returnValue(token);

    http.get(testUrl).subscribe();

    const httpRequest = httpMock.expectOne(testUrl);
    expect(httpRequest.request.headers.has('Authorization')).toBe(true);
    expect(httpRequest.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not add an Authorization header when no token is available', () => {
    authServiceMock.getAccessToken.and.returnValue(null);

    http.get(testUrl).subscribe();

    const httpRequest = httpMock.expectOne(testUrl);
    expect(httpRequest.request.headers.has('Authorization')).toBe(false);
  });

  it('should not add an Authorization header for non-api requests', () => {
    const token = 'my-secret-token';
    const externalUrl = 'https://google.com';
    authServiceMock.getAccessToken.and.returnValue(token);

    http.get(externalUrl).subscribe();
    
    const httpRequest = httpMock.expectOne(externalUrl);
    expect(httpRequest.request.headers.has('Authorization')).toBe(false);
  });
});