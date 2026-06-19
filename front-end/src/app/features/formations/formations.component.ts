import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../core/services/data.service';
import { Formation, Formateur, CreneauEDT } from '../../core/models';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatChipsModule, MatSnackBarModule],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Formations & EDT</h1>
      <p class="page-subtitle">Programmes, emplois du temps et formateurs</p>
    </div>
    <div class="page-actions">
      <button mat-raised-button color="primary" (click)="showModal = true">
        <mat-icon>add</mat-icon> Nouvelle formation
      </button>
    </div>
  </div>

  <mat-tab-group animationDuration="200ms" class="uchk-tabs">

    <!-- ── FORMATIONS LIST ── -->
    <mat-tab label="Formations ({{ formations.length }})">
      <div class="tab-content">
        <mat-card>
          <div class="tbl-wrap">
            <table mat-table [dataSource]="formations" class="uchk-table">
              <ng-container matColumnDef="libelle">
                <th mat-header-cell *matHeaderCellDef>Formation</th>
                <td mat-cell *matCellDef="let f" class="fw-bold">{{ f.libelle }}</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let f">
                  <span class="badge badge-blue">{{ f.type }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="niveau">
                <th mat-header-cell *matHeaderCellDef>Niveau</th>
                <td mat-cell *matCellDef="let f" class="text-muted">{{ f.niveau }}</td>
              </ng-container>
              <ng-container matColumnDef="dates">
                <th mat-header-cell *matHeaderCellDef>Période</th>
                <td mat-cell *matCellDef="let f" class="text-muted mono" style="font-size:11px">{{ f.dateDebut }} → {{ f.dateFin }}</td>
              </ng-container>
              <ng-container matColumnDef="effectif">
                <th mat-header-cell *matHeaderCellDef>Effectif H/F</th>
                <td mat-cell *matCellDef="let f" class="text-muted">{{ f.nbFormesH + f.nbFormesF }} (H:{{ f.nbFormesH }}/F:{{ f.nbFormesF }})</td>
              </ng-container>
              <ng-container matColumnDef="responsable">
                <th mat-header-cell *matHeaderCellDef>Responsable</th>
                <td mat-cell *matCellDef="let f" class="text-muted">{{ f.responsable }}</td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let f">
                  <span class="badge" [class]="f.statut === 'actif' ? 'badge-green' : 'badge-gray'">{{ f.statut }}</span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="formCols"></tr>
              <tr mat-row *matRowDef="let row; columns: formCols"></tr>
            </table>
          </div>
        </mat-card>
      </div>
    </mat-tab>

    <!-- ── EDT GRID ── -->
    <mat-tab label="Emploi du temps">
      <div class="tab-content">
        <mat-card>
          <div class="card-hd-row">
            <div>
              <div class="crd-title">Planning hebdomadaire</div>
              <div class="crd-sub">Semaine en cours — tous les créneaux</div>
            </div>
            <span class="badge badge-green">{{ edt.length }} créneaux</span>
          </div>
          <div class="edt-grid">
            <div *ngFor="let jour of jours" class="edt-col">
              <div class="edt-day">{{ jour }}</div>
              <ng-container *ngFor="let slot of getSlots(jour)">
                <div class="edt-slot" [class]="'slot-' + slot.type">
                  <div class="slot-time">{{ slot.heureDebut }}–{{ slot.heureFin }}</div>
                  <div class="slot-mat">{{ slot.matiere }}</div>
                  <div class="slot-room">{{ slot.salle }} · {{ slot.formateur }}</div>
                  <span class="badge" [class]="slotBadge(slot.type)">{{ slot.type.toUpperCase() }}</span>
                </div>
              </ng-container>
              <div *ngIf="getSlots(jour).length === 0" class="edt-empty">Libre</div>
            </div>
          </div>
        </mat-card>
      </div>
    </mat-tab>

    <!-- ── FORMATEURS ── -->
    <mat-tab label="Formateurs ({{ formateurs.length }})">
      <div class="tab-content">
        <div class="fmt-grid">
          <mat-card *ngFor="let f of formateurs" class="fmt-card">
            <div class="fmt-top">
              <div class="fmt-av" [style.background]="avc(f.nom)">{{ f.prenom[0] }}{{ f.nom[0] }}</div>
              <div>
                <div class="fmt-name">{{ f.prenom }} {{ f.nom }}</div>
                <span class="badge" [class]="fBadge(f.type)">{{ typeLabel(f.type) }}</span>
              </div>
            </div>
            <div class="fmt-info">
              <div><strong>Spécialité :</strong> {{ f.specialite }}</div>
              <div><strong>Email :</strong> {{ f.email }}</div>
            </div>
            <div class="fmt-chips">
              <span *ngFor="let fm of f.formations" class="badge badge-gray">{{ fm }}</span>
            </div>
          </mat-card>
        </div>
      </div>
    </mat-tab>

  </mat-tab-group>
</div>

<!-- ── Modal Nouvelle Formation ── -->
<div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
  <mat-card class="modal-card" (click)="$event.stopPropagation()">
    <div class="modal-hd">
      <span class="modal-title">Nouvelle formation</span>
      <button mat-icon-button (click)="showModal = false"><mat-icon>close</mat-icon></button>
    </div>
    <div class="modal-body">
      <mat-form-field appearance="outline" class="full-w">
        <mat-label>Intitulé</mat-label>
        <input matInput [(ngModel)]="form.libelle" placeholder="Ex: Master Intelligence Artificielle"/>
      </mat-form-field>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="form.type">
            <mat-option value="Initiale">Initiale</mat-option>
            <mat-option value="Continue">Continue</mat-option>
            <mat-option value="Certification">Certification</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Niveau</mat-label>
          <input matInput [(ngModel)]="form.niveau" placeholder="Ex: Master 2"/>
        </mat-form-field>
      </div>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Date début</mat-label>
          <input matInput type="date" [(ngModel)]="form.dateDebut"/>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Date fin</mat-label>
          <input matInput type="date" [(ngModel)]="form.dateFin"/>
        </mat-form-field>
      </div>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Financement</mat-label>
          <mat-select [(ngModel)]="form.financement">
            <mat-option value="Public">Public</mat-option>
            <mat-option value="Privé">Privé</mat-option>
            <mat-option value="Partenariat">Partenariat</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Responsable</mat-label>
          <input matInput [(ngModel)]="form.responsable" placeholder="Pr. Nom Prénom"/>
        </mat-form-field>
      </div>
    </div>
    <div class="modal-ft">
      <button mat-stroked-button (click)="showModal = false">Annuler</button>
      <button mat-raised-button color="primary" (click)="saveFormation()">Créer</button>
    </div>
  </mat-card>
</div>
  `,
  styles: [`
    .tab-content { padding:20px 0; }
    .tbl-wrap { overflow-x:auto; }
    .uchk-table { width:100%; }
    .card-hd-row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
    .crd-title { font-size:15px; font-weight:700; color:var(--ink); }
    .crd-sub { font-size:12px; color:var(--ink4); margin-top:2px; }

    /* EDT */
    .edt-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; }
    .edt-col { }
    .edt-day { font-size:10px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.8px; text-align:center; margin-bottom:10px; }
    .edt-slot { border-radius:0 8px 8px 0; padding:10px 11px; margin-bottom:8px; cursor:pointer; transition:transform .15s; }
    .edt-slot:hover { transform:translateX(2px); }
    .slot-cours  { background:var(--g50);   border-left:3px solid var(--g500); }
    .slot-td     { background:#eaf3f9;      border-left:3px solid var(--blue); }
    .slot-tp     { background:#f2ecfc;      border-left:3px solid #7b52c8; }
    .slot-examen { background:#fee8ea;      border-left:3px solid var(--red); }
    .slot-time { font-size:10px; font-weight:700; margin-bottom:3px; font-family:'JetBrains Mono',monospace; }
    .slot-cours  .slot-time { color:var(--g600); }
    .slot-td     .slot-time { color:var(--blue); }
    .slot-tp     .slot-time { color:#7b52c8; }
    .slot-examen .slot-time { color:var(--red); }
    .slot-mat { font-size:12px; font-weight:700; color:var(--ink); margin-bottom:2px; }
    .slot-room { font-size:10px; color:var(--ink4); margin-bottom:6px; }
    .edt-empty { height:70px; border:2px dashed var(--border2); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:11px; color:var(--ink4); }

    /* Formateurs */
    .fmt-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:16px; }
    .fmt-card { padding:20px; }
    .fmt-top { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
    .fmt-av { width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:white; flex-shrink:0; }
    .fmt-name { font-size:15px; font-weight:700; color:var(--ink); margin-bottom:5px; }
    .fmt-info { font-size:12px; color:var(--ink4); display:flex; flex-direction:column; gap:4px; margin-bottom:12px; }
    .fmt-info strong { color:var(--ink2); }
    .fmt-chips { display:flex; flex-wrap:wrap; gap:5px; }

    /* Modal */
    .modal-backdrop { position:fixed; inset:0; background:rgba(10,15,13,.5); z-index:500; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(3px); }
    .modal-card { width:100%; max-width:560px; padding:0 !important; border-radius:20px !important; animation:modalIn .2s ease; overflow:hidden; max-height:90vh; overflow-y:auto; }
    @keyframes modalIn { from{opacity:0;transform:scale(.96) translateY(10px)} to{opacity:1;transform:none} }
    .modal-hd { display:flex; justify-content:space-between; align-items:center; padding:22px 24px 16px; border-bottom:1px solid var(--border2); }
    .modal-title { font-size:17px; font-weight:700; color:var(--ink); }
    .modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:12px; }
    .modal-ft { padding:14px 24px; border-top:1px solid var(--border2); display:flex; justify-content:flex-end; gap:10px; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .full-w { width:100%; }

    @media (max-width:768px) { .edt-grid { grid-template-columns:1fr 1fr; } }
  `]
})
export class FormationsComponent implements OnInit {
  formations: Formation[] = [];
  formateurs: Formateur[] = [];
  edt: CreneauEDT[] = [];
  showModal = false;
  jours: CreneauEDT['jour'][] = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
  formCols = ['libelle','type','niveau','dates','effectif','responsable','statut'];

  form = { libelle:'', type:'Initiale' as Formation['type'], niveau:'', dateDebut:'', dateFin:'', financement:'Public', responsable:'' };

  readonly avColors = ['#1b4332','#2d6a4f','#40916c','#457b9d','#7b52c8','#b5450f'];
  avc = (n: string) => this.avColors[n.charCodeAt(0) % this.avColors.length];
  fBadge = (t: string) => t==='enseignant' ? 'badge badge-blue' : t==='associe' ? 'badge badge-amber' : 'badge badge-green';
  typeLabel = (t: string) => t==='enseignant' ? 'Enseignant' : t==='associe' ? 'Ens. Associé' : 'Tuteur';
  slotBadge = (t: string) => t==='cours' ? 'badge badge-blue' : t==='td' ? 'badge badge-amber' : t==='tp' ? 'badge badge-purple' : 'badge badge-red';
  getSlots = (jour: string) => this.edt.filter(e => e.jour === jour);

  constructor(private data: DataService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.data.getFormations().subscribe(f => this.formations = f);
    this.data.getFormateurs().subscribe(f => this.formateurs = f);
    this.data.getEDT().subscribe(e => this.edt = e);
  }

  saveFormation(): void {
    const f: Omit<Formation,'id'> = {
      libelle: this.form.libelle,
      type: this.form.type,
      niveau: this.form.niveau,
      dateDebut: this.form.dateDebut,
      dateFin: this.form.dateFin,
      financement: this.form.financement,
      nbFormesH: 0, nbFormesF: 0,
      responsable: this.form.responsable,
      statut: 'actif'
    };
    this.data.addFormation(f).subscribe(nf => {
      this.formations.push(nf);
      this.showModal = false;
      this.form = { libelle:'', type:'Initiale', niveau:'', dateDebut:'', dateFin:'', financement:'Public', responsable:'' };
      this.snack.open('Formation créée ✓', 'Fermer', { duration:3000 });
    });
  }
}
