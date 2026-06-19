import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { DataService } from '../../../core/services/data.service';
import { Student, Stage } from '../../../core/models';

@Component({
  selector: 'app-etudiant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatChipsModule],
  template: `
<div class="page-container" *ngIf="student">
  <!-- Hero banner -->
  <div class="profile-hero">
    <div class="ph-av" [style.background]="avc(student.nom)">{{ student.prenom[0] }}{{ student.nom[0] }}</div>
    <div class="ph-info">
      <h1 class="ph-name">{{ student.prenom }} {{ student.nom }}</h1>
      <p class="ph-meta">INE : {{ student.ine }} · {{ student.formation }} · Promo {{ student.promo }}</p>
      <span class="badge" [class]="statutBadge(student.statut)">{{ student.statut }}</span>
    </div>
    <div class="ph-actions">
      <button mat-stroked-button routerLink="/app/etudiant" style="border-color:rgba(255,255,255,.3);color:white">
        <mat-icon>arrow_back</mat-icon> Retour
      </button>
    </div>
  </div>

  <!-- Content grid -->
  <div class="detail-grid">
    <!-- Left col -->
    <div class="detail-left">
      <!-- Personal info -->
      <mat-card>
        <div class="sec-title">Informations personnelles</div>
        <div class="info-table">
          <div class="info-row" *ngFor="let item of personalInfo">
            <span class="info-label">{{ item.label }}</span>
            <span class="info-val">{{ item.value }}</span>
          </div>
        </div>
      </mat-card>

      <!-- Academic info -->
      <mat-card>
        <div class="sec-title">Parcours académique</div>
        <div class="info-table">
          <div class="info-row" *ngFor="let item of academicInfo">
            <span class="info-label">{{ item.label }}</span>
            <span class="info-val">{{ item.value }}</span>
          </div>
        </div>
        <div class="diplomes-section">
          <div class="diplomes-label">Diplômes obtenus</div>
          <div class="diplomes-list">
            <span *ngFor="let d of student.diplomes" class="badge badge-blue">
              <mat-icon style="font-size:11px;width:11px;height:11px">check</mat-icon> {{ d }}
            </span>
            <span *ngIf="!student.diplomes.length" class="text-muted">Aucun diplôme renseigné</span>
          </div>
        </div>
        <div class="diplomes-section" *ngIf="student.autresFormations.length">
          <div class="diplomes-label">Autres formations</div>
          <div class="diplomes-list">
            <span *ngFor="let f of student.autresFormations" class="badge badge-gray">{{ f }}</span>
          </div>
        </div>
      </mat-card>
    </div>

    <!-- Right col -->
    <div class="detail-right">
      <!-- Stage card -->
      <mat-card *ngIf="stage" class="stage-card">
        <div class="sec-title">Dernier stage</div>
        <div class="stage-company">{{ stage.entreprise }}</div>
        <div class="stage-meta">{{ stage.poste }} · {{ stage.dateDebut }} → {{ stage.dateFin }}</div>
        <span class="badge" [class]="stageBadge(stage.statut)">{{ stage.statut.replace('_',' ') }}</span>
        <div *ngIf="stage.note" class="stage-note">
          {{ stage.note }}<span class="stage-note-denom">/20</span>
        </div>
        <p *ngIf="stage.bilan" class="stage-bilan">{{ stage.bilan }}</p>
      </mat-card>

      <!-- Formation progress -->
      <mat-card class="prog-card">
        <div class="sec-title" style="color:rgba(255,255,255,.5)">Formation en cours</div>
        <div class="prog-formation">{{ student.formation }}</div>
        <div class="prog-row">
          <span>Progression</span><span class="prog-pct">65%</span>
        </div>
        <mat-progress-bar mode="determinate" value="65" color="accent"></mat-progress-bar>
        <div class="prog-year">Année {{ student.anneeDebut }} — {{ student.anneeSortie || 'En cours' }}</div>
      </mat-card>

      <!-- Contact card -->
      <mat-card>
        <div class="sec-title">Contact</div>
        <div class="contact-item">
          <mat-icon>email</mat-icon>
          <span>{{ student.email }}</span>
        </div>
        <div class="contact-item" *ngIf="student.telephone">
          <mat-icon>phone</mat-icon>
          <span>{{ student.telephone }}</span>
        </div>
      </mat-card>
    </div>
  </div>
</div>

<!-- Loading / not found -->
<div *ngIf="!student" class="empty-state">
  <mat-icon>person_search</mat-icon>
  <p>Étudiant introuvable</p>
  <button mat-stroked-button routerLink="/app/etudiant">Retour à la liste</button>
</div>
  `,
  styles: [`
    /* Hero */
    .profile-hero { background:var(--g800); border-radius:var(--r-lg); padding:28px 32px; margin-bottom:22px; display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
    .ph-av { width:70px; height:70px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; color:white; flex-shrink:0; border:3px solid rgba(255,255,255,.2); }
    .ph-info { flex:1; min-width:0; }
    .ph-name { font-size:22px; font-weight:800; color:white; margin:0 0 6px; letter-spacing:-.3px; }
    .ph-meta { font-size:13px; color:rgba(255,255,255,.55); margin:0 0 10px; }
    .ph-actions { }

    /* Grid */
    .detail-grid { display:grid; grid-template-columns:1fr 280px; gap:18px; }
    .detail-left,.detail-right { display:flex; flex-direction:column; gap:18px; }

    /* Sections */
    mat-card { padding:20px; }
    .sec-title { font-size:13px; font-weight:700; color:var(--ink); margin-bottom:16px; text-transform:uppercase; letter-spacing:.5px; }

    /* Info table */
    .info-table { display:flex; flex-direction:column; }
    .info-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid var(--border2); font-size:13px; }
    .info-row:last-child { border:none; }
    .info-label { color:var(--ink4); font-weight:500; }
    .info-val { font-weight:600; color:var(--ink); text-align:right; }

    /* Diplomes */
    .diplomes-section { margin-top:16px; padding-top:16px; border-top:1px solid var(--border2); }
    .diplomes-label { font-size:10px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.6px; margin-bottom:8px; }
    .diplomes-list { display:flex; flex-wrap:wrap; gap:6px; }

    /* Stage */
    .stage-card { }
    .stage-company { font-size:15px; font-weight:700; color:var(--ink); margin-bottom:4px; }
    .stage-meta { font-size:11px; color:var(--ink4); margin-bottom:10px; }
    .stage-note { font-size:32px; font-weight:800; color:var(--g700); font-family:'JetBrains Mono',monospace; margin-top:14px; }
    .stage-note-denom { font-size:14px; font-weight:400; color:var(--ink4); }
    .stage-bilan { font-size:12px; color:var(--ink4); line-height:1.6; margin-top:10px; border-top:1px solid var(--border2); padding-top:10px; }

    /* Progress card */
    .prog-card { background:var(--g800) !important; border-color:var(--g800) !important; }
    .prog-formation { font-size:14px; font-weight:700; color:white; margin-bottom:14px; line-height:1.3; }
    .prog-row { display:flex; justify-content:space-between; font-size:11px; color:rgba(255,255,255,.5); margin-bottom:6px; }
    .prog-pct { font-weight:700; color:var(--g400); }
    .prog-year { font-size:11px; color:rgba(255,255,255,.35); margin-top:8px; }

    /* Contact */
    .contact-item { display:flex; align-items:center; gap:10px; font-size:13px; color:var(--ink2); padding:8px 0; border-bottom:1px solid var(--border2); }
    .contact-item:last-child { border:none; }
    .contact-item mat-icon { font-size:18px; color:var(--ink4); }

    /* Empty state */
    .empty-state { padding:80px; text-align:center; }
    .empty-state mat-icon { font-size:64px; width:64px; height:64px; display:block; margin:0 auto 16px; color:var(--border); }
    .empty-state p { color:var(--ink4); font-size:14px; margin-bottom:16px; }

    @media (max-width:768px) { .detail-grid { grid-template-columns:1fr; } }
  `]
})
export class EtudiantDetailComponent implements OnInit {
  student?: Student;
  stage?: Stage;

  readonly avColors = ['#1b4332','#2d6a4f','#40916c','#457b9d','#7b52c8','#b5450f'];
  avc = (n: string) => this.avColors[n.charCodeAt(0) % this.avColors.length];
  statutBadge = (s: string) => s==='actif' ? 'badge badge-green' : s==='diplome' ? 'badge badge-blue' : 'badge badge-amber';
  stageBadge = (s: string) => s==='valide' ? 'badge badge-green' : s==='en_cours' ? 'badge badge-blue' : 'badge badge-amber';

  get personalInfo() {
    if (!this.student) return [];
    return [
      { label:'INE',             value: this.student.ine },
      { label:'Nom',             value: this.student.nom },
      { label:'Prénom',          value: this.student.prenom },
      { label:'Date de naissance', value: this.student.dateNaissance },
      { label:'Genre',           value: this.student.genre === 'F' ? 'Féminin' : 'Masculin' },
      { label:'Email',           value: this.student.email },
      { label:'Téléphone',       value: this.student.telephone || '—' },
    ];
  }

  get academicInfo() {
    if (!this.student) return [];
    return [
      { label:'Formation',      value: this.student.formation },
      { label:'Promotion',      value: this.student.promo },
      { label:'Année de début', value: this.student.anneeDebut.toString() },
      { label:'Année de sortie', value: this.student.anneeSortie?.toString() || 'En cours' },
    ];
  }

  constructor(private route: ActivatedRoute, private data: DataService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.data.getStudent(id).subscribe(s => {
      this.student = s;
      if (s) {
        this.data.getStages().subscribe(stages => {
          this.stage = stages.find(st => st.studentId === s.id);
        });
      }
    });
  }
}
