import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../core/services/data.service';
import { Stage, Partenaire, InsertionStats } from '../../core/models';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-insertion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatSnackBarModule],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h1 class="page-title">Appui à l'Insertion</h1>
      <p class="page-subtitle">Statistiques, stages et partenariats</p>
    </div>
    <div class="page-actions">
      <button mat-raised-button color="primary" (click)="showModal = true">
        <mat-icon>add</mat-icon> Nouveau partenaire
      </button>
    </div>
  </div>

  <mat-tab-group animationDuration="200ms" class="uchk-tabs" (selectedTabChange)="onTabChange($event)">

    <!-- ── STATS ── -->
    <mat-tab label="Statistiques">
      <div class="tab-content">
        <!-- KPIs -->
        <div class="kpi-grid" *ngIf="lastStat">
          <mat-card class="kpi-card hero">
            <div class="kpi-label">Diplômés {{ lastStat.annee }}<span class="kpi-link"><mat-icon>north_east</mat-icon></span></div>
            <div class="kpi-val">{{ lastStat.total }}</div>
            <span class="kpi-trend"><mat-icon>trending_up</mat-icon>Total sortants</span>
          </mat-card>
          <mat-card class="kpi-card">
            <div class="kpi-label">Taux d'insertion<span class="kpi-link"><mat-icon>north_east</mat-icon></span></div>
            <div class="kpi-val">{{ tauxInsertion }}%</div>
            <span class="kpi-trend"><mat-icon>trending_up</mat-icon>Emploi ou auto-emploi</span>
          </mat-card>
          <mat-card class="kpi-card">
            <div class="kpi-label">Emploi salarié<span class="kpi-link"><mat-icon>north_east</mat-icon></span></div>
            <div class="kpi-val">{{ lastStat.emploiSalarie }}</div>
            <span class="kpi-trend"><mat-icon>trending_up</mat-icon>{{ pctSalarie }}% des sortants</span>
          </mat-card>
          <mat-card class="kpi-card">
            <div class="kpi-label">Auto-emploi<span class="kpi-link"><mat-icon>north_east</mat-icon></span></div>
            <div class="kpi-val">{{ lastStat.autoEmploi }}</div>
            <span class="kpi-trend"><mat-icon>trending_up</mat-icon>{{ pctAuto }}% des sortants</span>
          </mat-card>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          <mat-card class="chart-card">
            <div class="crd-title" style="margin-bottom:16px">Évolution de l'insertion (2021–2024)</div>
            <canvas #barChart></canvas>
          </mat-card>
          <mat-card>
            <div class="crd-title" style="margin-bottom:16px">Répartition {{ lastStat?.annee }}</div>
            <div class="donut-wrap">
              <canvas #donutChart width="160" height="160" style="max-width:160px"></canvas>
            </div>
            <div class="chart-legend" *ngIf="lastStat">
              <div *ngFor="let item of legendItems" class="legend-row">
                <div class="legend-dot" [style.background]="item.color"></div>
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-val mono">{{ item.value }}</span>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </mat-tab>

    <!-- ── STAGES ── -->
    <mat-tab label="Stages ({{ stages.length }})">
      <div class="tab-content">
        <mat-card>
          <div class="tbl-wrap">
            <table mat-table [dataSource]="stages" class="uchk-table">
              <ng-container matColumnDef="etudiant">
                <th mat-header-cell *matHeaderCellDef>Étudiant</th>
                <td mat-cell *matCellDef="let s" class="fw-bold">{{ s.studentNom }}</td>
              </ng-container>
              <ng-container matColumnDef="entreprise">
                <th mat-header-cell *matHeaderCellDef>Entreprise</th>
                <td mat-cell *matCellDef="let s" class="text-muted">{{ s.entreprise }}</td>
              </ng-container>
              <ng-container matColumnDef="poste">
                <th mat-header-cell *matHeaderCellDef>Poste</th>
                <td mat-cell *matCellDef="let s" class="text-muted">{{ s.poste }}</td>
              </ng-container>
              <ng-container matColumnDef="periode">
                <th mat-header-cell *matHeaderCellDef>Période</th>
                <td mat-cell *matCellDef="let s" class="text-muted mono" style="font-size:11px">{{ s.dateDebut }} → {{ s.dateFin }}</td>
              </ng-container>
              <ng-container matColumnDef="note">
                <th mat-header-cell *matHeaderCellDef>Note</th>
                <td mat-cell *matCellDef="let s">
                  <strong *ngIf="s.note" class="text-success mono">{{ s.note }}/20</strong>
                  <span *ngIf="!s.note" class="text-muted">—</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let s">
                  <span class="badge" [class]="stageBadge(s.statut)">{{ s.statut.replace('_',' ') }}</span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="stageCols"></tr>
              <tr mat-row *matRowDef="let row; columns: stageCols"></tr>
            </table>
          </div>
        </mat-card>
      </div>
    </mat-tab>

    <!-- ── PARTENAIRES ── -->
    <mat-tab label="Partenaires ({{ partenaires.length }})">
      <div class="tab-content">
        <div class="parts-grid">
          <mat-card *ngFor="let p of partenaires" class="part-card" [class.inactive]="!p.actif">
            <div class="part-top">
              <div class="part-av">{{ p.nom[0] }}</div>
              <span class="badge" [class]="p.actif ? 'badge-green' : 'badge-gray'">{{ p.actif ? 'Actif' : 'Inactif' }}</span>
            </div>
            <div class="part-name">{{ p.nom }}</div>
            <div class="part-meta">{{ p.secteur }} · Depuis {{ p.depuis }}</div>
            <span class="badge badge-blue">{{ p.typePartenariat }}</span>
            <div class="part-email">{{ p.email }}</div>
          </mat-card>
        </div>
      </div>
    </mat-tab>

  </mat-tab-group>
</div>

<!-- ── Modal Partenaire ── -->
<div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
  <mat-card class="modal-card" (click)="$event.stopPropagation()">
    <div class="modal-hd">
      <span class="modal-title">Nouveau partenaire</span>
      <button mat-icon-button (click)="showModal = false"><mat-icon>close</mat-icon></button>
    </div>
    <div class="modal-body">
      <mat-form-field appearance="outline" class="full-w">
        <mat-label>Nom de l'organisme</mat-label>
        <input matInput [(ngModel)]="form.nom" placeholder="Ex: Orange Sénégal"/>
      </mat-form-field>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Secteur</mat-label>
          <input matInput [(ngModel)]="form.secteur" placeholder="Ex: Télécoms"/>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Type de partenariat</mat-label>
          <mat-select [(ngModel)]="form.typePartenariat">
            <mat-option value="Stage">Stage</mat-option>
            <mat-option value="Emploi">Emploi</mat-option>
            <mat-option value="Stage & Emploi">Stage & Emploi</mat-option>
            <mat-option value="Recherche & Stage">Recherche & Stage</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="field-row">
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="form.email"/>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Téléphone</mat-label>
          <input matInput [(ngModel)]="form.telephone" placeholder="33 xxx xx xx"/>
        </mat-form-field>
      </div>
    </div>
    <div class="modal-ft">
      <button mat-stroked-button (click)="showModal = false">Annuler</button>
      <button mat-raised-button color="primary" (click)="savePartenaire()">Enregistrer</button>
    </div>
  </mat-card>
</div>
  `,
  styles: [`
    .tab-content { padding:20px 0; }
    .tbl-wrap { overflow-x:auto; }
    .uchk-table { width:100%; }
    .crd-title { font-size:15px; font-weight:700; color:var(--ink); }

    /* KPI */
    .kpi-card { padding:20px; cursor:pointer; }
    .kpi-card.hero { background:var(--g800) !important; }
    .kpi-card.hero .kpi-label,.kpi-card.hero .kpi-val { color:white !important; }
    .kpi-card.hero .kpi-link { border-color:rgba(255,255,255,.3) !important; color:rgba(255,255,255,.7) !important; }
    .kpi-card.hero .kpi-trend { background:rgba(255,255,255,.12) !important; color:rgba(255,255,255,.8) !important; }
    .kpi-label { font-size:11px; font-weight:600; color:var(--ink4); text-transform:uppercase; letter-spacing:.6px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .kpi-link { width:26px; height:26px; border-radius:50%; border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; }
    .kpi-link mat-icon { font-size:13px !important; width:13px; height:13px; }
    .kpi-val { font-size:38px; font-weight:800; color:var(--ink); letter-spacing:-1.5px; line-height:1; margin-bottom:10px; }
    .kpi-trend { display:inline-flex; align-items:center; gap:5px; background:var(--g50); color:var(--g700); font-size:11px; font-weight:600; padding:4px 10px; border-radius:20px; }
    .kpi-trend mat-icon { font-size:12px !important; width:12px; height:12px; }

    /* Charts */
    .charts-grid { display:grid; grid-template-columns:1fr 300px; gap:20px; }
    .chart-card { }
    .donut-wrap { display:flex; justify-content:center; padding:10px 0; }
    .chart-legend { display:flex; flex-direction:column; gap:8px; margin-top:16px; }
    .legend-row { display:flex; align-items:center; gap:8px; font-size:12px; }
    .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .legend-label { flex:1; color:var(--ink4); }
    .legend-val { font-weight:700; color:var(--ink); }

    /* Partenaires */
    .parts-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
    .part-card { padding:20px; transition:opacity .2s; }
    .part-card.inactive { opacity:.55; }
    .part-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
    .part-av { width:46px; height:46px; border-radius:12px; background:var(--g50); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:var(--g700); }
    .part-name { font-size:15px; font-weight:700; color:var(--ink); margin-bottom:4px; }
    .part-meta { font-size:11px; color:var(--ink4); margin-bottom:10px; }
    .part-email { font-size:11px; color:var(--ink4); margin-top:12px; padding-top:12px; border-top:1px solid var(--border2); }

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

    @media (max-width:768px) { .charts-grid { grid-template-columns:1fr; } }
  `]
})
export class InsertionComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;

  stats: InsertionStats[] = [];
  stages: Stage[] = [];
  partenaires: Partenaire[] = [];
  showModal = false;
  stageCols = ['etudiant','entreprise','poste','periode','note','statut'];
  private barChartInstance?: Chart;
  private donutChartInstance?: Chart;

  form = { nom:'', secteur:'', typePartenariat:'Stage', email:'', telephone:'', contact:'' };

  get lastStat() { return this.stats[this.stats.length - 1]; }
  get tauxInsertion() { return this.lastStat ? Math.round((this.lastStat.emploiSalarie + this.lastStat.autoEmploi) / this.lastStat.total * 100) : 0; }
  get pctSalarie() { return this.lastStat ? Math.round(this.lastStat.emploiSalarie / this.lastStat.total * 100) : 0; }
  get pctAuto() { return this.lastStat ? Math.round(this.lastStat.autoEmploi / this.lastStat.total * 100) : 0; }
  get legendItems() {
    const s = this.lastStat;
    return s ? [
      { label:'Emploi salarié', value:s.emploiSalarie, color:'#1b4332' },
      { label:'Auto-emploi',    value:s.autoEmploi,    color:'#52b788' },
      { label:'En recherche',   value:s.enRecherche,   color:'#f4a261' },
      { label:'Poursuite études', value:s.poursuitEtudes, color:'#457b9d' },
    ] : [];
  }

  stageBadge = (s: string) => s==='valide' ? 'badge badge-green' : s==='en_cours' ? 'badge badge-blue' : 'badge badge-amber';

  constructor(private data: DataService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.data.getInsertionStats().subscribe(s => { this.stats = s; setTimeout(() => this.buildCharts(), 100); });
    this.data.getStages().subscribe(s => this.stages = s);
    this.data.getPartenaires().subscribe(p => this.partenaires = p);
  }

  ngAfterViewInit(): void {}

  onTabChange(e: any): void {
    if (e.index === 0) setTimeout(() => this.buildCharts(), 150);
  }

  buildCharts(): void {
    if (!this.barChartRef || !this.stats.length) return;
    // Bar chart
    if (this.barChartInstance) this.barChartInstance.destroy();
    this.barChartInstance = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.stats.map(s => s.annee),
        datasets: [
          { label:'Emploi salarié', data:this.stats.map(s=>s.emploiSalarie), backgroundColor:'#1b4332', borderRadius:6 },
          { label:'Auto-emploi',    data:this.stats.map(s=>s.autoEmploi),    backgroundColor:'#52b788', borderRadius:6 },
          { label:'En recherche',   data:this.stats.map(s=>s.enRecherche),   backgroundColor:'#d8f3dc', borderRadius:6 },
        ]
      },
      options: {
        responsive:true,
        plugins:{ legend:{ position:'bottom', labels:{ font:{ family:"'Plus Jakarta Sans',sans-serif", size:11 }, padding:12 }}},
        scales:{ x:{ grid:{ display:false }}, y:{ grid:{ color:'#eef5f1' }}}
      }
    });
    // Donut chart
    if (!this.donutChartRef) return;
    if (this.donutChartInstance) this.donutChartInstance.destroy();
    const s = this.lastStat;
    this.donutChartInstance = new Chart(this.donutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [{ data:[s.emploiSalarie, s.autoEmploi, s.enRecherche, s.poursuitEtudes],
          backgroundColor:['#1b4332','#52b788','#f4a261','#457b9d'], borderWidth:0, hoverOffset:4 }]
      },
      options: { responsive:false, cutout:'72%', plugins:{ legend:{ display:false }}}
    });
  }

  savePartenaire(): void {
    const p: Omit<Partenaire,'id'> = {
      nom: this.form.nom, secteur: this.form.secteur, typePartenariat: this.form.typePartenariat,
      contact: '', email: this.form.email, telephone: this.form.telephone,
      depuis: new Date().getFullYear().toString(), actif: true
    };
    this.data.addPartenaire(p).subscribe(np => {
      this.partenaires.push(np);
      this.showModal = false;
      this.form = { nom:'', secteur:'', typePartenariat:'Stage', email:'', telephone:'', contact:'' };
      this.snack.open('Partenaire ajouté ✓', 'Fermer', { duration:3000 });
    });
  }
}
