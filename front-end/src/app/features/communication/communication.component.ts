import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../core/services/data.service';
import { CompteRendu, Document } from '../../core/models';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatChipsModule, MatTooltipModule, MatSnackBarModule],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Communication</h1>
      <p class="page-subtitle">Comptes rendus, documents et circulaires</p>
    </div>
    <div class="page-actions">
      <button mat-raised-button color="primary" (click)="showModal = true">
        <mat-icon>add</mat-icon> Nouveau compte rendu
      </button>
    </div>
  </div>

  <mat-tab-group animationDuration="200ms" class="uchk-tabs">
    <!-- ── Comptes rendus ── -->
    <mat-tab label="Comptes rendus">
      <div class="tab-content">
        <div class="search-row">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input placeholder="Rechercher un compte rendu..." [(ngModel)]="searchCR"/>
          </div>
        </div>

        <div *ngIf="filteredCR.length === 0" class="empty-state">
          <mat-icon>forum</mat-icon><p>Aucun compte rendu trouvé</p>
        </div>

        <mat-card *ngFor="let cr of filteredCR" class="cr-card">
          <div class="cr-top">
            <span class="badge" [class]="crBadge(cr.typeReunion)">{{ cr.typeReunion }}</span>
            <span class="cr-date mono"><mat-icon>calendar_today</mat-icon>{{ cr.date }}</span>
          </div>
          <p class="cr-resume">{{ cr.resume }}</p>
          <div class="cr-bottom">
            <div class="cr-lieu"><mat-icon>place</mat-icon>{{ cr.lieu }}</div>
            <div class="cr-parts">
              <span *ngFor="let p of cr.participants.slice(0,3)" class="badge badge-gray">{{ p }}</span>
              <span *ngIf="cr.participants.length > 3" class="badge badge-gray">+{{ cr.participants.length - 3 }}</span>
            </div>
          </div>
        </mat-card>
      </div>
    </mat-tab>

    <!-- ── Documents ── -->
    <mat-tab label="Documents & Circulaires">
      <div class="tab-content">
        <div class="search-row">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input placeholder="Rechercher un document..." [(ngModel)]="searchDoc"/>
          </div>
        </div>

        <mat-card>
          <table mat-table [dataSource]="filteredDocs" class="uchk-table">
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let d">
                <span class="badge" [class]="docBadge(d.type)">{{ d.type.replace('_',' ') }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="titre">
              <th mat-header-cell *matHeaderCellDef>Titre</th>
              <td mat-cell *matCellDef="let d" class="fw-bold">{{ d.titre }}</td>
            </ng-container>
            <ng-container matColumnDef="auteur">
              <th mat-header-cell *matHeaderCellDef>Auteur</th>
              <td mat-cell *matCellDef="let d" class="text-muted">{{ d.auteur }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let d" class="text-muted mono">{{ d.date }}</td>
            </ng-container>
            <ng-container matColumnDef="taille">
              <th mat-header-cell *matHeaderCellDef>Taille</th>
              <td mat-cell *matCellDef="let d" class="text-muted">{{ d.taille }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let d">
                <button mat-icon-button color="primary" matTooltip="Télécharger">
                  <mat-icon>download</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="docCols"></tr>
            <tr mat-row *matRowDef="let row; columns: docCols"></tr>
          </table>
        </mat-card>
      </div>
    </mat-tab>
  </mat-tab-group>
</div>

<!-- ── Modal Nouveau CR ── -->
<div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
  <mat-card class="modal-card" (click)="$event.stopPropagation()">
    <div class="modal-hd">
      <span class="modal-title">Nouveau compte rendu</span>
      <button mat-icon-button (click)="showModal = false"><mat-icon>close</mat-icon></button>
    </div>
    <div class="modal-body">
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Type de réunion</mat-label>
          <mat-select [(ngModel)]="form.typeReunion">
            <mat-option value="Conseil d'Université">Conseil d'Université</mat-option>
            <mat-option value="Réunion pédagogique">Réunion pédagogique</mat-option>
            <mat-option value="Séminaire">Séminaire</mat-option>
            <mat-option value="Webinaire">Webinaire</mat-option>
            <mat-option value="Suivi tutorat">Suivi tutorat</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Date</mat-label>
          <input matInput type="date" [(ngModel)]="form.date"/>
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline" class="full-w">
        <mat-label>Lieu</mat-label>
        <input matInput [(ngModel)]="form.lieu" placeholder="Ex: Salle du Conseil"/>
        <mat-icon matPrefix>place</mat-icon>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-w">
        <mat-label>Résumé</mat-label>
        <textarea matInput rows="4" [(ngModel)]="form.resume" placeholder="Résumé des échanges..."></textarea>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-w">
        <mat-label>Participants (séparés par des virgules)</mat-label>
        <input matInput [(ngModel)]="form.participantsStr" placeholder="Pr. Diallo, Dr. Mbaye..."/>
        <mat-icon matPrefix>group</mat-icon>
      </mat-form-field>
    </div>
    <div class="modal-ft">
      <button mat-stroked-button (click)="showModal = false">Annuler</button>
      <button mat-raised-button color="primary" (click)="saveCR()">Enregistrer</button>
    </div>
  </mat-card>
</div>
  `,
  styles: [`
    .tab-content { padding: 20px 0; }
    .search-row { display:flex; gap:10px; margin-bottom:18px; }
    .search-box { display:flex; align-items:center; gap:10px; background:white; border:1.5px solid var(--border2); border-radius:10px; padding:9px 14px; flex:1; max-width:400px; }
    .search-box mat-icon { font-size:16px; color:var(--ink4); }
    .search-box input { border:none; outline:none; font-size:13px; font-family:inherit; color:var(--ink); flex:1; background:transparent; }
    .search-box input::placeholder { color:var(--ink4); }

    .cr-card { margin-bottom:12px; padding:20px; }
    .cr-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px; }
    .cr-date { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--ink4); }
    .cr-date mat-icon { font-size:13px; }
    .cr-resume { font-size:13px; color:var(--ink2); line-height:1.65; margin:0 0 14px; }
    .cr-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
    .cr-lieu { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--ink4); }
    .cr-lieu mat-icon { font-size:13px; }
    .cr-parts { display:flex; gap:5px; flex-wrap:wrap; }

    .uchk-table { width:100%; }
    .empty-state { padding:48px; text-align:center; color:var(--ink4); }
    .empty-state mat-icon { font-size:48px; width:48px; height:48px; display:block; margin:0 auto 12px; color:var(--border); }

    /* Modal */
    .modal-backdrop { position:fixed; inset:0; background:rgba(10,15,13,.5); z-index:500; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(3px); }
    .modal-card { width:100%; max-width:540px; padding:0 !important; border-radius:20px !important; animation:modalIn .2s ease; overflow:hidden; }
    @keyframes modalIn { from{opacity:0;transform:scale(.96) translateY(10px)} to{opacity:1;transform:none} }
    .modal-hd { display:flex; justify-content:space-between; align-items:center; padding:22px 24px 16px; border-bottom:1px solid var(--border2); }
    .modal-title { font-size:17px; font-weight:700; color:var(--ink); }
    .modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:12px; }
    .modal-ft { padding:14px 24px; border-top:1px solid var(--border2); display:flex; justify-content:flex-end; gap:10px; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .full-w { width:100%; }
  `]
})
export class CommunicationComponent implements OnInit {
  comptesRendus: CompteRendu[] = [];
  documents: Document[] = [];
  searchCR = '';
  searchDoc = '';
  showModal = false;
  docCols = ['type','titre','auteur','date','taille','actions'];

  form = { typeReunion:"Réunion pédagogique", date:'', lieu:'', resume:'', participantsStr:'' };

  get filteredCR() {
    const q = this.searchCR.toLowerCase();
    return this.comptesRendus.filter(c =>
      c.typeReunion.toLowerCase().includes(q) || c.resume.toLowerCase().includes(q));
  }
  get filteredDocs() {
    const q = this.searchDoc.toLowerCase();
    return this.documents.filter(d => d.titre.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
  }

  crBadge(t: string) {
    if (t.includes('Conseil')) return 'badge badge-red';
    if (t.includes('pédago')) return 'badge badge-blue';
    if (t.includes('Sémin')) return 'badge badge-green';
    if (t.includes('Web')) return 'badge badge-purple';
    return 'badge badge-amber';
  }
  docBadge(t: string) {
    const m: Record<string,string> = { circulaire:'badge badge-red', note_service:'badge badge-blue', compte_rendu:'badge badge-purple', note_admin:'badge badge-amber' };
    return m[t] ?? 'badge badge-gray';
  }

  constructor(private data: DataService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.data.getComptesRendus().subscribe(c => this.comptesRendus = c);
    this.data.getDocuments().subscribe(d => this.documents = d);
  }

  saveCR(): void {
    const cr: Omit<CompteRendu,'id'> = {
      typeReunion: this.form.typeReunion,
      date: this.form.date || new Date().toLocaleDateString('fr-FR'),
      lieu: this.form.lieu || 'Non précisé',
      resume: this.form.resume || '—',
      participants: this.form.participantsStr.split(',').map(s => s.trim()).filter(Boolean)
    };
    this.data.addCompteRendu(cr).subscribe(newCR => {
      this.comptesRendus.unshift(newCR);
      this.showModal = false;
      this.form = { typeReunion:'Réunion pédagogique', date:'', lieu:'', resume:'', participantsStr:'' };
      this.snack.open('Compte rendu enregistré ✓', 'Fermer', { duration:3000 });
    });
  }
}
