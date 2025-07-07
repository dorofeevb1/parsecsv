import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Define your API's base URL here for the check
  private readonly apiUrl = 'http://localhost:8000/api'; // Example API URL

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();
    
    // Check if the token exists AND the request is going to your API
    if (authToken && request.url.startsWith(this.apiUrl)) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next.handle(authReq);
    }
    
    // For all other cases (no token, or request to a different domain), pass the request as-is
    return next.handle(request);
  }
}