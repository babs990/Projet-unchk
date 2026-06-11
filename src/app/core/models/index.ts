export type Role = 'admin' | 'administratif' | 'enseignant' | 'tuteur' | 'insertion' | 'etudiant';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
}

export interface Student {
  id: number;
  ine: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  formation: string;
  formationId: number;
  promo: string;
  anneeDebut: number;
  anneeSortie?: number;
  diplomes: string[];
  autresFormations: string[];
  email: string;
  telephone?: string;
  statut: 'actif' | 'diplome' | 'abandon';
  genre: 'M' | 'F';
}

export interface Formation {
  id: number;
  libelle: string;
  type: 'Initiale' | 'Continue' | 'Certification';
  niveau: string;
  dateDebut: string;
  dateFin: string;
  financement: string;
  montantFinancement?: number;
  nbFormesH: number;
  nbFormesF: number;
  responsable: string;
  statut: 'actif' | 'termine';
}

export interface Formateur {
  id: number;
  nom: string;
  prenom: string;
  type: 'enseignant' | 'associe' | 'tuteur';
  specialite: string;
  email: string;
  formations: string[];
}

export interface CreneauEDT {
  id: number;
  formationId: number;
  formation: string;
  formateurId: number;
  formateur: string;
  jour: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi';
  heureDebut: string;
  heureFin: string;
  salle: string;
  matiere: string;
  type: 'cours' | 'td' | 'tp' | 'examen';
}

export interface CompteRendu {
  id: number;
  typeReunion: string;
  date: string;
  participants: string[];
  resume: string;
  lieu: string;
  documentId?: number;
}

export interface Document {
  id: number;
  type: 'circulaire' | 'note_service' | 'compte_rendu' | 'note_admin';
  titre: string;
  date: string;
  auteur: string;
  taille: string;
  visibiliteRoles: Role[];
}

export interface Courrier {
  id: number;
  type: 'arrive' | 'depart';
  objet: string;
  expediteur: string;
  destinataire: string;
  date: string;
  statut: 'recu' | 'envoye' | 'en_attente';
}

export interface Stage {
  id: number;
  studentId: number;
  studentNom: string;
  entreprise: string;
  poste: string;
  dateDebut: string;
  dateFin: string;
  bilan: string;
  note?: number;
  statut: 'en_cours' | 'termine' | 'valide';
}

export interface Partenaire {
  id: number;
  nom: string;
  secteur: string;
  typePartenariat: string;
  contact: string;
  email: string;
  telephone: string;
  depuis: string;
  actif: boolean;
}

export interface InsertionStats {
  annee: number;
  total: number;
  emploiSalarie: number;
  autoEmploi: number;
  enRecherche: number;
  poursuitEtudes: number;
}

export interface BudgetLine {
  id: number;
  annee: number;
  type: 'previsionnel' | 'realise';
  categorie: string;
  montant: number;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: 'info' | 'success' | 'warning';
  lu: boolean;
  date: string;
  lien?: string;
}
