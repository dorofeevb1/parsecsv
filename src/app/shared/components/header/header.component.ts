import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/service/auth/auth.service';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  public currentUser$: Observable<User | null>;
  
  isMenuOpen = false;
  constructor(private authService: AuthService) {
    // 3. Присваиваем наш Observable из сервиса свойству компонента.
    this.currentUser$ = this.authService.currentUser$;
  }
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    // 3. Теперь мы можем безопасно вызывать метод из нашего сервиса.
    this.authService.logout();

    // Метод logout() в вашем сервисе уже выполняет перенаправление,
    // поэтому дополнительно делать router.navigate здесь не нужно.
    // Это хороший пример разделения ответственности!
    this.closeMenu();
  }
}

