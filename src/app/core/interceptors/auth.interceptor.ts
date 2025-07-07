import { Injectable, Injector } from '@angular/core'; // 1. Import Injector
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // We cannot inject AuthService directly in the constructor due to a circular dependency.
  // Instead, we inject the Injector.
  constructor(private injector: Injector) {} // 2. Inject the Injector

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 3. Get the AuthService instance manually from the injector *inside* the method.
    // This breaks the circular dependency chain at compile time.
    const authService = this.injector.get(AuthService);
    
    const authToken = authService.getToken();
    const apiUrl = 'http://localhost:8000/api'; // It's better to get this from environment files.
    
    if (authToken && request.url.startsWith(apiUrl)) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next.handle(authReq);
    }
    
    return next.handle(request);
  }
}