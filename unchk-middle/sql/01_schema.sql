-- ═══════════════════════════════════════════════════════════════════════════
-- SCHÉMA DE BASE DE DONNÉES — PLATEFORME UNCHK
-- PostgreSQL 15
-- 17 tables | 18 relations FK | 12 index
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. AUTHENTIFICATION & UTILISATEURS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE utilisateurs (
  id                  BIGSERIAL PRIMARY KEY,
  ine                 VARCHAR(20)  UNIQUE,
  matricule           VARCHAR(20)  UNIQUE,
  nom                 VARCHAR(100) NOT NULL,
  prenom              VARCHAR(100) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe        VARCHAR(255) NOT NULL,
  role                VARCHAR(30)  NOT NULL
    CHECK (role IN ('ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE',
                     'RESPONSABLE_FORMATION','TUTEUR','ETUDIANT','APPUI_INSERTION')),
  telephone           VARCHAR(20),
  avatar_url          TEXT,
  actif               BOOLEAN DEFAULT true,
  date_creation       TIMESTAMP DEFAULT NOW(),
  derniere_connexion  TIMESTAMP
);

CREATE TABLE sessions_token (
  id              BIGSERIAL PRIMARY KEY,
  utilisateur_id  BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  token           TEXT NOT NULL UNIQUE,
  expire_le       TIMESTAMP NOT NULL,
  cree_le         TIMESTAMP DEFAULT NOW(),
  revoque         BOOLEAN DEFAULT false
);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. FORMATIONS (créée avant etudiants pour la FK)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE formations (
  id              BIGSERIAL PRIMARY KEY,
  intitule        VARCHAR(200) NOT NULL,
  type            VARCHAR(30)  NOT NULL
    CHECK (type IN ('licence','master','certification','formation-continue')),
  niveau          VARCHAR(20)  NOT NULL,
  date_debut      DATE NOT NULL,
  date_fin        DATE NOT NULL,
  responsable_id  BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
  nb_formes_homme INTEGER DEFAULT 0,
  nb_formes_femme INTEGER DEFAULT 0,
  financement     VARCHAR(20) NOT NULL
    CHECK (financement IN ('public','prive','bourse')),
  montant         DECIMAL(15,2),
  statut          VARCHAR(20) DEFAULT 'active'
    CHECK (statut IN ('active','terminee','a-venir'))
);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. ÉTUDIANTS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE etudiants (
  id              BIGSERIAL PRIMARY KEY,
  utilisateur_id  BIGINT NOT NULL UNIQUE REFERENCES utilisateurs(id) ON DELETE CASCADE,
  date_naissance  DATE NOT NULL,
  lieu_naissance  VARCHAR(100) NOT NULL,
  sexe            CHAR(1) NOT NULL CHECK (sexe IN ('M','F')),
  adresse         TEXT,
  formation_id    BIGINT REFERENCES formations(id) ON DELETE SET NULL,
  promo           VARCHAR(10) NOT NULL,
  annee_debut     VARCHAR(4)  NOT NULL,
  annee_sortie    VARCHAR(4),
  statut          VARCHAR(20) NOT NULL DEFAULT 'actif'
    CHECK (statut IN ('actif','diplome','abandonne','suspendu')),
  cree_le         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notes (
  id             BIGSERIAL PRIMARY KEY,
  etudiant_id    BIGINT NOT NULL REFERENCES etudiants(id) ON DELETE CASCADE,
  matiere        VARCHAR(150) NOT NULL,
  note           DECIMAL(4,2) NOT NULL CHECK (note >= 0 AND note <= 20),
  credit         SMALLINT NOT NULL CHECK (credit > 0),
  semestre       VARCHAR(10) NOT NULL,
  enseignant_id  BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
  saisie_le      TIMESTAMP DEFAULT NOW(),
  UNIQUE (etudiant_id, matiere, semestre)
);

CREATE TABLE diplomes (
  id             BIGSERIAL PRIMARY KEY,
  etudiant_id    BIGINT NOT NULL REFERENCES etudiants(id) ON DELETE CASCADE,
  intitule       VARCHAR(200) NOT NULL,
  annee          VARCHAR(4) NOT NULL,
  etablissement  VARCHAR(200)
);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. EMPLOI DU TEMPS & RÉUNIONS
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE creneaux (
  id            BIGSERIAL PRIMARY KEY,
  formation_id  BIGINT NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  formateur_id  BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE SET NULL,
  jour          VARCHAR(10) NOT NULL
    CHECK (jour IN ('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')),
  heure_debut   TIME NOT NULL,
  heure_fin     TIME NOT NULL,
  matiere       VARCHAR(150) NOT NULL,
  salle         VARCHAR(50),
  type_cours    VARCHAR(10) NOT NULL
    CHECK (type_cours IN ('cours','td','tp','examen')),
  CHECK (heure_fin > heure_debut)
);

CREATE TABLE reunions (
  id            BIGSERIAL PRIMARY KEY,
  titre         VARCHAR(200) NOT NULL,
  type          VARCHAR(30) NOT NULL
    CHECK (type IN ('tutorat','preparation-cours','preparation-evaluation')),
  date_reunion  DATE NOT NULL,
  heure         TIME NOT NULL,
  participants  TEXT,
  notes         TEXT,
  statut        VARCHAR(15) DEFAULT 'planifiee'
    CHECK (statut IN ('planifiee','terminee','annulee')),
  cree_par      BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. COMMUNICATION
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE comptes_rendus (
  id            BIGSERIAL PRIMARY KEY,
  titre         VARCHAR(250) NOT NULL,
  type          VARCHAR(20) NOT NULL
    CHECK (type IN ('Conseil','Réunion','Séminaire','Webinaire','Rencontre')),
  date_cr       DATE NOT NULL,
  participants  TEXT,
  resume        TEXT,
  fichier_url   TEXT,
  auteur_id     BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE SET NULL,
  cree_le       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE circulaires (
  id            BIGSERIAL PRIMARY KEY,
  numero        VARCHAR(20) NOT NULL UNIQUE,
  titre         VARCHAR(250) NOT NULL,
  contenu       TEXT,
  source        VARCHAR(100) NOT NULL,
  fichier_url   TEXT,
  publie_par    BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
  publie_le     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
  id              BIGSERIAL PRIMARY KEY,
  destinataire_id BIGINT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  message         TEXT NOT NULL,
  type            VARCHAR(30) NOT NULL,
  lien_ref        TEXT,
  lu              BOOLEAN DEFAULT false,
  cree_le         TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. ADMINISTRATION
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE courriers (
  id             BIGSERIAL PRIMARY KEY,
  reference      VARCHAR(30) NOT NULL UNIQUE,
  objet          VARCHAR(300) NOT NULL,
  expediteur     VARCHAR(200) NOT NULL,
  type           VARCHAR(10) NOT NULL CHECK (type IN ('arrivee','depart')),
  statut         VARCHAR(15) DEFAULT 'en-attente'
    CHECK (statut IN ('traite','en-attente','archive')),
  description    TEXT,
  fichier_url    TEXT,
  date_courrier  DATE NOT NULL,
  traite_par     BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL
);

CREATE TABLE notes_service (
  id            BIGSERIAL PRIMARY KEY,
  reference     VARCHAR(30) NOT NULL UNIQUE,
  objet         VARCHAR(300) NOT NULL,
  destinataire  VARCHAR(200) NOT NULL,
  type          VARCHAR(20) NOT NULL
    CHECK (type IN ('interne','externe','administrative')),
  contenu       TEXT,
  auteur_id     BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
  cree_le       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budget_lignes (
  id          BIGSERIAL PRIMARY KEY,
  exercice    VARCHAR(4) NOT NULL,
  intitule    VARCHAR(200) NOT NULL,
  categorie   VARCHAR(50) NOT NULL,
  prevu       DECIMAL(15,2) NOT NULL CHECK (prevu >= 0),
  realise     DECIMAL(15,2) DEFAULT 0 CHECK (realise >= 0),
  cree_le     TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. INSERTION PROFESSIONNELLE
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE partenaires (
  id                BIGSERIAL PRIMARY KEY,
  nom               VARCHAR(200) NOT NULL,
  secteur           VARCHAR(100) NOT NULL,
  type              VARCHAR(20) NOT NULL
    CHECK (type IN ('entreprise','ong','institution','startup')),
  contact           VARCHAR(150) NOT NULL,
  email             VARCHAR(150) NOT NULL,
  telephone         VARCHAR(20),
  adresse           TEXT,
  offres_actives    INTEGER DEFAULT 0,
  date_partenariat  DATE NOT NULL,
  cree_par          BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL
);

CREATE TABLE suivi_insertion (
  id              BIGSERIAL PRIMARY KEY,
  etudiant_id     BIGINT NOT NULL UNIQUE REFERENCES etudiants(id) ON DELETE CASCADE,
  statut          VARCHAR(30) NOT NULL
    CHECK (statut IN ('emploi-salarie','auto-emploi','stage','poursuite-etudes','en-recherche')),
  entreprise      VARCHAR(200),
  poste           VARCHAR(200),
  date_insertion  DATE,
  bilan_stage     TEXT,
  partenaire_id   BIGINT REFERENCES partenaires(id) ON DELETE SET NULL,
  mis_a_jour      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE statistiques_insertion (
  id                BIGSERIAL PRIMARY KEY,
  annee_promo       VARCHAR(4) NOT NULL UNIQUE,
  total_diplomes    INTEGER NOT NULL DEFAULT 0,
  emploi_salarie    INTEGER DEFAULT 0,
  auto_emploi       INTEGER DEFAULT 0,
  poursuite_etudes  INTEGER DEFAULT 0,
  en_recherche      INTEGER DEFAULT 0,
  calcule_le        TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEX RECOMMANDÉS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_utilisateurs_email     ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_ine       ON utilisateurs(ine);
CREATE INDEX idx_notes_etudiant         ON notes(etudiant_id);
CREATE INDEX idx_creneaux_jour          ON creneaux(jour);
CREATE INDEX idx_creneaux_formation     ON creneaux(formation_id);
CREATE INDEX idx_notifications_dest     ON notifications(destinataire_id);
CREATE INDEX idx_notifications_lu       ON notifications(lu);
CREATE INDEX idx_courriers_statut       ON courriers(statut);
CREATE INDEX idx_suivi_etudiant         ON suivi_insertion(etudiant_id);
CREATE INDEX idx_budget_exercice        ON budget_lignes(exercice);
CREATE INDEX idx_sessions_token         ON sessions_token(token);
CREATE INDEX idx_etudiants_formation    ON etudiants(formation_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER : mise à jour automatique mis_a_jour sur suivi_insertion
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_mis_a_jour()
RETURNS TRIGGER AS $$
BEGIN
  NEW.mis_a_jour = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_suivi_insertion_update
  BEFORE UPDATE ON suivi_insertion
  FOR EACH ROW
  EXECUTE FUNCTION update_mis_a_jour();

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT — 17 tables créées
-- ═══════════════════════════════════════════════════════════════════════════
