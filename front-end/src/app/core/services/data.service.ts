import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Student, Formation, Formateur, CreneauEDT, CompteRendu, Document,
  Courrier, Stage, Partenaire, InsertionStats, BudgetLine, Notification
} from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {

  /* ── STUDENTS ─────────────────────────────────────── */
  private students: Student[] = [
    { id:1,ine:'SN2021001',nom:'Diallo',prenom:'Aminata',dateNaissance:'15/03/2000',formation:'Master Ingénierie Logicielle',formationId:1,promo:'P8',anneeDebut:2021,diplomes:['Licence Informatique'],autresFormations:[],email:'aminata.diallo@uchk.sn',telephone:'77 123 45 67',statut:'actif',genre:'F'},
    { id:2,ine:'SN2021002',nom:'Sow',prenom:'Moussa',dateNaissance:'22/07/1999',formation:'Master Ingénierie Logicielle',formationId:1,promo:'P8',anneeDebut:2021,diplomes:['Licence Math-Info'],autresFormations:['Cert. Python'],email:'moussa.sow@uchk.sn',telephone:'78 234 56 78',statut:'actif',genre:'M'},
    { id:3,ine:'SN2020001',nom:'Ndiaye',prenom:'Fatou',dateNaissance:'05/11/1998',formation:'Master Réseaux & Télécoms',formationId:2,promo:'P7',anneeDebut:2020,anneeSortie:2022,diplomes:['Licence Télécoms','Master Réseaux'],autresFormations:[],email:'fatou.ndiaye@uchk.sn',telephone:'76 345 67 89',statut:'diplome',genre:'F'},
    { id:4,ine:'SN2022001',nom:'Ba',prenom:'Ibrahima',dateNaissance:'30/01/2001',formation:'Master Data Science',formationId:3,promo:'P3',anneeDebut:2022,diplomes:['Licence Statistiques'],autresFormations:[],email:'ibrahima.ba@uchk.sn',telephone:'77 456 78 90',statut:'actif',genre:'M'},
    { id:5,ine:'SN2021003',nom:'Fall',prenom:'Rokhaya',dateNaissance:'18/09/2000',formation:'Master Ingénierie Logicielle',formationId:1,promo:'P8',anneeDebut:2021,diplomes:['BTS Informatique'],autresFormations:['Cert. Java'],email:'rokhaya.fall@uchk.sn',telephone:'70 567 89 01',statut:'actif',genre:'F'},
    { id:6,ine:'SN2019001',nom:'Kane',prenom:'Abdoulaye',dateNaissance:'12/04/1997',formation:'Master Génie Logiciel',formationId:4,promo:'P5',anneeDebut:2019,anneeSortie:2021,diplomes:['Licence Info','Master GL'],autresFormations:[],email:'abdoulaye.kane@uchk.sn',statut:'diplome',genre:'M'},
    { id:7,ine:'SN2022002',nom:'Mbaye',prenom:'Ndèye',dateNaissance:'07/06/2001',formation:'Master Data Science',formationId:3,promo:'P3',anneeDebut:2022,diplomes:['Licence Maths'],autresFormations:[],email:'ndeye.mbaye@uchk.sn',telephone:'78 789 01 23',statut:'actif',genre:'F'},
    { id:8,ine:'SN2021004',nom:'Diop',prenom:'Cheikh',dateNaissance:'25/12/2000',formation:'Master Ingénierie Logicielle',formationId:1,promo:'P8',anneeDebut:2021,diplomes:['Licence Informatique'],autresFormations:[],email:'cheikh.diop@uchk.sn',telephone:'76 890 12 34',statut:'actif',genre:'M'},
  ];

  /* ── FORMATIONS ───────────────────────────────────── */
  private formations: Formation[] = [
    { id:1,libelle:'Master Ingénierie Logicielle',type:'Initiale',niveau:'Master 2',dateDebut:'01/10/2021',dateFin:'31/07/2023',financement:'Public',nbFormesH:28,nbFormesF:12,responsable:'Pr. Diallo Amadou',statut:'actif'},
    { id:2,libelle:'Master Réseaux & Télécoms',type:'Initiale',niveau:'Master 2',dateDebut:'01/10/2020',dateFin:'31/07/2022',financement:'Public',nbFormesH:20,nbFormesF:8,responsable:'Pr. Seck Oumar',statut:'termine'},
    { id:3,libelle:'Master Data Science',type:'Continue',niveau:'Master 1',dateDebut:'01/10/2022',dateFin:'31/07/2024',financement:'Privé',montantFinancement:850000,nbFormesH:15,nbFormesF:10,responsable:'Dr. Mbaye Fatou',statut:'actif'},
    { id:4,libelle:'Master Génie Logiciel',type:'Initiale',niveau:'Master 2',dateDebut:'01/10/2019',dateFin:'31/07/2021',financement:'Public',nbFormesH:22,nbFormesF:9,responsable:'Pr. Fall Ibrahima',statut:'termine'},
    { id:5,libelle:'Certif. Cloud Computing',type:'Certification',niveau:'Bac+3',dateDebut:'15/01/2023',dateFin:'30/06/2023',financement:'Partenariat',montantFinancement:350000,nbFormesH:18,nbFormesF:7,responsable:'Dr. Sy Mariama',statut:'termine'},
  ];

  /* ── FORMATEURS ───────────────────────────────────── */
  private formateurs: Formateur[] = [
    { id:1,nom:'Ndiaye',prenom:'Ibrahima',type:'enseignant',specialite:'Génie Logiciel',email:'i.ndiaye@uchk.sn',formations:['Master IL','Master GL']},
    { id:2,nom:'Sarr',prenom:'Cheikh',type:'enseignant',specialite:'Réseaux',email:'c.sarr@uchk.sn',formations:['Master Réseaux']},
    { id:3,nom:'Diop',prenom:'Ndèye',type:'associe',specialite:'Data Science',email:'n.diop@uchk.sn',formations:['Master DS']},
    { id:4,nom:'Ba',prenom:'Aissatou',type:'tuteur',specialite:'Dev Web',email:'a.ba@uchk.sn',formations:['Master IL']},
    { id:5,nom:'Mbodj',prenom:'Saliou',type:'tuteur',specialite:'DevOps',email:'s.mbodj@uchk.sn',formations:['Master DS']},
  ];

  /* ── EDT ──────────────────────────────────────────── */
  private edt: CreneauEDT[] = [
    { id:1,formationId:1,formation:'Master IL P8',formateurId:1,formateur:'Ndiaye Ibrahima',jour:'Lundi',heureDebut:'08:00',heureFin:'12:00',salle:'Amphi A',matiere:'Architecture Logicielle',type:'cours'},
    { id:2,formationId:1,formation:'Master IL P8',formateurId:4,formateur:'Ba Aissatou',jour:'Mardi',heureDebut:'14:00',heureFin:'16:00',salle:'Salle 201',matiere:'Développement Web',type:'td'},
    { id:3,formationId:1,formation:'Master IL P8',formateurId:1,formateur:'Ndiaye Ibrahima',jour:'Mercredi',heureDebut:'09:00',heureFin:'13:00',salle:'Labo Info 1',matiere:'Projet Tuteuré',type:'tp'},
    { id:4,formationId:3,formation:'Master DS P3',formateurId:3,formateur:'Diop Ndèye',jour:'Jeudi',heureDebut:'08:00',heureFin:'12:00',salle:'Amphi B',matiere:'Machine Learning',type:'cours'},
    { id:5,formationId:3,formation:'Master DS P3',formateurId:5,formateur:'Mbodj Saliou',jour:'Vendredi',heureDebut:'14:00',heureFin:'18:00',salle:'Labo Data',matiere:'Big Data',type:'tp'},
    { id:6,formationId:1,formation:'Master IL P8',formateurId:1,formateur:'Ndiaye Ibrahima',jour:'Vendredi',heureDebut:'09:00',heureFin:'11:00',salle:'Salle 105',matiere:'Examen Architecture',type:'examen'},
  ];

  /* ── COMPTES RENDUS ───────────────────────────────── */
  private comptesRendus: CompteRendu[] = [
    { id:1,typeReunion:"Conseil d'Université",date:'20/11/2025',participants:['Pr. Diallo','Pr. Seck','Dr. Mbaye','Adm. Sow'],resume:"Discussion du budget 2026 et planification des nouvelles formations. Approbation du règlement intérieur révisé.",lieu:'Salle du Conseil'},
    { id:2,typeReunion:'Réunion pédagogique',date:'10/11/2025',participants:['Pr. Ndiaye','Dr. Diop','M. Sarr'],resume:'Préparation des examens de fin de semestre. Définition des critères de notation.',lieu:'Salle de réunion 1'},
    { id:3,typeReunion:'Séminaire',date:'28/10/2025',participants:['Tous les enseignants','Étudiants Master 2'],resume:"Séminaire sur l'IA et ses applications en Afrique subsaharienne.",lieu:'Amphi Principal'},
    { id:4,typeReunion:'Suivi tutorat',date:'05/11/2025',participants:['Ba Aissatou','Mbodj Saliou','Étudiants P8'],resume:'Bilan mi-parcours des projets tuteurés.',lieu:'Salle 201'},
    { id:5,typeReunion:'Webinaire',date:'15/11/2025',participants:['Équipe pédagogique','Partenaires'],resume:'Présentation des nouvelles tendances en génie logiciel.',lieu:'En ligne (Zoom)'},
  ];

  /* ── DOCUMENTS ────────────────────────────────────── */
  private documents: Document[] = [
    { id:1,type:'circulaire',titre:'Circulaire rentrée 2025-2026',date:'01/09/2025',auteur:'Administration',taille:'245 Ko',visibiliteRoles:['admin','administratif','enseignant','tuteur','insertion','etudiant']},
    { id:2,type:'note_service',titre:'Note — Calendrier des soutenances',date:'15/11/2025',auteur:'Direction Pédagogique',taille:'128 Ko',visibiliteRoles:['admin','administratif','enseignant','tuteur']},
    { id:3,type:'compte_rendu',titre:"CR Conseil d'Université — Nov 2025",date:'20/11/2025',auteur:'Secrétariat',taille:'512 Ko',visibiliteRoles:['admin','administratif']},
    { id:4,type:'note_admin',titre:'Règlement intérieur révisé',date:'05/10/2025',auteur:'Administration',taille:'380 Ko',visibiliteRoles:['admin','administratif','enseignant']},
    { id:5,type:'circulaire',titre:"Procédures d'inscription 2026",date:'10/09/2025',auteur:'Scolarité',taille:'190 Ko',visibiliteRoles:['admin','administratif','etudiant']},
  ];

  /* ── COURRIERS ────────────────────────────────────── */
  private courriers: Courrier[] = [
    { id:1,type:'arrive',objet:'Demande de partenariat — Sonatel Academy',expediteur:'Sonatel Academy',destinataire:'Direction UCHK',date:'18/11/2025',statut:'recu'},
    { id:2,type:'depart',objet:'Invitation Conférence IA Dakar 2026',expediteur:'UCHK',destinataire:"Ministère de l'Enseignement Supérieur",date:'15/11/2025',statut:'envoye'},
    { id:3,type:'arrive',objet:"Résultats d'accréditation — CAMES",expediteur:'CAMES',destinataire:'Présidence UCHK',date:'12/11/2025',statut:'recu'},
    { id:4,type:'depart',objet:'Rapport annuel 2024-2025',expediteur:'UCHK',destinataire:'Ministère',date:'01/11/2025',statut:'envoye'},
    { id:5,type:'arrive',objet:'Demande de stage — Expresso Sénégal',expediteur:'Expresso Sénégal',destinataire:'Scolarité',date:'22/11/2025',statut:'recu'},
  ];

  /* ── STAGES ───────────────────────────────────────── */
  private stages: Stage[] = [
    { id:1,studentId:1,studentNom:'Diallo Aminata',entreprise:'Orange Sénégal',poste:'Dev Backend',dateDebut:'01/07/2025',dateFin:'30/09/2025',bilan:'Excellent stage. API REST développée.',note:17,statut:'valide'},
    { id:2,studentId:2,studentNom:'Sow Moussa',entreprise:'Sonatel',poste:'Dev Full Stack',dateDebut:'15/07/2025',dateFin:'15/10/2025',bilan:"En cours — bon avancement.",statut:'en_cours'},
    { id:3,studentId:4,studentNom:'Ba Ibrahima',entreprise:'Wave',poste:'Data Analyst',dateDebut:'01/06/2025',dateFin:'31/08/2025',bilan:'Dashboards analytiques développés.',note:16,statut:'valide'},
    { id:4,studentId:5,studentNom:'Fall Rokhaya',entreprise:'Expresso',poste:'Dev Mobile',dateDebut:'01/07/2025',dateFin:'30/09/2025',bilan:'Stage validé avec mention.',note:18,statut:'valide'},
  ];

  /* ── PARTENAIRES ──────────────────────────────────── */
  private partenaires: Partenaire[] = [
    { id:1,nom:'Orange Sénégal',secteur:'Télécoms',typePartenariat:'Stage & Emploi',contact:'DRH',email:'rh@orange.sn',telephone:'33 889 00 00',depuis:'2020',actif:true},
    { id:2,nom:'Sonatel',secteur:'Télécoms',typePartenariat:'Recherche & Stage',contact:'DRH',email:'partenariat@sonatel.sn',telephone:'33 839 00 00',depuis:'2018',actif:true},
    { id:3,nom:'Wave',secteur:'Fintech',typePartenariat:'Emploi',contact:'Talent Acq.',email:'jobs@wave.com',telephone:'77 000 00 00',depuis:'2022',actif:true},
    { id:4,nom:'Expresso',secteur:'Télécoms',typePartenariat:'Stage',contact:'RH',email:'stages@expresso.sn',telephone:'76 555 00 00',depuis:'2021',actif:true},
    { id:5,nom:'Banque Atlantique',secteur:'Finance',typePartenariat:'Emploi & Bourse',contact:'Direction',email:'dg@banqueatlantique.sn',telephone:'33 822 00 00',depuis:'2019',actif:false},
  ];

  /* ── STATS INSERTION ──────────────────────────────── */
  private insertionStats: InsertionStats[] = [
    { annee:2021,total:45,emploiSalarie:22,autoEmploi:8,enRecherche:12,poursuitEtudes:3},
    { annee:2022,total:52,emploiSalarie:28,autoEmploi:11,enRecherche:10,poursuitEtudes:3},
    { annee:2023,total:60,emploiSalarie:35,autoEmploi:14,enRecherche:8,poursuitEtudes:3},
    { annee:2024,total:68,emploiSalarie:40,autoEmploi:18,enRecherche:7,poursuitEtudes:3},
  ];

  /* ── BUDGET ───────────────────────────────────────── */
  private budget: BudgetLine[] = [
    { id:1,annee:2025,type:'previsionnel',categorie:'Ressources Humaines',montant:45000000},
    { id:2,annee:2025,type:'previsionnel',categorie:'Équipements',montant:12000000},
    { id:3,annee:2025,type:'previsionnel',categorie:'Fonctionnement',montant:8000000},
    { id:4,annee:2025,type:'realise',categorie:'Ressources Humaines',montant:43500000},
    { id:5,annee:2025,type:'realise',categorie:'Équipements',montant:9800000},
    { id:6,annee:2025,type:'realise',categorie:'Fonctionnement',montant:7200000},
  ];

  /* ── NOTIFICATIONS ────────────────────────────────── */
  private notifications: Notification[] = [
    { id:1,userId:6,message:'Nouveau CR : Réunion pédagogique du 10/11',type:'info',lu:false,date:'10/11/2025',lien:'/app/communication'},
    { id:2,userId:6,message:'Emploi du temps mis à jour',type:'success',lu:false,date:'08/11/2025',lien:'/app/formations'},
    { id:3,userId:6,message:'Circulaire rentrée 2025-2026 disponible',type:'info',lu:true,date:'01/09/2025',lien:'/app/communication'},
    { id:4,userId:3,message:'Réunion préparation examens — 15/11 à 10h',type:'warning',lu:false,date:'08/11/2025'},
    { id:5,userId:3,message:'Nouveau document partagé : Calendrier soutenances',type:'info',lu:true,date:'06/11/2025',lien:'/app/communication'},
    { id:6,userId:1,message:'5 nouveaux courriers à traiter',type:'warning',lu:false,date:'22/11/2025',lien:'/app/administration'},
    { id:7,userId:1,message:'Rapport annuel 2025 envoyé avec succès',type:'success',lu:true,date:'01/11/2025'},
  ];

  // ── API Methods (à remplacer par HttpClient en Phase 2) ──
  getStudents(): Observable<Student[]> { return of(this.students).pipe(delay(300)); }
  getStudent(id: number): Observable<Student | undefined> { return of(this.students.find(s => s.id === id)).pipe(delay(200)); }
  addStudent(s: Omit<Student,'id'>): Observable<Student> { const ns = {...s, id: Date.now()}; this.students.push(ns); return of(ns).pipe(delay(300)); }

  getFormations(): Observable<Formation[]> { return of(this.formations).pipe(delay(300)); }
  addFormation(f: Omit<Formation,'id'>): Observable<Formation> { const nf = {...f, id: Date.now()}; this.formations.push(nf); return of(nf).pipe(delay(300)); }

  getFormateurs(): Observable<Formateur[]> { return of(this.formateurs).pipe(delay(300)); }

  getEDT(formationId?: number): Observable<CreneauEDT[]> {
    const data = formationId ? this.edt.filter(e => e.formationId === formationId) : this.edt;
    return of(data).pipe(delay(300));
  }

  getComptesRendus(): Observable<CompteRendu[]> { return of(this.comptesRendus).pipe(delay(300)); }
  addCompteRendu(cr: Omit<CompteRendu,'id'>): Observable<CompteRendu> { const ncr = {...cr, id: Date.now()}; this.comptesRendus.unshift(ncr); return of(ncr).pipe(delay(300)); }

  getDocuments(): Observable<Document[]> { return of(this.documents).pipe(delay(300)); }

  getCourriers(type?: 'arrive' | 'depart'): Observable<Courrier[]> {
    const data = type ? this.courriers.filter(c => c.type === type) : this.courriers;
    return of(data).pipe(delay(300));
  }
  addCourrier(c: Omit<Courrier,'id'>): Observable<Courrier> { const nc = {...c, id: Date.now()}; this.courriers.unshift(nc); return of(nc).pipe(delay(300)); }

  getStages(): Observable<Stage[]> { return of(this.stages).pipe(delay(300)); }
  getPartenaires(): Observable<Partenaire[]> { return of(this.partenaires).pipe(delay(300)); }
  addPartenaire(p: Omit<Partenaire,'id'>): Observable<Partenaire> { const np = {...p, id: Date.now()}; this.partenaires.push(np); return of(np).pipe(delay(300)); }

  getInsertionStats(): Observable<InsertionStats[]> { return of(this.insertionStats).pipe(delay(300)); }
  getBudget(): Observable<BudgetLine[]> { return of(this.budget).pipe(delay(300)); }

  getNotifications(userId: number): Observable<Notification[]> {
    return of(this.notifications.filter(n => n.userId === userId)).pipe(delay(200));
  }
  markNotifRead(id: number): void { const n = this.notifications.find(x => x.id === id); if (n) n.lu = true; }
  markAllRead(userId: number): void { this.notifications.filter(n => n.userId === userId).forEach(n => n.lu = true); }
}
