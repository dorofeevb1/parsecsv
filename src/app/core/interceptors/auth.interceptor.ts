import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authService = this.injector.get(AuthService);
    
    const authToken = authService.getToken();
    const apiUrl = 'http://localhost:8000/api';
    
    if (authToken && request.url.startsWith(apiUrl)) {
      // --- ИЗМЕНЕНИЕ: ДОБАВЛЕН ЛОГ ДЛЯ ОТЛАДКИ ---
      // Выводим токен в консоль перед отправкой запроса.
      console.log(`[AuthInterceptor] Attaching token to request for ${request.url}`);
      console.log(`[AuthInterceptor] Bearer Token: ${authToken}`);
      // ---------------------------------------------

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