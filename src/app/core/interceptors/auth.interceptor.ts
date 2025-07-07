// File: pars/src/app/core/interceptors/auth.interceptor.ts
import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authService = this.injector.get(AuthService);
    
    // UPDATED: Use the new method name for clarity
    const accessToken = authService.getAccessToken();
    const apiUrl = 'http://localhost:8000/api';
    
    if (accessToken && request.url.startsWith(apiUrl)) {
      console.log(`[AuthInterceptor] Attaching token to request for ${request.url}`);
      console.log(`[AuthInterceptor] Bearer Token: ${accessToken}`);

      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return next.handle(authReq);
    }
    
    return next.handle(request);
  }
}