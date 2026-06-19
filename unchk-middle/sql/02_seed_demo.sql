-- ═══════════════════════════════════════════════════════════════════════════
-- DONNÉES DE DÉMONSTRATION — PLATEFORME UNCHK
-- Mots de passe en clair avant hash : voir comptes_demo.md
-- Tous hashés avec bcrypt coût 12 (générés via le script seed.js)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- COMPTES UTILISATEURS DÉMO
-- Les mots de passe hashés ci-dessous sont des PLACEHOLDERS.
-- Utilisez `node sql/seed.js` pour générer un seed avec les vrais hash bcrypt.
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO utilisateurs (matricule, nom, prenom, email, mot_de_passe, role, telephone, actif) VALUES
('ADM-001', 'Diop',    'Aissatou',  'admin@unchk.sn',      '$2a$12$PLACEHOLDER_HASH_ADMIN',      'ADMIN',          '77 100 00 01', true),
('ENS-001', 'Kane',    'Ibrahima',  'enseignant@unchk.sn', '$2a$12$PLACEHOLDER_HASH_ENSEIGNANT', 'ENSEIGNANT',     '77 100 00 02', true),
('TUT-001', 'Mbaye',   'Ndèye',     'tuteur@unchk.sn',      '$2a$12$PLACEHOLDER_HASH_TUTEUR',     'TUTEUR',         '77 100 00 03', true),
('INS-001', 'Sow',     'Fatoumata', 'insertion@unchk.sn',  '$2a$12$PLACEHOLDER_HASH_INSERTION',  'APPUI_INSERTION','77 100 00 04', true);

-- L'étudiant démo est inséré séparément car il a besoin d'un dossier etudiants lié
INSERT INTO utilisateurs (ine, nom, prenom, email, mot_de_passe, role, telephone, actif) VALUES
('SN20210001', 'Diallo', 'Mamadou', 'etudiant@unchk.sn', '$2a$12$PLACEHOLDER_HASH_ETUDIANT', 'ETUDIANT', '77 100 00 05', true);

-- ─────────────────────────────────────────────────────────────────────────
-- FORMATIONS
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO formations (intitule, type, niveau, date_debut, date_fin, responsable_id, nb_formes_homme, nb_formes_femme, financement, statut) VALUES
('Master Ingénierie Logicielle P8', 'master',  'Bac+5', '2025-10-01', '2026-06-30',
  (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn'), 34, 18, 'public', 'active'),
('Licence Informatique L3',         'licence', 'Bac+3', '2025-10-01', '2026-06-30',
  (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn'), 52, 31, 'public', 'active'),
('Master Réseaux & Télécoms',       'master',  'Bac+5', '2025-10-01', '2026-06-30',
  (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn'), 28, 12, 'public', 'active');

-- ─────────────────────────────────────────────────────────────────────────
-- DOSSIER ÉTUDIANT DÉMO
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO etudiants (utilisateur_id, date_naissance, lieu_naissance, sexe, adresse, formation_id, promo, annee_debut, statut)
VALUES (
  (SELECT id FROM utilisateurs WHERE email = 'etudiant@unchk.sn'),
  '2000-03-12', 'Dakar', 'M', 'HLM Grand Yoff, Dakar',
  (SELECT id FROM formations WHERE intitule = 'Master Ingénierie Logicielle P8'),
  '2025', '2021', 'actif'
);

-- ─────────────────────────────────────────────────────────────────────────
-- NOTES DE L'ÉTUDIANT DÉMO
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO notes (etudiant_id, matiere, note, credit, semestre, enseignant_id) VALUES
((SELECT id FROM etudiants e JOIN utilisateurs u ON u.id = e.utilisateur_id WHERE u.email = 'etudiant@unchk.sn'),
  'Algorithmique avancée',   15.5, 4, 'S2 2026', (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn')),
((SELECT id FROM etudiants e JOIN utilisateurs u ON u.id = e.utilisateur_id WHERE u.email = 'etudiant@unchk.sn'),
  'Architecture logicielle', 14.0, 4, 'S2 2026', (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn')),
((SELECT id FROM etudiants e JOIN utilisateurs u ON u.id = e.utilisateur_id WHERE u.email = 'etudiant@unchk.sn'),
  'Bases de données',        16.0, 3, 'S2 2026', (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn'));

-- ─────────────────────────────────────────────────────────────────────────
-- CRÉNEAUX EMPLOI DU TEMPS
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO creneaux (formation_id, formateur_id, jour, heure_debut, heure_fin, matiere, salle, type_cours) VALUES
((SELECT id FROM formations WHERE intitule = 'Master Ingénierie Logicielle P8'),
  (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn'),
  'Lundi', '08:00', '10:00', 'Algorithmique avancée', 'Salle A2', 'cours'),
((SELECT id FROM formations WHERE intitule = 'Master Ingénierie Logicielle P8'),
  (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn'),
  'Lundi', '14:00', '16:00', 'Architecture logicielle', 'Amphi 1', 'cours'),
((SELECT id FROM formations WHERE intitule = 'Master Ingénierie Logicielle P8'),
  (SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn'),
  'Jeudi', '08:00', '10:00', 'Génie logiciel', 'Amphi 1', 'cours');

-- ─────────────────────────────────────────────────────────────────────────
-- PARTENAIRES INSERTION
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO partenaires (nom, secteur, type, contact, email, telephone, offres_actives, date_partenariat, cree_par) VALUES
('Orange Sénégal', 'Télécommunications', 'entreprise', 'M. Thiaw Alioune', 'rh@orange.sn', '33 869 10 10', 3, '2022-01-15',
  (SELECT id FROM utilisateurs WHERE email = 'insertion@unchk.sn')),
('Sonatel',         'Télécommunications', 'entreprise', 'Mme Diallo Rokhaya', 'stages@sonatel.sn', '33 839 00 00', 2, '2021-03-10',
  (SELECT id FROM utilisateurs WHERE email = 'insertion@unchk.sn')),
('TechSen Hub',     'Innovation / Tech',  'startup',    'M. Ndiaye Moussa', 'hello@techsen.sn', '77 456 78 90', 4, '2024-02-20',
  (SELECT id FROM utilisateurs WHERE email = 'insertion@unchk.sn')),
('ANPEJ',           'Emploi jeunes',      'institution','Mme Faye Astou', 'info@anpej.sn', '33 849 55 55', 5, '2021-08-05',
  (SELECT id FROM utilisateurs WHERE email = 'insertion@unchk.sn'));

-- ─────────────────────────────────────────────────────────────────────────
-- BUDGET DÉMO (exercice en cours)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO budget_lignes (exercice, intitule, categorie, prevu, realise) VALUES
('2026', 'Charges de personnel enseignant',    'Personnel',      45000000, 42500000),
('2026', 'Charges de personnel administratif', 'Personnel',      18000000, 17200000),
('2026', 'Fournitures et consommables',        'Fonctionnement',  3500000,  2800000),
('2026', 'Infrastructure numérique',           'Infrastructure', 12000000,  9800000);

-- ─────────────────────────────────────────────────────────────────────────
-- COMPTE RENDU & CIRCULAIRE DÉMO
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO comptes_rendus (titre, type, date_cr, participants, resume, auteur_id) VALUES
('Conseil pédagogique semestre 2', 'Conseil', '2026-05-10', 'Direction, responsables formations',
  'Bilan mi-parcours et préparation des examens de juin.',
  (SELECT id FROM utilisateurs WHERE email = 'admin@unchk.sn'));

INSERT INTO circulaires (numero, titre, contenu, source, publie_par) VALUES
('N°12-2026', 'Modalités examens session juin 2026', 'Calendrier et règlement des examens.',
  'Niveau central', (SELECT id FROM utilisateurs WHERE email = 'admin@unchk.sn'));

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DU SEED
-- ═══════════════════════════════════════════════════════════════════════════
