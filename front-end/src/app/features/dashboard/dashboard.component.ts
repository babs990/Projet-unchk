import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Formation, Formateur } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
<div class="page-container">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Tableau de bord</h1>
      <p class="page-subtitle">Bonjour {{ auth.currentUser()?.prenom }} 👋 — {{ today }}</p>
    </div>
    <div class="page-actions" *ngIf="isAdminOrAdm">
      <button mat-stroked-button routerLink="/app/administration" color="primary">
        <mat-icon>add</mat-icon> Nouveau document
      </button>
      <button mat-raised-button routerLink="/app/etudiant" color="primary">
        <mat-icon>add</mat-icon> Ajouter étudiant
      </button>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <mat-card *ngFor="let kpi of kpis" class="kpi-card" [class.hero]="kpi.hero">
      <div class="kpi-label">
        {{ kpi.label }}
        <div class="kpi-link"><mat-icon>north_east</mat-icon></div>
      </div>
      <div class="kpi-val">{{ kpi.value }}</div>
      <span class="kpi-trend"><mat-icon>trending_up</mat-icon>{{ kpi.sub }}</span>
    </mat-card>
  </div>

  <!-- Main grid -->
  <div class="dash-grid">
    <!-- Left col -->
    <div class="dash-left">
      <!-- Bar chart card -->
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Activité pédagogique</mat-card-title>
          <mat-card-subtitle>Cours par jour cette semaine</mat-card-subtitle>
          <span class="badge badge-green" style="margin-left:auto">Semaine active</span>
        </mat-card-header>
        <mat-card-content>
          <div class="bar-chart">
            <div *ngFor="let b of bars" class="bar-col">
              <span *ngIf="b.pct" class="bar-pct">{{ b.pct }}</span>
              <div class="bar" [class]="'bar-'+b.style" [style.height.%]="b.h"></div>
              <span class="bar-day">{{ b.d }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Team card -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Équipe pédagogique</mat-card-title>
          <button mat-stroked-button routerLink="/app/formations" style="margin-left:auto" color="primary">
            <mat-icon>add</mat-icon> Ajouter
          </button>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let f of formateurs" class="list-item">
            <div class="li-av" [style.background]="avatarColor(f.nom)">{{ f.prenom[0] }}{{ f.nom[0] }}</div>
            <div class="li-body">
              <div class="li-name">{{ f.prenom }} {{ f.nom }}</div>
              <div class="li-sub">Formation : {{ f.formations[0] }}</div>
            </div>
            <span class="badge" [class]="typeClass(f.type)">
              {{ f.type === 'enseignant' ? 'Cours' : f.type === 'associe' ? 'In Progress' : 'Tutorat' }}
            </span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Right col -->
    <div class="dash-right">
      <!-- Event card -->
      <mat-card class="event-card">
        <div class="ec-label">Prochain événement</div>
        <div class="ec-title">Réunion pédagogique</div>
        <div class="ec-time"><mat-icon>calendar_today</mat-icon> Aujourd'hui · 10h00–12h00</div>
        <button mat-raised-button routerLink="/app/communication" class="ec-btn">
          <mat-icon>calendar_today</mat-icon> Voir l'agenda
        </button>
      </mat-card>

      <!-- Active formations -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Formations actives</mat-card-title>
          <button mat-button routerLink="/app/formations" color="primary" style="margin-left:auto">Voir tout</button>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let f of activeFormations" class="list-item" routerLink="/app/formations" style="cursor:pointer">
            <div class="fitem-icon"><mat-icon>school</mat-icon></div>
            <div class="li-body">
              <div class="li-name">{{ f.libelle }}</div>
              <div class="li-sub">{{ f.responsable }}</div>
            </div>
            <span class="badge badge-green">Actif</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Student count -->
      <mat-card class="student-count-card">
        <div class="sc-label">Étudiants inscrits</div>
        <div class="sc-val">{{ studentCount }}</div>
        <div class="sc-bar-row">
          <span>Taux de présence</span><span class="sc-pct">82%</span>
        </div>
        <mat-progress-bar mode="determinate" value="82" color="accent"></mat-progress-bar>
        <div class="sc-trend">↑ En hausse ce mois</div>
      </mat-card>
    </div>
  </div>
</div>
  `,
  styles: [`
    .dash-grid { display:grid; grid-template-columns:1fr 300px; gap:20px; }
    .dash-left,.dash-right { display:flex; flex-direction:column; gap:18px; }

    /* KPI */
    .kpi-card { padding:20px; cursor:pointer; transition:transform .2s; }
    .kpi-card:hover { transform:translateY(-2px); }
    .kpi-card.hero { background:var(--g800) !important; }
    .kpi-card.hero .kpi-label,.kpi-card.hero .kpi-val { color:white !important; }
    .kpi-card.hero .kpi-label .kpi-link { border-color:rgba(255,255,255,.3) !important; color:rgba(255,255,255,.7) !important; }
    .kpi-card.hero .kpi-trend { background:rgba(255,255,255,.12) !important; color:rgba(255,255,255,.8) !important; }
    .kpi-label { font-size:11px; font-weight:600; color:var(--ink4); text-transform:uppercase; letter-spacing:.6px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .kpi-link { width:26px; height:26px; border-radius:50%; border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; }
    .kpi-link mat-icon { font-size:13px !important; width:13px; height:13px; }
    .kpi-val { font-size:38px; font-weight:800; color:var(--ink); letter-spacing:-1.5px; line-height:1; margin-bottom:10px; }
    .kpi-trend { display:inline-flex; align-items:center; gap:5px; background:var(--g50); color:var(--g700); font-size:11px; font-weight:600; padding:4px 10px; border-radius:20px; }
    .kpi-trend mat-icon { font-size:12px !important; width:12px; height:12px; }

    /* Bar chart */
    .chart-card mat-card-header { display:flex; align-items:center; margin-bottom:16px; }
    .bar-chart { display:flex; align-items:flex-end; gap:8px; height:120px; padding-bottom:20px; }
    .bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end; }
    .bar { width:100%; border-radius:8px 8px 0 0; transition:all .3s; }
    .bar-solid { background:var(--g800); }
    .bar-mid { background:var(--g400); }
    .bar-stripe { background:var(--surface2); border:2px dashed var(--border); }
    .bar-pct { font-size:9px; font-weight:700; color:var(--g700); }
    .bar-day { font-size:9px; font-weight:600; color:var(--ink4); text-transform:uppercase; }

    /* List items */
    .list-item { display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid var(--border2); }
    .list-item:last-child { border:none; }
    .li-av { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:white; flex-shrink:0; }
    .li-body { flex:1; min-width:0; }
    .li-name { font-size:13px; font-weight:600; color:var(--ink); }
    .li-sub { font-size:11px; color:var(--ink4); margin-top:2px; }
    .fitem-icon { width:34px; height:34px; border-radius:9px; background:var(--g50); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .fitem-icon mat-icon { color:var(--g700); font-size:18px; }

    /* Event card */
    .event-card { background:var(--g800) !important; padding:20px; }
    .ec-label { font-size:10px; font-weight:700; color:rgba(255,255,255,.4); text-transform:uppercase; letter-spacing:.8px; margin-bottom:10px; }
    .ec-title { font-size:19px; font-weight:800; color:white; line-height:1.2; margin-bottom:6px; }
    .ec-time { font-size:12px; color:rgba(255,255,255,.5); margin-bottom:16px; display:flex; align-items:center; gap:6px; }
    .ec-time mat-icon { font-size:14px; }
    .ec-btn { background:var(--g500) !important; color:white !important; width:100%; justify-content:center; }

    /* Student count */
    .student-count-card { background:var(--g50) !important; border-color:var(--g100) !important; padding:20px; }
    .sc-label { font-size:10px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.6px; margin-bottom:6px; }
    .sc-val { font-size:42px; font-weight:800; color:var(--g800); letter-spacing:-2px; line-height:1; margin-bottom:12px; }
    .sc-bar-row { display:flex; justify-content:space-between; font-size:11px; color:var(--ink4); margin-bottom:6px; }
    .sc-pct { font-weight:700; color:var(--g700); }
    .sc-trend { font-size:11px; color:var(--g700); font-weight:600; margin-top:8px; }

    mat-card { padding:20px; }
    mat-card-header { margin-bottom:16px !important; }

    @media (max-width:900px) { .dash-grid { grid-template-columns:1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  kpis: any[] = [];
  formateurs: Formateur[] = [];
  activeFormations: Formation[] = [];
  studentCount = 0;

  bars = [
    {h:30,d:'S',style:'stripe'},{h:58,d:'M',style:'mid'},{h:78,d:'T',style:'solid',pct:'74%'},
    {h:42,d:'W',style:'stripe'},{h:65,d:'T',style:'mid'},{h:35,d:'F',style:'stripe'},{h:22,d:'S',style:'stripe'}
  ];

  readonly avatarColors = ['#1b4332','#2d6a4f','#40916c','#457b9d','#7b52c8','#b5450f'];
  avatarColor = (name: string) => this.avatarColors[name.charCodeAt(0) % this.avatarColors.length];
  typeClass = (t: string) => t === 'enseignant' ? 'badge badge-blue' : t === 'associe' ? 'badge badge-amber' : 'badge badge-green';

  get isAdminOrAdm() { return ['admin','administratif'].includes(this.auth.role() ?? ''); }

  constructor(public auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const role = this.auth.role();
    this.data.getStudents().subscribe(s => {
      this.studentCount = s.filter(x => x.statut === 'actif').length;
      this.buildKpis(role, this.studentCount);
    });
    this.data.getFormateurs().subscribe(f => this.formateurs = f);
    this.data.getFormations().subscribe(f => this.activeFormations = f.filter(x => x.statut === 'actif'));
  }

  buildKpis(role: string | null, actifs: number): void {
    if (role === 'etudiant') {
      this.kpis = [
        { label:'Ma Formation', value:'Master IL', sub:'Promo P8', hero:true },
        { label:'Cours / semaine', value:'3', sub:'Planifiés', hero:false },
        { label:'Diplômes', value:'1', sub:'Licence Informatique', hero:false },
      ];
    } else {
      this.kpis = [
        { label:'Total Étudiants', value: actifs, sub:'Inscrits actifs', hero:true },
        { label:'Formations actives', value: this.activeFormations.length || 3, sub:'Cette année', hero:false },
        { label:'Formateurs', value:5, sub:'Dont 2 tuteurs', hero:false },
        { label:'Partenaires actifs', value:4, sub:'Entreprises', hero:false },
      ];
    }
  }
}
