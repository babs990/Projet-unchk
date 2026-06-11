import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
<div class="login-wrap">
  <!-- Left panel -->
  <div class="login-left">
    <div class="ll-brand">
      <div class="ll-brand-row">
        <div class="ll-icon"><mat-icon>school</mat-icon></div>
        <span class="ll-name">Université Cheikh Hamidou Kane</span>
      </div>
      <h1 class="ll-headline">Gérez l'université<br><em>autrement.</em></h1>
      <p class="ll-desc">Plateforme de gestion administrative et pédagogique centralisée — accédez à vos modules selon votre profil.</p>
    </div>
    <div class="ll-stats">
      <div class="ll-stat"><span class="ll-val">6</span><span class="ll-lbl">Profils utilisateurs</span></div>
      <div class="ll-stat"><span class="ll-val">5</span><span class="ll-lbl">Modules fonctionnels</span></div>
      <div class="ll-stat"><span class="ll-val">100+</span><span class="ll-lbl">Fonctionnalités</span></div>
    </div>
  </div>

  <!-- Right panel -->
  <div class="login-right">
    <div class="login-card">
      <h2 class="lc-title">Connexion</h2>
      <p class="lc-sub">Entrez vos identifiants pour accéder à votre espace.</p>

      <form class="lc-form" (ngSubmit)="doLogin()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse email</mat-label>
          <input matInput type="email" [(ngModel)]="email" name="email" placeholder="votre@uchk.sn" required/>
          <mat-icon matPrefix>mail_outline</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mot de passe</mat-label>
          <input matInput [type]="showPwd() ? 'text' : 'password'" [(ngModel)]="password" name="password" required/>
          <mat-icon matPrefix>lock_outline</mat-icon>
          <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())">
            <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </mat-form-field>

        <div *ngIf="loginError" class="err-box">
          <mat-icon>error_outline</mat-icon> Email ou mot de passe incorrect.
        </div>

        <button mat-raised-button class="btn-login" type="submit">
          Se connecter
        </button>
      </form>

      <!-- Demo accounts -->
      <div class="demo-section">
        <p class="demo-label">Comptes de démonstration</p>
        <div class="demo-chips">
          <button *ngFor="let d of demoAccounts" class="demo-chip" type="button" (click)="fillDemo(d.email)">
            {{ d.label }}
          </button>
        </div>
        <p class="demo-pwd">Mot de passe : <code>admin123</code></p>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .login-wrap { display:flex; height:100vh; background:white; }
    .login-left { flex:1; background:var(--g800); position:relative; overflow:hidden; display:flex; flex-direction:column; padding:48px; justify-content:space-between; }
    .login-left::before { content:''; position:absolute; top:-150px; right:-150px; width:500px; height:500px; background:radial-gradient(circle,rgba(82,183,136,.2) 0%,transparent 65%); }
    .login-left::after { content:''; position:absolute; bottom:-80px; left:-80px; width:350px; height:350px; background:radial-gradient(circle,rgba(64,145,108,.15) 0%,transparent 65%); }
    .ll-brand { position:relative; z-index:1; }
    .ll-brand-row { display:flex; align-items:center; gap:13px; margin-bottom:52px; }
    .ll-icon { width:50px; height:50px; background:var(--g500); border-radius:14px; display:flex; align-items:center; justify-content:center; }
    .ll-icon mat-icon { color:white; font-size:28px; width:28px; height:28px; }
    .ll-name { font-size:16px; font-weight:700; color:white; line-height:1.3; max-width:180px; }
    .ll-headline { font-size:40px; font-weight:800; color:white; line-height:1.15; letter-spacing:-1.5px; margin:0 0 18px; }
    .ll-headline em { color:var(--g400); font-style:normal; }
    .ll-desc { font-size:14px; color:rgba(255,255,255,.45); line-height:1.7; max-width:380px; margin:0; }
    .ll-stats { display:flex; gap:36px; position:relative; z-index:1; }
    .ll-stat { display:flex; flex-direction:column; }
    .ll-val { font-size:32px; font-weight:800; color:white; letter-spacing:-1px; }
    .ll-lbl { font-size:11px; color:rgba(255,255,255,.35); margin-top:2px; }

    .login-right { width:480px; display:flex; align-items:center; justify-content:center; padding:48px 44px; overflow-y:auto; }
    .login-card { width:100%; }
    .lc-title { font-size:28px; font-weight:800; color:var(--ink); letter-spacing:-.5px; margin:0 0 6px; }
    .lc-sub { font-size:13px; color:var(--ink4); margin:0 0 28px; line-height:1.6; }
    .lc-form { display:flex; flex-direction:column; gap:8px; }
    .full-width { width:100%; }
    .err-box { display:flex; align-items:center; gap:8px; background:#fee8ea; color:var(--red); font-size:12px; font-weight:500; padding:10px 13px; border-radius:8px; }
    .err-box mat-icon { font-size:16px; width:16px; height:16px; }
    .btn-login { width:100%; padding:14px; font-size:15px !important; font-weight:700 !important; background:var(--g800) !important; color:white !important; border-radius:10px !important; margin-top:6px; min-height:50px; display:flex; align-items:center; justify-content:center; gap:10px; }
    .btn-login:hover { background:var(--g700) !important; transform:translateY(-1px); box-shadow:0 6px 20px rgba(13,40,24,.25) !important; }

    .demo-section { margin-top:28px; padding-top:24px; border-top:1px solid var(--border2); }
    .demo-label { font-size:10px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.8px; margin:0 0 10px; }
    .demo-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
    .demo-chip { padding:5px 12px; border:1.5px solid var(--border); border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; background:white; color:var(--ink2); font-family:inherit; transition:all .15s; }
    .demo-chip:hover { border-color:var(--g500); color:var(--g700); background:var(--g50); }
    .demo-pwd { font-size:11px; color:var(--ink4); margin:0; }
    .demo-pwd code { background:var(--surface2); border-radius:4px; padding:1px 6px; font-family:'JetBrains Mono',monospace; color:var(--g600); font-size:11px; }

    @media (max-width:900px) { .login-left { display:none; } .login-right { width:100%; padding:32px 24px; } }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loginError = false;
  showPwd = signal(false);

  demoAccounts = [
    { label:'Admin', email:'admin@uchk.sn' },
    { label:'Administratif', email:'admin2@uchk.sn' },
    { label:'Enseignant', email:'enseignant@uchk.sn' },
    { label:'Tuteur', email:'tuteur@uchk.sn' },
    { label:'Insertion', email:'insertion@uchk.sn' },
    { label:'Étudiant', email:'etudiant@uchk.sn' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  fillDemo(email: string): void {
    this.email = email;
    this.password = 'admin123';
    this.loginError = false;
  }

  doLogin(): void {
    if (!this.email || !this.password) return;
    this.loginError = false;
    const ok = this.auth.login(this.email, this.password);
    if (ok) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.loginError = true;
    }
  }
}
