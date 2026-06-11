import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./shared/components/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',      loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'communication',  loadComponent: () => import('./features/communication/communication.component').then(m => m.CommunicationComponent) },
      { path: 'administration', loadComponent: () => import('./features/administration/administration.component').then(m => m.AdministrationComponent) },
      { path: 'formations',     loadComponent: () => import('./features/formations/formations.component').then(m => m.FormationsComponent) },
      { path: 'insertion',      loadComponent: () => import('./features/insertion/insertion.component').then(m => m.InsertionComponent) },
      { path: 'etudiant',       loadComponent: () => import('./features/etudiant/list/etudiant-list.component').then(m => m.EtudiantListComponent) },
      { path: 'etudiant/:id',   loadComponent: () => import('./features/etudiant/detail/etudiant-detail.component').then(m => m.EtudiantDetailComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
