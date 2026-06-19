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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataService } from '../../core/services/data.service';
import { Courrier, Formateur, BudgetLine } from '../../core/models';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule,
    MatProgressBarModule, MatSnackBarModule, MatTooltipModule],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Administration</h1>
      <p class="page-subtitle">Gestion documentaire, RH, courriers et budget</p>
    </div>
    <div class="page-actions">
      <button mat-raised-button color="primary" (click)="showCourrierModal = true">
        <mat-icon>add</mat-icon> Nouveau courrier
      </button>
    </div>
  </div>

  <mat-tab-group animationDuration="200ms" class="uchk-tabs">

    <!-- ── COURRIERS ── -->
    <mat-tab label="Courriers">
      <div class="tab-content">
        <div class="courrier-grid">
          <mat-card>
            <div class="card-hd">
              <div class="card-title-row">
                <mat-icon class="card-icon arrive-icon">move_to_inbox</mat-icon>
                <div>
                  <div class="crd-title">Courriers arrivés</div>
                  <div class="crd-sub">{{ arrives.length }} reçus</div>
                </div>
              </div>
            </div>
            <div *ngFor="let c of arrives" class="courrier-item">
              <div class="ci-badge arrive">IN</div>
              <div class="ci-body">
                <div class="ci-objet">{{ c.objet }}</div>
                <div class="ci-meta">{{ c.expediteur }} → {{ c.destinataire }}</div>
              </div>
              <div class="ci-right">
                <div class="mono text-muted" style="font-size:10px">{{ c.date }}</div>
                <span class="badge badge-green"><mat-icon style="font-size:10px;width:10px;height:10px">check</mat-icon> Reçu</span>
              </div>
            </div>
          </mat-card>

          <mat-card>
            <div class="card-hd">
              <div class="card-title-row">
                <mat-icon class="card-icon depart-icon">outbox</mat-icon>
                <div>
                  <div class="crd-title">Courriers envoyés</div>
                  <div class="crd-sub">{{ departs.length }} envoyés</div>
                </div>
              </div>
            </div>
            <div *ngFor="let c of departs" class="courrier-item">
              <div class="ci-badge depart">OUT</div>
              <div class="ci-body">
                <div class="ci-objet">{{ c.objet }}</div>
                <div class="ci-meta">{{ c.expediteur }} → {{ c.destinataire }}</div>
              </div>
              <div class="ci-right">
                <div class="mono text-muted" style="font-size:10px">{{ c.date }}</div>
                <span class="badge badge-blue">Envoyé</span>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </mat-tab>

    <!-- ── RH ── -->
    <mat-tab label="Ressources Humaines">
      <div class="tab-content">
        <mat-card>
          <div class="crd-title" style="margin-bottom:16px">Dossiers du personnel ({{ formateurs.length }})</div>
          <div class="tbl-wrap">
            <table mat-table [dataSource]="formateurs" class="uchk-table">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let f">
                  <div class="cell-av">
                    <div class="mini-av" [style.background]="avc(f.nom)">{{ f.prenom[0] }}{{ f.nom[0] }}</div>
                    <span class="fw-bold">{{ f.prenom }} {{ f.nom }}</span>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let f">
                  <span class="badge" [class]="fBadge(f.type)">{{ typeLabel(f.type) }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="specialite">
                <th mat-header-cell *matHeaderCellDef>Spécialité</th>
                <td mat-cell *matCellDef="let f" class="text-muted">{{ f.specialite }}</td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let f" class="text-muted mono" style="font-size:11px">{{ f.email }}</td>
              </ng-container>
              <ng-container matColumnDef="formations">
                <th mat-header-cell *matHeaderCellDef>Formations</th>
                <td mat-cell *matCellDef="let f" class="text-muted">{{ f.formations.join(', ') }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="rhCols"></tr>
              <tr mat-row *matRowDef="let row; columns: rhCols"></tr>
            </table>
          </div>
        </mat-card>
      </div>
    </mat-tab>

    <!-- ── BUDGET ── -->
    <mat-tab label="Budget 2025">
      <div class="tab-content">
        <div class="budget-grid">
          <mat-card *ngFor="let col of budgetCols">
            <div class="budget-hd">
              <div>
                <div class="crd-title">Budget {{ col.label }} 2025</div>
                <div class="crd-sub">Total : {{ fmt(col.total) }}</div>
              </div>
              <span class="badge" [class]="col.badgeClass">{{ col.exec }}% exécuté</span>
            </div>
            <div *ngFor="let line of col.lines" class="budget-line">
              <div class="bl-header">
                <span class="bl-cat">{{ line.categorie }}</span>
                <span class="bl-mt mono">{{ fmt(line.montant) }}</span>
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="pct(line.montant, col.total)"
                color="primary">
              </mat-progress-bar>
              <div class="bl-pct text-muted">{{ pct(line.montant, col.total) }}% du total</div>
            </div>
          </mat-card>
        </div>
      </div>
    </mat-tab>

  </mat-tab-group>
</div>

<!-- ── Modal Courrier ── -->
<div class="modal-backdrop" *ngIf="showCourrierModal" (click)="showCourrierModal = false">
  <mat-card class="modal-card" (click)="$event.stopPropagation()">
    <div class="modal-hd">
      <span class="modal-title">Nouveau courrier</span>
      <button mat-icon-button (click)="showCourrierModal = false"><mat-icon>close</mat-icon></button>
    </div>
    <div class="modal-body">
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="courrierForm.type">
            <mat-option value="arrive">Arrivé</mat-option>
            <mat-option value="depart">Départ</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Date</mat-label>
          <input matInput type="date" [(ngModel)]="courrierForm.date"/>
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline" class="full-w">
        <mat-label>Objet</mat-label>
        <input matInput [(ngModel)]="courrierForm.objet" placeholder="Objet du courrier..."/>
      </mat-form-field>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Expéditeur</mat-label>
          <input matInput [(ngModel)]="courrierForm.expediteur"/>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Destinataire</mat-label>
          <input matInput [(ngModel)]="courrierForm.destinataire"/>
        </mat-form-field>
      </div>
    </div>
    <div class="modal-ft">
      <button mat-stroked-button (click)="showCourrierModal = false">Annuler</button>
      <button mat-raised-button color="primary" (click)="saveCourrier()">Enregistrer</button>
    </div>
  </mat-card>
</div>
  `,
  styles: [`
    .tab-content { padding:20px 0; }

    /* Courriers */
    .courrier-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .card-hd { margin-bottom:16px; }
    .card-title-row { display:flex; align-items:center; gap:12px; }
    .card-icon { font-size:28px; width:28px; height:28px; }
    .arrive-icon { color:var(--blue); }
    .depart-icon { color:var(--red); }
    .crd-title { font-size:15px; font-weight:700; color:var(--ink); }
    .crd-sub { font-size:12px; color:var(--ink4); margin-top:2px; }
    .courrier-item { display:flex; align-items:flex-start; gap:12px; padding:11px 0; border-bottom:1px solid var(--border2); }
    .courrier-item:last-child { border:none; }
    .ci-badge { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; flex-shrink:0; }
    .ci-badge.arrive { background:#eaf3f9; color:var(--blue); }
    .ci-badge.depart { background:#fee8ea; color:var(--red); }
    .ci-body { flex:1; min-width:0; }
    .ci-objet { font-size:13px; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .ci-meta { font-size:11px; color:var(--ink4); margin-top:2px; }
    .ci-right { text-align:right; flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:4px; }

    /* RH */
    .tbl-wrap { overflow-x:auto; }
    .uchk-table { width:100%; }
    .cell-av { display:flex; align-items:center; gap:10px; }
    .mini-av { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:white; flex-shrink:0; }

    /* Budget */
    .budget-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .budget-hd { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
    .budget-line { margin-bottom:16px; }
    .bl-header { display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; }
    .bl-cat { font-weight:600; color:var(--ink); }
    .bl-mt { font-size:11px; color:var(--g700); font-weight:700; }
    .bl-pct { font-size:10px; margin-top:3px; }

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

    @media (max-width:768px) { .courrier-grid,.budget-grid { grid-template-columns:1fr; } }
  `]
})
export class AdministrationComponent implements OnInit {
  arrives: Courrier[] = [];
  departs: Courrier[] = [];
  formateurs: Formateur[] = [];
  budget: BudgetLine[] = [];
  showCourrierModal = false;
  rhCols = ['nom','type','specialite','email','formations'];

  courrierForm = { type: 'arrive' as 'arrive'|'depart', date:'', objet:'', expediteur:'', destinataire:'' };

  readonly avColors = ['#1b4332','#2d6a4f','#40916c','#457b9d','#7b52c8','#b5450f'];
  avc = (n: string) => this.avColors[n.charCodeAt(0) % this.avColors.length];
  fBadge = (t: string) => t==='enseignant' ? 'badge badge-blue' : t==='associe' ? 'badge badge-amber' : 'badge badge-green';
  typeLabel = (t: string) => t==='enseignant' ? 'Enseignant' : t==='associe' ? 'Ens. Associé' : 'Tuteur';
  fmt = (n: number) => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';
  pct = (n: number, total: number) => total ? Math.round(n / total * 100) : 0;

  get budgetCols() {
    const prev = this.budget.filter(b => b.type === 'previsionnel');
    const real = this.budget.filter(b => b.type === 'realise');
    const tPrev = prev.reduce((s,b) => s+b.montant, 0);
    const tReal = real.reduce((s,b) => s+b.montant, 0);
    return [
      { label:'Prévisionnel', lines:prev, total:tPrev, exec:100, badgeClass:'badge badge-blue' },
      { label:'Réalisé', lines:real, total:tReal, exec: tPrev ? Math.round(tReal/tPrev*100) : 0, badgeClass:'badge badge-green' },
    ];
  }

  constructor(private data: DataService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.data.getCourriers('arrive').subscribe(c => this.arrives = c);
    this.data.getCourriers('depart').subscribe(c => this.departs = c);
    this.data.getFormateurs().subscribe(f => this.formateurs = f);
    this.data.getBudget().subscribe(b => this.budget = b);
  }

  saveCourrier(): void {
    const c: Omit<Courrier,'id'> = {
      type: this.courrierForm.type,
      objet: this.courrierForm.objet,
      expediteur: this.courrierForm.expediteur,
      destinataire: this.courrierForm.destinataire,
      date: this.courrierForm.date || new Date().toLocaleDateString('fr-FR'),
      statut: this.courrierForm.type === 'arrive' ? 'recu' : 'envoye'
    };
    this.data.addCourrier(c).subscribe(nc => {
      if (nc.type === 'arrive') this.arrives.unshift(nc);
      else this.departs.unshift(nc);
      this.showCourrierModal = false;
      this.courrierForm = { type:'arrive', date:'', objet:'', expediteur:'', destinataire:'' };
      this.snack.open('Courrier enregistré ✓', 'Fermer', { duration:3000 });
    });
  }
}
