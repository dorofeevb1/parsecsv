import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * AppRoutingModule – центральный роутер приложения.
 * Использует lazy loading для feature-модулей (auth, upload, dashboard, reports).
 * Защищённые роуты (upload, dashboard, reports) применяют `authGuard`.
 * Все неизвестные пути перенаправляются на /dashboard.
 */
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    // This is how you lazy-load a feature module
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuard]
  },
   {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
