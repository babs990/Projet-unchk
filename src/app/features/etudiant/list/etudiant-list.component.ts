import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { Student, Formation } from '../../../core/models';

@Component({
  selector: 'app-etudiant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatTooltipModule, MatSnackBarModule],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Étudiants</h1>
      <p class="page-subtitle">{{ filtered.length }} étudiant{{ filtered.length > 1 ? 's' : '' }} trouvé{{ filtered.length > 1 ? 's' : '' }}</p>
    </div>
    <div class="page-actions" *ngIf="canAdd">
      <button mat-raised-button color="primary" (click)="showModal = true">
        <mat-icon>person_add</mat-icon> Ajouter un étudiant
      </button>
    </div>
  </div>

  <mat-card>
    <!-- Filters row -->
    <div class="filter-row">
      <div class="search-box">
        <mat-icon>search</mat-icon>
        <input placeholder="Rechercher par nom, prénom ou INE..." [(ngModel)]="searchQ" (ngModelChange)="applyFilter()"/>
      </div>
      <select class="filter-select" [(ngModel)]="filterStatut" (ngModelChange)="applyFilter()">
        <option value="">Tous les statuts</option>
        <option value="actif">Actifs</option>
        <option value="diplome">Diplômés</option>
        <option value="abandon">Abandon</option>
      </select>
      <select class="filter-select" [(ngModel)]="filterGenre" (ngModelChange)="applyFilter()">
        <option value="">Tous genres</option>
        <option value="M">Masculin</option>
        <option value="F">Féminin</option>
      </select>
    </div>

    <!-- Table -->
    <div class="tbl-wrap">
      <table mat-table [dataSource]="filtered" class="uchk-table">

        <ng-container matColumnDef="etudiant">
          <th mat-header-cell *matHeaderCellDef>Étudiant</th>
          <td mat-cell *matCellDef="let s">
            <div class="cell-student">
              <div class="stu-av" [style.background]="avc(s.nom)">{{ s.prenom[0] }}{{ s.nom[0] }}</div>
              <div>
                <div class="fw-bold">{{ s.prenom }} {{ s.nom }}</div>
                <div class="text-muted" style="font-size:11px">{{ s.email }}</div>
              </div>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="ine">
          <th mat-header-cell *matHeaderCellDef>INE</th>
          <td mat-cell *matCellDef="let s" class="text-muted mono" style="font-size:11px">{{ s.ine }}</td>
        </ng-container>

        <ng-container matColumnDef="formation">
          <th mat-header-cell *matHeaderCellDef>Formation</th>
          <td mat-cell *matCellDef="let s" class="text-muted" style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ s.formation }}</td>
        </ng-container>

        <ng-container matColumnDef="promo">
          <th mat-header-cell *matHeaderCellDef>Promo</th>
          <td mat-cell *matCellDef="let s" class="text-muted">{{ s.promo }}</td>
        </ng-container>

        <ng-container matColumnDef="genre">
          <th mat-header-cell *matHeaderCellDef>Genre</th>
          <td mat-cell *matCellDef="let s">
            <span class="badge" [class]="s.genre === 'F' ? 'badge-purple' : 'badge-blue'">{{ s.genre === 'F' ? 'Féminin' : 'Masculin' }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="statut">
          <th mat-header-cell *matHeaderCellDef>Statut</th>
          <td mat-cell *matCellDef="let s">
            <span class="badge" [class]="statutBadge(s.statut)">{{ s.statut }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let s">
            <button mat-icon-button color="primary" [routerLink]="['/app/etudiant', s.id]" matTooltip="Voir le profil">
              <mat-icon>visibility</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedCols"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedCols" class="clickable-row"></tr>
      </table>

      <div *ngIf="filtered.length === 0" class="empty-state">
        <mat-icon>person_search</mat-icon>
        <p>Aucun étudiant trouvé</p>
      </div>
    </div>
  </mat-card>
</div>

<!-- ── Modal Nouvel Étudiant ── -->
<div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
  <mat-card class="modal-card" (click)="$event.stopPropagation()">
    <div class="modal-hd">
      <span class="modal-title">Nouvel étudiant</span>
      <button mat-icon-button (click)="showModal = false"><mat-icon>close</mat-icon></button>
    </div>
    <div class="modal-body">
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>INE</mat-label>
          <input matInput [(ngModel)]="form.ine" placeholder="SN2024xxx"/>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Formation</mat-label>
          <mat-select [(ngModel)]="form.formation">
            <mat-option *ngFor="let f of formations" [value]="f.libelle">{{ f.libelle }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Nom</mat-label>
          <input matInput [(ngModel)]="form.nom"/>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Prénom</mat-label>
          <input matInput [(ngModel)]="form.prenom"/>
        </mat-form-field>
      </div>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Date de naissance</mat-label>
          <input matInput type="date" [(ngModel)]="form.dateNaissance"/>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Genre</mat-label>
          <mat-select [(ngModel)]="form.genre">
            <mat-option value="M">Masculin</mat-option>
            <mat-option value="F">Féminin</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="form.email" placeholder="prenom.nom@uchk.sn"/>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Téléphone</mat-label>
          <input matInput [(ngModel)]="form.telephone" placeholder="77 xxx xx xx"/>
        </mat-form-field>
      </div>
    </div>
    <div class="modal-ft">
      <button mat-stroked-button (click)="showModal = false">Annuler</button>
      <button mat-raised-button color="primary" (click)="saveStudent()">Enregistrer</button>
    </div>
  </mat-card>
</div>
  `,
  styles: [`
    .filter-row { display:flex; gap:12px; margin-bottom:18px; flex-wrap:wrap; align-items:center; }
    .search-box { display:flex; align-items:center; gap:10px; background:var(--surface2); border:1.5px solid var(--border2); border-radius:10px; padding:9px 14px; flex:1; min-width:240px; }
    .search-box mat-icon { font-size:16px; color:var(--ink4); }
    .search-box input { border:none; outline:none; font-size:13px; font-family:inherit; color:var(--ink); flex:1; background:transparent; }
    .search-box input::placeholder { color:var(--ink4); }
    .filter-select { border:1.5px solid var(--border2); border-radius:10px; padding:9px 14px; font-size:13px; font-family:inherit; color:var(--ink); outline:none; background:white; cursor:pointer; }
    .filter-select:focus { border-color:var(--g500); }

    .tbl-wrap { overflow-x:auto; }
    .uchk-table { width:100%; }
    .cell-student { display:flex; align-items:center; gap:12px; }
    .stu-av { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:white; flex-shrink:0; }
    .clickable-row:hover { background:var(--g50) !important; cursor:pointer; }

    .empty-state { padding:48px; text-align:center; color:var(--ink4); }
    .empty-state mat-icon { font-size:48px; width:48px; height:48px; display:block; margin:0 auto 12px; color:var(--border); }

    mat-card { padding:20px; }

    /* Modal */
    .modal-backdrop { position:fixed; inset:0; background:rgba(10,15,13,.5); z-index:500; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(3px); }
    .modal-card { width:100%; max-width:560px; padding:0 !important; border-radius:20px !important; animation:modalIn .2s ease; overflow:hidden; max-height:90vh; overflow-y:auto; }
    @keyframes modalIn { from{opacity:0;transform:scale(.96) translateY(10px)} to{opacity:1;transform:none} }
    .modal-hd { display:flex; justify-content:space-between; align-items:center; padding:22px 24px 16px; border-bottom:1px solid var(--border2); position:sticky; top:0; background:white; z-index:1; }
    .modal-title { font-size:17px; font-weight:700; color:var(--ink); }
    .modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:12px; }
    .modal-ft { padding:14px 24px; border-top:1px solid var(--border2); display:flex; justify-content:flex-end; gap:10px; position:sticky; bottom:0; background:white; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .full-w { width:100%; }
    @media (max-width:560px) { .field-row { grid-template-columns:1fr; } }
  `]
})
export class EtudiantListComponent implements OnInit {
  students: Student[] = [];
  filtered: Student[] = [];
  formations: Formation[] = [];
  showModal = false;
  searchQ = '';
  filterStatut = '';
  filterGenre = '';
  displayedCols = ['etudiant','ine','formation','promo','genre','statut','actions'];

  form = { ine:'', nom:'', prenom:'', dateNaissance:'', genre:'M' as 'M'|'F', email:'', telephone:'', formation:'' };

  get canAdd() { return ['admin','administratif'].includes(this.auth.role() ?? ''); }

  readonly avColors = ['#1b4332','#2d6a4f','#40916c','#457b9d','#7b52c8','#b5450f'];
  avc = (n: string) => this.avColors[n.charCodeAt(0) % this.avColors.length];
  statutBadge = (s: string) => s==='actif' ? 'badge badge-green' : s==='diplome' ? 'badge badge-blue' : 'badge badge-amber';

  constructor(private data: DataService, public auth: AuthService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.data.getStudents().subscribe(s => {
      // Si étudiant connecté, ne montrer que son propre dossier
      if (this.auth.role() === 'etudiant') {
        this.students = s.filter(x => x.email === this.auth.currentUser()?.email);
      } else {
        this.students = s;
      }
      this.filtered = [...this.students];
    });
    this.data.getFormations().subscribe(f => {
      this.formations = f;
      this.form.formation = f[0]?.libelle ?? '';
    });
  }

  applyFilter(): void {
    this.filtered = this.students.filter(s => {
      const q = this.searchQ.toLowerCase();
      const matchQ = !q || `${s.nom} ${s.prenom} ${s.ine}`.toLowerCase().includes(q);
      const matchS = !this.filterStatut || s.statut === this.filterStatut;
      const matchG = !this.filterGenre || s.genre === this.filterGenre;
      return matchQ && matchS && matchG;
    });
  }

  saveStudent(): void {
    const s: Omit<Student,'id'> = {
      ine: this.form.ine,
      nom: this.form.nom,
      prenom: this.form.prenom,
      dateNaissance: this.form.dateNaissance,
      genre: this.form.genre,
      email: this.form.email,
      telephone: this.form.telephone,
      formation: this.form.formation,
      formationId: 1,
      promo: 'P' + new Date().getFullYear(),
      anneeDebut: new Date().getFullYear(),
      diplomes: [],
      autresFormations: [],
      statut: 'actif'
    };
    this.data.addStudent(s).subscribe(ns => {
      this.students.unshift(ns);
      this.applyFilter();
      this.showModal = false;
      this.form = { ine:'', nom:'', prenom:'', dateNaissance:'', genre:'M', email:'', telephone:'', formation:this.formations[0]?.libelle ?? '' };
      this.snack.open('Étudiant ajouté ✓', 'Fermer', { duration:3000 });
    });
  }
}
