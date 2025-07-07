import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/**
 * AppModule – корневой модуль Angular-приложения.
 * Инициализирует:
 *  • BrowserModule, BrowserAnimationsModule (обязательный минимум);
 *  • CoreModule (singleton-сервисы);
 *  • SharedModule (Material + общие компоненты);
 *  • NgRx Store/Effects (root, пустой initial reducers map);
 *  • StoreDevtools (только в dev). 
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
