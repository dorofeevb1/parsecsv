import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS, // Говорим Angular, что это HTTP Interceptor
      useClass: AuthInterceptor,  // Используем наш класс
      multi: true               // `multi: true` означает, что можно иметь несколько интерцепторов
    }
  ]
})
export class CoreModule { }