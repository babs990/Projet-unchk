/**
 * Script de seed avec hash bcrypt réels.
 * Usage : node sql/seed.js
 * Nécessite que la base soit déjà créée (01_schema.sql exécuté)
 * et la variable d'environnement DB_* configurée (.env à la racine).
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'unchk_db',
  user:     process.env.DB_USER     || 'unchk_user',
  password: process.env.DB_PASSWORD || 'unchk_password',
});

const DEMO_ACCOUNTS = [
  { matricule: 'ADM-001', nom: 'Diop',    prenom: 'Aissatou',  email: 'admin@unchk.sn',      password: 'admin123',      role: 'ADMIN' },
  { matricule: 'ENS-001', nom: 'Kane',    prenom: 'Ibrahima',  email: 'enseignant@unchk.sn', password: 'prof123',       role: 'ENSEIGNANT' },
  { matricule: 'TUT-001', nom: 'Mbaye',   prenom: 'Ndèye',     email: 'tuteur@unchk.sn',     password: 'tuteur123',     role: 'TUTEUR' },
  { matricule: 'INS-001', nom: 'Sow',     prenom: 'Fatoumata', email: 'insertion@unchk.sn',  password: 'insertion123',  role: 'APPUI_INSERTION' },
];

const ETUDIANT_DEMO = {
  ine: 'SN20210001', nom: 'Diallo', prenom: 'Mamadou',
  email: 'etudiant@unchk.sn', password: 'etudiant123', role: 'ETUDIANT',
};

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Démarrage du seed...');
    await client.query('BEGIN');

    // Comptes staff/enseignant/tuteur/insertion
    for (const acc of DEMO_ACCOUNTS) {
      const hashed = await bcrypt.hash(acc.password, 12);
      await client.query(
        `INSERT INTO utilisateurs (matricule, nom, prenom, email, mot_de_passe, role, telephone, actif)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true)
         ON CONFLICT (email) DO UPDATE SET mot_de_passe = EXCLUDED.mot_de_passe`,
        [acc.matricule, acc.nom, acc.prenom, acc.email, hashed, acc.role, '77 100 00 0' + (DEMO_ACCOUNTS.indexOf(acc) + 1)],
      );
      console.log(`✅ Compte créé : ${acc.email} / ${acc.password} (${acc.role})`);
    }

    // Compte étudiant
    const hashedEt = await bcrypt.hash(ETUDIANT_DEMO.password, 12);
    const userResult = await client.query(
      `INSERT INTO utilisateurs (ine, nom, prenom, email, mot_de_passe, role, telephone, actif)
       VALUES ($1,$2,$3,$4,$5,$6,'77 100 00 05',true)
       ON CONFLICT (email) DO UPDATE SET mot_de_passe = EXCLUDED.mot_de_passe
       RETURNING id`,
      [ETUDIANT_DEMO.ine, ETUDIANT_DEMO.nom, ETUDIANT_DEMO.prenom, ETUDIANT_DEMO.email, hashedEt, ETUDIANT_DEMO.role],
    );
    console.log(`✅ Compte créé : ${ETUDIANT_DEMO.email} / ${ETUDIANT_DEMO.password} (ÉTUDIANT)`);

    // Formations démo
    const enseignantId = (await client.query(
      `SELECT id FROM utilisateurs WHERE email = 'enseignant@unchk.sn'`,
    )).rows[0].id;

    const formationResult = await client.query(
      `INSERT INTO formations (intitule, type, niveau, date_debut, date_fin, responsable_id, nb_formes_homme, nb_formes_femme, financement, statut)
       VALUES ('Master Ingénierie Logicielle P8', 'master', 'Bac+5', '2025-10-01', '2026-06-30', $1, 34, 18, 'public', 'active')
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [enseignantId],
    );

    let formationId;
    if (formationResult.rowCount > 0) {
      formationId = formationResult.rows[0].id;
    } else {
      const existing = await client.query(
        `SELECT id FROM formations WHERE intitule = 'Master Ingénierie Logicielle P8'`,
      );
      formationId = existing.rows[0].id;
    }
    console.log(`✅ Formation créée/trouvée : Master IL P8 (id=${formationId})`);

    // Licence Informatique L3
    await client.query(
      `INSERT INTO formations (intitule, type, niveau, date_debut, date_fin, responsable_id, nb_formes_homme, nb_formes_femme, financement, statut)
       VALUES ('Licence Informatique L3', 'licence', 'Bac+3', '2025-10-01', '2026-06-30', $1, 52, 31, 'public', 'active')
       ON CONFLICT DO NOTHING`,
      [enseignantId],
    );
    console.log('✅ Formation créée : Licence Informatique L3');

    // Dossier étudiant lié
    const etudiantResult = await client.query(
      `INSERT INTO etudiants (utilisateur_id, date_naissance, lieu_naissance, sexe, adresse, formation_id, promo, annee_debut, statut)
       VALUES ($1, '2000-03-12', 'Dakar', 'M', 'HLM Grand Yoff, Dakar', $2, '2025', '2021', 'actif')
       ON CONFLICT (utilisateur_id) DO NOTHING
       RETURNING id`,
      [userResult.rows[0].id, formationId],
    );

    let etudiantId;
    if (etudiantResult.rowCount > 0) {
      etudiantId = etudiantResult.rows[0].id;
    } else {
      const existing = await client.query(
        `SELECT id FROM etudiants WHERE utilisateur_id = $1`, [userResult.rows[0].id],
      );
      etudiantId = existing.rows[0].id;
    }
    console.log(`✅ Dossier étudiant créé/trouvé (id=${etudiantId})`);

    // Notes démo
    const notes = [
      ['Algorithmique avancée',   15.5, 4, 'S2 2026'],
      ['Architecture logicielle', 14.0, 4, 'S2 2026'],
      ['Bases de données',       16.0, 3, 'S2 2026'],
      ['Réseaux avancés',        13.5, 3, 'S2 2026'],
      ['Projet tutoré',          14.5, 6, 'S2 2026'],
    ];
    for (const [matiere, note, credit, semestre] of notes) {
      await client.query(
        `INSERT INTO notes (etudiant_id, matiere, note, credit, semestre, enseignant_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (etudiant_id, matiere, semestre) DO NOTHING`,
        [etudiantId, matiere, note, credit, semestre, enseignantId],
      );
    }
    console.log(`✅ ${notes.length} notes ajoutées`);

    // Créneaux emploi du temps
    const creneaux = [
      ['Lundi',    '08:00', '10:00', 'Algorithmique avancée',   'Salle A2', 'cours'],
      ['Lundi',    '14:00', '16:00', 'Architecture logicielle', 'Amphi 1',  'cours'],
      ['Jeudi',    '08:00', '10:00', 'Génie logiciel',          'Amphi 1',  'cours'],
      ['Vendredi', '14:00', '16:00', 'Projet tutoré',           'Salle A3', 'td'],
    ];
    for (const [jour, hd, hf, matiere, salle, type] of creneaux) {
      await client.query(
        `INSERT INTO creneaux (formation_id, formateur_id, jour, heure_debut, heure_fin, matiere, salle, type_cours)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [formationId, enseignantId, jour, hd, hf, matiere, salle, type],
      );
    }
    console.log(`✅ ${creneaux.length} créneaux ajoutés`);

    // Partenaires insertion
    const insertionId = (await client.query(
      `SELECT id FROM utilisateurs WHERE email = 'insertion@unchk.sn'`,
    )).rows[0].id;

    const partenaires = [
      ['Orange Sénégal', 'Télécommunications', 'entreprise', 'M. Thiaw Alioune',   'rh@orange.sn',     '33 869 10 10', 3, '2022-01-15'],
      ['Sonatel',         'Télécommunications', 'entreprise', 'Mme Diallo Rokhaya', 'stages@sonatel.sn','33 839 00 00', 2, '2021-03-10'],
      ['TechSen Hub',     'Innovation / Tech',  'startup',    'M. Ndiaye Moussa',   'hello@techsen.sn', '77 456 78 90', 4, '2024-02-20'],
      ['ANPEJ',           'Emploi jeunes',      'institution','Mme Faye Astou',     'info@anpej.sn',    '33 849 55 55', 5, '2021-08-05'],
    ];
    for (const [nom, secteur, type, contact, email, tel, offres, date] of partenaires) {
      await client.query(
        `INSERT INTO partenaires (nom, secteur, type, contact, email, telephone, offres_actives, date_partenariat, cree_par)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT DO NOTHING`,
        [nom, secteur, type, contact, email, tel, offres, date, insertionId],
      );
    }
    console.log(`✅ ${partenaires.length} partenaires ajoutés`);

    // Budget démo
    const budget = [
      ['Charges de personnel enseignant',    'Personnel',      45000000, 42500000],
      ['Charges de personnel administratif', 'Personnel',      18000000, 17200000],
      ['Fournitures et consommables',        'Fonctionnement',  3500000,  2800000],
      ['Infrastructure numérique',           'Infrastructure', 12000000,  9800000],
    ];
    for (const [intitule, categorie, prevu, realise] of budget) {
      await client.query(
        `INSERT INTO budget_lignes (exercice, intitule, categorie, prevu, realise)
         VALUES ('2026', $1, $2, $3, $4)`,
        [intitule, categorie, prevu, realise],
      );
    }
    console.log(`✅ ${budget.length} lignes budgétaires ajoutées`);

    await client.query('COMMIT');
    console.log('\n🎉 Seed terminé avec succès !\n');
    console.log('═══════════════════════════════════════════');
    console.log('COMPTES DE DÉMONSTRATION');
    console.log('═══════════════════════════════════════════');
    [...DEMO_ACCOUNTS, ETUDIANT_DEMO].forEach((a) => {
      console.log(`${a.role.padEnd(18)} | ${a.email.padEnd(25)} | ${a.password}`);
    });
    console.log('═══════════════════════════════════════════\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur durant le seed :', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
