const bcrypt             = require('bcryptjs');
const { query, withTransaction } = require('../config/database');
const { success, created, paginated, error } = require('../utils/response');
const { getPagination }  = require('../utils/pagination');
const logger             = require('../config/logger');

// ── GET /etudiants ────────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, statut, formation_id } = req.query;

    let where  = ['e.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (search) {
      where.push(`(u.nom ILIKE $${idx} OR u.prenom ILIKE $${idx} OR u.ine ILIKE $${idx} OR u.email ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }
    if (statut) {
      where.push(`e.statut = $${idx}`); params.push(statut); idx++;
    }
    if (formation_id) {
      where.push(`e.formation_id = $${idx}`); params.push(formation_id); idx++;
    }

    // Si étudiant : voir seulement son propre dossier
    if (req.user.role === 'ETUDIANT') {
      where.push(`u.id = $${idx}`); params.push(req.user.id); idx++;
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM etudiants e JOIN utilisateurs u ON u.id = e.utilisateur_id ${whereClause}`,
      params,
    );

    const result = await query(
      `SELECT e.id, u.ine, u.nom, u.prenom, u.email, u.telephone,
              e.date_naissance, e.lieu_naissance, e.sexe, e.adresse,
              e.formation_id, f.intitule as formation_nom,
              e.promo, e.annee_debut, e.annee_sortie, e.statut, e.cree_le,
              ROUND(
                COALESCE(
                  SUM(n.note * n.credit) FILTER (WHERE n.id IS NOT NULL) /
                  NULLIF(SUM(n.credit) FILTER (WHERE n.id IS NOT NULL), 0)
                , 0)::numeric, 1
              ) as moyenne
       FROM etudiants e
       JOIN utilisateurs u ON u.id = e.utilisateur_id
       LEFT JOIN formations f ON f.id = e.formation_id
       LEFT JOIN notes n ON n.etudiant_id = e.id
       ${whereClause}
       GROUP BY e.id, u.ine, u.nom, u.prenom, u.email, u.telephone,
                e.date_naissance, e.lieu_naissance, e.sexe, e.adresse,
                e.formation_id, f.intitule, e.promo, e.annee_debut,
                e.annee_sortie, e.statut, e.cree_le
       ORDER BY u.nom, u.prenom
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

// ── GET /etudiants/:id ────────────────────────────────────────────────────────
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Étudiant ne peut voir que son propre dossier
    if (req.user.role === 'ETUDIANT') {
      const self = await query(
        'SELECT id FROM etudiants WHERE utilisateur_id = $1', [req.user.id],
      );
      if (self.rowCount === 0 || self.rows[0].id !== parseInt(id)) {
        return error(res, 'Accès non autorisé', 403);
      }
    }

    const result = await query(
      `SELECT e.id, u.ine, u.nom, u.prenom, u.email, u.telephone, u.avatar_url,
              e.date_naissance, e.lieu_naissance, e.sexe, e.adresse,
              e.formation_id, f.intitule as formation_nom,
              e.promo, e.annee_debut, e.annee_sortie, e.statut, e.cree_le
       FROM etudiants e
       JOIN utilisateurs u ON u.id = e.utilisateur_id
       LEFT JOIN formations f ON f.id = e.formation_id
       WHERE e.id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      return error(res, 'Étudiant introuvable', 404);
    }

    // Récupérer les notes
    const notes = await query(
      `SELECT n.id, n.matiere, n.note, n.credit, n.semestre, n.saisie_le,
              u.nom as enseignant_nom, u.prenom as enseignant_prenom
       FROM notes n
       LEFT JOIN utilisateurs u ON u.id = n.enseignant_id
       WHERE n.etudiant_id = $1
       ORDER BY n.semestre, n.matiere`,
      [id],
    );

    // Calculer la moyenne
    let moyenne = 0;
    if (notes.rows.length > 0) {
      const totalPoints  = notes.rows.reduce((s, n) => s + n.note * n.credit, 0);
      const totalCredits = notes.rows.reduce((s, n) => s + n.credit, 0);
      moyenne = totalCredits ? Math.round((totalPoints / totalCredits) * 10) / 10 : 0;
    }

    // Récupérer les diplômes
    const diplomes = await query(
      'SELECT id, intitule, annee, etablissement FROM diplomes WHERE etudiant_id = $1',
      [id],
    );

    return success(res, {
      ...result.rows[0],
      notes:    notes.rows,
      diplomes: diplomes.rows,
      moyenne,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /etudiants ───────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const {
      nom, prenom, email, telephone, mot_de_passe,
      date_naissance, lieu_naissance, sexe, adresse,
      formation_id, promo, annee_debut,
    } = req.body;

    await withTransaction(async (client) => {
      // Générer l'INE
      const year = new Date().getFullYear();
      const count = await client.query('SELECT COUNT(*) FROM utilisateurs WHERE role = $1', ['ETUDIANT']);
      const ine   = `SN${year}${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

      // Hash mot de passe
      const hashed = await bcrypt.hash(mot_de_passe || 'unchk2026', 12);

      // Créer l'utilisateur
      const userResult = await client.query(
        `INSERT INTO utilisateurs (ine, nom, prenom, email, mot_de_passe, role, telephone)
         VALUES ($1, $2, $3, $4, $5, 'ETUDIANT', $6) RETURNING id`,
        [ine, nom.trim(), prenom.trim(), email.toLowerCase().trim(), hashed, telephone],
      );
      const userId = userResult.rows[0].id;

      // Créer le dossier étudiant
      const etResult = await client.query(
        `INSERT INTO etudiants
           (utilisateur_id, date_naissance, lieu_naissance, sexe, adresse, formation_id, promo, annee_debut)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [userId, date_naissance, lieu_naissance, sexe, adresse || '', formation_id || null, promo, annee_debut],
      );

      logger.info(`Étudiant créé : ${prenom} ${nom} (INE: ${ine})`);

      return created(res, {
        id:  etResult.rows[0].id,
        ine,
        nom, prenom, email,
        formation_id, promo,
      }, 'Dossier étudiant créé avec succès');
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /etudiants/:id ────────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      telephone, adresse, formation_id,
      promo, annee_debut, annee_sortie, statut,
    } = req.body;

    const result = await query(
      `UPDATE etudiants SET
         adresse     = COALESCE($1, adresse),
         formation_id= COALESCE($2, formation_id),
         promo       = COALESCE($3, promo),
         annee_debut = COALESCE($4, annee_debut),
         annee_sortie= COALESCE($5, annee_sortie),
         statut      = COALESCE($6, statut)
       WHERE id = $7 RETURNING id`,
      [adresse, formation_id, promo, annee_debut, annee_sortie, statut, id],
    );

    if (result.rowCount === 0) {
      return error(res, 'Étudiant introuvable', 404);
    }

    if (telephone) {
      await query(
        'UPDATE utilisateurs SET telephone = $1 WHERE id = (SELECT utilisateur_id FROM etudiants WHERE id = $2)',
        [telephone, id],
      );
    }

    return success(res, { id: parseInt(id) }, 'Dossier mis à jour');
  } catch (err) {
    next(err);
  }
};

// ── DELETE /etudiants/:id ─────────────────────────────────────────────────────
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE etudiants SET statut = 'abandonne' WHERE id = $1 RETURNING id`,
      [id],
    );
    if (result.rowCount === 0) {
      return error(res, 'Étudiant introuvable', 404);
    }
    return success(res, {}, 'Étudiant archivé');
  } catch (err) {
    next(err);
  }
};

// ── GET /etudiants/statistiques ───────────────────────────────────────────────
const statistiques = async (req, res, next) => {
  try {
    const [total, parStatut, parFormation, parGenre] = await Promise.all([
      query('SELECT COUNT(*) as total FROM etudiants'),
      query(`SELECT statut, COUNT(*) as total FROM etudiants GROUP BY statut`),
      query(`SELECT f.intitule, COUNT(e.id) as total,
               COUNT(e.id) FILTER (WHERE e.statut = 'actif') as actifs,
               COUNT(e.id) FILTER (WHERE e.statut = 'diplome') as diplomes
             FROM etudiants e
             JOIN formations f ON f.id = e.formation_id
             GROUP BY f.intitule ORDER BY total DESC`),
      query(`SELECT u.sexe, COUNT(*) as total
             FROM etudiants e JOIN utilisateurs u ON u.id = e.utilisateur_id
             GROUP BY u.sexe`),
    ]);

    return success(res, {
      total:        parseInt(total.rows[0].total),
      parStatut:    parStatut.rows,
      parFormation: parFormation.rows,
      parGenre:     parGenre.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove, statistiques };
