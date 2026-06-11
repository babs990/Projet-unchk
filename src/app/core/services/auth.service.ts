import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role } from '../models';

const MOCK_USERS: (User & { password: string })[] = [
  { id:1, nom:'Diallo',  prenom:'Amadou',  email:'admin@uchk.sn',        role:'admin',         password:'admin123' },
  { id:2, nom:'Sow',     prenom:'Fatou',   email:'admin2@uchk.sn',       role:'administratif', password:'admin123' },
  { id:3, nom:'Ndiaye',  prenom:'Ibrahima',email:'enseignant@uchk.sn',   role:'enseignant',    password:'admin123' },
  { id:4, nom:'Ba',      prenom:'Aissatou',email:'tuteur@uchk.sn',       role:'tuteur',        password:'admin123' },
  { id:5, nom:'Fall',    prenom:'Omar',    email:'insertion@uchk.sn',    role:'insertion',     password:'admin123' },
  { id:6, nom:'Kane',    prenom:'Mariama', email:'etudiant@uchk.sn',     role:'etudiant',      password:'admin123' },
];

const MODULE_ACCESS: Record<string, Role[]> = {
  '/app/dashboard':       ['admin','administratif','enseignant','tuteur','insertion','etudiant'],
  '/app/communication':   ['admin','administratif','enseignant','tuteur','insertion','etudiant'],
  '/app/administration':  ['admin','administratif'],
  '/app/formations':      ['admin','administratif','enseignant','tuteur','etudiant'],
  '/app/insertion':       ['admin','insertion','tuteur'],
  '/app/etudiant':        ['admin','administratif','tuteur','etudiant'],
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);

  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._user());
  readonly role        = computed(() => this._user()?.role ?? null);
  readonly initials    = computed(() => {
    const u = this._user();
    return u ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase() : '';
  });

  constructor(private router: Router) {
    const stored = localStorage.getItem('uchk_user');
    if (stored) {
      try { this._user.set(JSON.parse(stored)); } catch { localStorage.removeItem('uchk_user'); }
    }
  }

  login(email: string, password: string): boolean {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return false;
    const { password: _, ...user } = found;
    this._user.set(user);
    localStorage.setItem('uchk_user', JSON.stringify(user));
    return true;
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem('uchk_user');
    this.router.navigate(['/login']);
  }

  canAccess(path: string): boolean {
    const roles = MODULE_ACCESS[path];
    if (!roles) return true; // unknown paths allowed
    return roles.includes(this.role() as Role);
  }

  get navItems() {
    return [
      { path: '/app/dashboard',      label: 'Tableau de bord',    icon: 'grid_view' },
      { path: '/app/communication',  label: 'Communication',       icon: 'forum' },
      { path: '/app/administration', label: 'Administration',      icon: 'folder_open' },
      { path: '/app/formations',     label: 'Formations & EDT',    icon: 'school' },
      { path: '/app/insertion',      label: "Appui à l'Insertion", icon: 'work_outline' },
      { path: '/app/etudiant',       label: 'Étudiants',           icon: 'person_outline' },
    ].filter(item => this.canAccess(item.path));
  }
}
