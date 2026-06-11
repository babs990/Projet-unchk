import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Notification } from '../../../core/models';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatTooltipModule, MatMenuModule],
  template: `
<div class="shell-wrap" [class.sidebar-open]="sidebarOpen()">
  <!-- Mobile overlay -->
  <div class="mob-overlay" (click)="sidebarOpen.set(false)"></div>

  <!-- ── SIDEBAR ── -->
  <aside class="sidebar">
    <div class="sb-logo">
      <div class="sb-mark">
        <mat-icon>school</mat-icon>
      </div>
      <span class="sb-name">UC<em>HK</em></span>
    </div>

    <div class="sb-user">
      <div class="sb-av" [style.background]="avatarColor(auth.currentUser()?.nom || '')">
        {{ auth.initials() }}
      </div>
      <div class="sb-meta">
        <span class="sb-uname">{{ auth.currentUser()?.prenom }} {{ auth.currentUser()?.nom }}</span>
        <span class="sb-role" [class]="'role-' + auth.role()">{{ roleLabel }}</span>
      </div>
    </div>

    <div class="sb-section-label">Menu</div>
    <nav class="sb-nav">
      <a *ngFor="let item of auth.navItems"
         [routerLink]="item.path"
         routerLinkActive="active"
         class="nav-link"
         (click)="sidebarOpen.set(false)">
        <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
        <span class="nav-label">{{ item.label }}</span>
        <span *ngIf="item.path === '/app/communication' && unreadCount > 0" class="nav-badge">
          {{ unreadCount }}
        </span>
      </a>
    </nav>

    <div class="sb-footer">
      <div class="sb-promo">
        <strong>UCHK Numérique</strong>
        <p>Phase 1 — Données simulées.<br>Phase 2 : API Spring Boot.</p>
        <button class="btn-promo">Documentation API</button>
      </div>
      <button class="btn-logout" (click)="auth.logout()">
        <mat-icon>logout</mat-icon> Déconnexion
      </button>
    </div>
  </aside>

  <!-- ── MAIN ── -->
  <div class="main-area">
    <header class="topbar">
      <button class="hamburger" (click)="sidebarOpen.set(true)">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="tb-search">
        <mat-icon>search</mat-icon>
        <input placeholder="Rechercher dans la plateforme..." [(ngModel)]="searchQuery" [ngModelOptions]="{standalone:true}"/>
        <span class="tb-kbd">⌘F</span>
      </div>

      <div class="tb-right">
        <!-- Notifications -->
        <div class="tb-icon-btn notif-btn" [matMenuTriggerFor]="notifMenu">
          <mat-icon aria-hidden="false" aria-label="Notifications">notifications_none</mat-icon>
          <span *ngIf="unreadCount > 0" class="notif-count">{{ unreadCount }}</span>
        </div>
        <mat-menu #notifMenu="matMenu" class="notif-menu-panel">
          <div class="notif-header" (click)="$event.stopPropagation()">
            <span>Notifications</span>
            <button class="notif-read-all" (click)="markAllRead()">Tout lire</button>
          </div>
          <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.lu"
               (click)="readNotif(n)">
            <div class="notif-dot" [class]="'nd-' + n.type"></div>
            <div>
              <div class="notif-msg">{{ n.message }}</div>
              <div class="notif-time">{{ n.date }}</div>
            </div>
          </div>
          <div *ngIf="!notifications.length" class="notif-empty">Aucune notification</div>
        </mat-menu>

        <!-- User chip -->
        <div class="tb-user-chip">
          <div class="tb-uav" [style.background]="avatarColor(auth.currentUser()?.nom || '')">
            {{ auth.initials() }}
          </div>
          <div class="tb-user-info">
            <span class="tb-uname">{{ auth.currentUser()?.prenom }} {{ auth.currentUser()?.nom }}</span>
            <span class="tb-uemail">{{ auth.currentUser()?.email }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="page-outlet">
      <router-outlet></router-outlet>
    </div>
  </div>
</div>
  `,
  styles: [`
    .shell-wrap { display:flex; height:100vh; overflow:hidden; }

    /* ── Sidebar ── */
    .sidebar { width:var(--sidebar); background:var(--g800); display:flex; flex-direction:column; flex-shrink:0; height:100vh; overflow-y:auto; transition:transform .25s; z-index:200; }
    .sb-logo { padding:20px 22px 16px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; gap:11px; }
    .sb-mark { width:38px; height:38px; background:var(--g500); border-radius:10px; display:flex; align-items:center; justify-content:center; }
    .sb-mark mat-icon { color:white; font-size:22px; }
    .sb-name { font-size:17px; font-weight:800; color:white; letter-spacing:-.3px; }
    .sb-name em { color:var(--g400); font-style:normal; }

    .sb-user { padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; align-items:center; gap:11px; }
    .sb-av { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:white; flex-shrink:0; }
    .sb-meta { min-width:0; }
    .sb-uname { display:block; font-size:13px; font-weight:600; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sb-role { display:inline-block; font-size:10px; font-weight:600; padding:2px 8px; border-radius:20px; margin-top:3px; text-transform:uppercase; letter-spacing:.5px; }
    .role-admin { background:rgba(230,57,70,.25); color:#ff8a93; }
    .role-administratif { background:rgba(244,162,97,.25); color:#f4c27a; }
    .role-enseignant { background:rgba(69,123,157,.25); color:#7fb8d8; }
    .role-tuteur { background:rgba(82,183,136,.25); color:#95d5b2; }
    .role-insertion { background:rgba(168,130,230,.25); color:#c9aaee; }
    .role-etudiant { background:rgba(255,255,255,.12); color:rgba(255,255,255,.7); }

    .sb-section-label { font-size:9px; font-weight:700; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:1.5px; padding:14px 22px 6px; }
    .sb-nav { flex:1; padding:6px 10px; display:flex; flex-direction:column; gap:2px; }
    .nav-link { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:10px; color:rgba(255,255,255,.5); text-decoration:none; font-size:13px; font-weight:500; transition:all .15s; position:relative; }
    .nav-link:hover { background:rgba(255,255,255,.06); color:rgba(255,255,255,.9); }
    .nav-link.active { background:rgba(82,183,136,.18); color:var(--g400); }
    .nav-link.active::before { content:''; position:absolute; left:-10px; top:25%; height:50%; width:3px; background:var(--g400); border-radius:0 3px 3px 0; }
    .nav-icon { font-size:18px !important; width:18px !important; height:18px !important; flex-shrink:0; }
    .nav-label { flex:1; }
    .nav-badge { background:var(--g500); color:white; font-size:10px; font-weight:700; padding:2px 7px; border-radius:20px; }

    .sb-footer { padding:12px 10px; border-top:1px solid rgba(255,255,255,.08); }
    .sb-promo { background:linear-gradient(135deg,rgba(82,183,136,.2),rgba(13,40,24,.4)); border:1px solid rgba(82,183,136,.2); border-radius:var(--r); padding:16px; margin-bottom:10px; }
    .sb-promo strong { display:block; color:white; font-size:13px; margin-bottom:4px; }
    .sb-promo p { color:rgba(255,255,255,.45); font-size:11px; line-height:1.5; margin:0 0 12px; }
    .btn-promo { background:var(--g500); color:white; border:none; border-radius:8px; padding:8px 14px; font-size:12px; font-weight:600; cursor:pointer; width:100%; font-family:inherit; }
    .btn-logout { display:flex; align-items:center; gap:10px; width:100%; padding:10px 12px; background:rgba(230,57,70,.08); border:1px solid rgba(230,57,70,.18); border-radius:10px; color:#ff8a93; font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; transition:all .15s; }
    .btn-logout:hover { background:rgba(230,57,70,.18); }
    .btn-logout mat-icon { font-size:16px !important; width:16px; height:16px; }

    /* ── Main ── */
    .main-area { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

    /* ── Topbar ── */
    .topbar { height:var(--topbar); background:white; border-bottom:1px solid var(--border2); display:flex; align-items:center; gap:14px; padding:0 24px; flex-shrink:0; }
    .hamburger { display:none; background:none; border:1.5px solid var(--border2); border-radius:9px; width:36px; height:36px; align-items:center; justify-content:center; cursor:pointer; color:var(--ink3); }
    .hamburger mat-icon { font-size:20px; }
    .tb-search { display:flex; align-items:center; gap:10px; background:var(--surface2); border:1.5px solid var(--border2); border-radius:10px; padding:9px 14px; max-width:360px; flex:1; }
    .tb-search mat-icon { font-size:16px; color:var(--ink4); }
    .tb-search input { border:none; background:none; outline:none; font-size:13px; font-family:inherit; color:var(--ink); flex:1; }
    .tb-search input::placeholder { color:var(--ink4); }
    .tb-kbd { background:var(--border2); border-radius:5px; padding:2px 7px; font-size:10px; font-family:'JetBrains Mono',monospace; color:var(--ink4); white-space:nowrap; }
    .tb-right { margin-left:auto; display:flex; align-items:center; gap:8px; }
    .tb-icon-btn { width:38px; height:38px; background:var(--surface2); border:1.5px solid var(--border2); border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; }
    .tb-icon-btn:hover { border-color:var(--g400); background:var(--g50); }
    .notif-btn { position:relative; }
    .notif-count { position:absolute; top:-4px; right:-4px; background:#e63946; color:white; font-size:9px; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; }
    .tb-icon-btn mat-icon { font-size:20px; color:var(--ink3); }
    .tb-user-chip { display:flex; align-items:center; gap:10px; padding:6px 12px 6px 8px; background:var(--surface2); border:1.5px solid var(--border2); border-radius:10px; }
    .tb-uav { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:white; }
    .tb-uname { display:block; font-size:13px; font-weight:600; color:var(--ink); }
    .tb-uemail { display:block; font-size:11px; color:var(--ink4); }

    /* ── Notifications ── */
    .notif-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; font-size:13px; font-weight:700; color:var(--ink); border-bottom:1px solid var(--border2); }
    .notif-read-all { background:none; border:none; font-size:11px; font-weight:600; color:var(--g600); cursor:pointer; font-family:inherit; }
    .notif-item { display:flex; gap:10px; padding:11px 16px; cursor:pointer; transition:background .1s; border-bottom:1px solid var(--border2); }
    .notif-item:hover { background:var(--surface2); }
    .notif-item.unread { background:var(--g50); }
    .notif-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
    .nd-info { background:var(--blue); } .nd-success { background:var(--g500); } .nd-warning { background:var(--amber); }
    .notif-msg { font-size:12px; color:var(--ink); line-height:1.5; }
    .notif-time { font-size:10px; color:var(--ink4); margin-top:2px; }
    .notif-empty { padding:24px; text-align:center; color:var(--ink4); font-size:13px; }

    /* ── Page outlet ── */
    .page-outlet { flex:1; overflow-y:auto; padding:28px; }

    /* ── Mobile overlay ── */
    .mob-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:199; }

    @media (max-width:900px) {
      .sidebar { position:fixed; top:0; left:0; height:100%; transform:translateX(-100%); }
      .shell-wrap.sidebar-open .sidebar { transform:none; }
      .shell-wrap.sidebar-open .mob-overlay { display:block; }
      .hamburger { display:flex; }
      .tb-search { display:none; }
      .page-outlet { padding:16px; }
    }
  `]
})
export class ShellComponent implements OnInit {
  sidebarOpen = signal(false);
  searchQuery = '';
  notifications: Notification[] = [];
  unreadCount = 0;

  readonly avatarColors = ['#1b4332','#2d6a4f','#40916c','#457b9d','#7b52c8','#b5450f'];
  avatarColor = (name: string) => this.avatarColors[name.charCodeAt(0) % this.avatarColors.length];

  get roleLabel(): string {
    const map: Record<string, string> = { admin:'Administrateur', administratif:'Administratif', enseignant:'Enseignant', tuteur:'Tuteur', insertion:'Appui Insertion', etudiant:'Étudiant' };
    return map[this.auth.role() ?? ''] ?? '';
  }

  constructor(public auth: AuthService, private data: DataService, private router: Router) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.sidebarOpen.set(false);
      this.loadNotifications();
    });
  }

  loadNotifications(): void {
    const uid = this.auth.currentUser()?.id;
    if (!uid) return;
    this.data.getNotifications(uid).subscribe(n => {
      this.notifications = n;
      this.unreadCount = n.filter(x => !x.lu).length;
    });
  }

  readNotif(n: Notification): void {
    this.data.markNotifRead(n.id);
    n.lu = true;
    this.unreadCount = this.notifications.filter(x => !x.lu).length;
    if (n.lien) this.router.navigate([n.lien]);
  }

  markAllRead(): void {
    const uid = this.auth.currentUser()?.id;
    if (uid) this.data.markAllRead(uid);
    this.notifications.forEach(n => n.lu = true);
    this.unreadCount = 0;
  }
}
