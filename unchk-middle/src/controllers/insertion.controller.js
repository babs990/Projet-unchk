const { query }          = require('../config/database');
const { success, created, paginated, error } = require('../utils/response');
const { getPagination }  = require('../utils/pagination');
const logger             = require('../config/logger');

// ════════════════════════════════════════════════════════════════════
// PARTENAIRES
// ════════════════════════════════════════════════════════════════════

const getAllPartenaires = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { type, search }        = req.query;

    let where  = ['p.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (type)   { where.push(`p.type = $${idx}`);      params.push(type);          idx++; }
    if (search) { where.push(`(p.nom ILIKE $${idx} OR p.secteur ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM partenaires p ${whereClause}`, params,
    );

    const result = await query(
      `SELECT p.id, p.nom, p.secteur, p.type, p.contact, p.email,
              p.telephone, p.offres_actives, p.date_partenariat,
              u.nom as cree_par_nom, u.prenom as cree_par_prenom
       FROM partenaires p
       LEFT JOIN utilisateurs u ON u.id = p.cree_par
       ${whereClause}
       ORDER BY p.nom
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

const getOnePartenaire = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*, u.nom as cree_par_nom, u.prenom as cree_par_prenom
       FROM partenaires p
       LEFT JOIN utilisateurs u ON u.id = p.cree_par
       WHERE p.id = $1`,
      [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Partenaire introuvable', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const createPartenaire = async (req, res, next) => {
  try {
    const { nom, secteur, type, contact, email, telephone, date_partenariat } = req.body;

    const result = await query(
      `INSERT INTO partenaires (nom, secteur, type, contact, email, telephone, date_partenariat, cree_par)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nom.trim(), secteur.trim(), type, contact.trim(), email.toLowerCase().trim(),
       telephone || '', date_partenariat, req.user.id],
    );

    logger.info(`Partenaire créé : ${nom} (${type})`);
    return created(res, result.rows[0], 'Partenaire ajouté');
  } catch (err) {
    next(err);
  }
};

const updatePartenaire = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, secteur, type, contact, email, telephone, offres_actives } = req.body;

    const result = await query(
      `UPDATE partenaires SET
         nom           = COALESCE($1, nom),
         secteur       = COALESCE($2, secteur),
         type          = COALESCE($3, type),
         contact       = COALESCE($4, contact),
         email         = COALESCE($5, email),
         telephone     = COALESCE($6, telephone),
         offres_actives= COALESCE($7, offres_actives)
       WHERE id = $8 RETURNING *`,
      [nom, secteur, type, contact, email, telephone,
       offres_actives !== undefined ? parseInt(offres_actives) : null, id],
    );

    if (result.rowCount === 0) return error(res, 'Partenaire introuvable', 404);
    return success(res, result.rows[0], 'Partenaire mis à jour');
  } catch (err) {
    next(err);
  }
};

const removePartenaire = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM partenaires WHERE id = $1 RETURNING id', [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Partenaire introuvable', 404);
    return success(res, {}, 'Partenaire supprimé');
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════════════
// SUIVI INSERTION
// ════════════════════════════════════════════════════════════════════

const getAllSuivi = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { statut, search }      = req.query;

    let where  = ['s.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    // Étudiant ne voit que son propre suivi
    if (req.user.role === 'ETUDIANT') {
      const et = await query('SELECT id FROM etudiants WHERE utilisateur_id = $1', [req.user.id]);
      if (et.rowCount > 0) {
        where.push(`s.etudiant_id = $${idx}`);
        params.push(et.rows[0].id);
        idx++;
      }
    }

    if (statut) { where.push(`s.statut = $${idx}`); params.push(statut); idx++; }
    if (search) {
      where.push(`(u.nom ILIKE $${idx} OR u.prenom ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM suivi_insertion s
       JOIN etudiants e ON e.id = s.etudiant_id
       JOIN utilisateurs u ON u.id = e.utilisateur_id
       ${whereClause}`,
      params,
    );

    const result = await query(
      `SELECT s.id, s.statut, s.entreprise, s.poste, s.date_insertion,
              s.bilan_stage, s.mis_a_jour,
              e.id as etudiant_id, e.promo, e.formation_id,
              u.nom, u.prenom, u.email,
              p.nom as partenaire_nom
       FROM suivi_insertion s
       JOIN etudiants e ON e.id = s.etudiant_id
       JOIN utilisateurs u ON u.id = e.utilisateur_id
       LEFT JOIN partenaires p ON p.id = s.partenaire_id
       ${whereClause}
       ORDER BY s.mis_a_jour DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

const createSuivi = async (req, res, next) => {
  try {
    const { etudiant_id, statut, entreprise, poste, date_insertion, bilan_stage, partenaire_id } = req.body;

    // Vérifier si un suivi existe déjà pour cet étudiant
    const existing = await query(
      'SELECT id FROM suivi_insertion WHERE etudiant_id = $1', [etudiant_id],
    );

    let result;
    if (existing.rowCount > 0) {
      // Mettre à jour
      result = await query(
        `UPDATE suivi_insertion SET
           statut       = $1, entreprise   = $2, poste        = $3,
           date_insertion = $4, bilan_stage = $5, partenaire_id = $6,
           mis_a_jour   = NOW()
         WHERE etudiant_id = $7 RETURNING *`,
        [statut, entreprise || '', poste || '', date_insertion || null,
         bilan_stage || '', partenaire_id || null, etudiant_id],
      );
      return success(res, result.rows[0], 'Suivi mis à jour');
    }

    result = await query(
      `INSERT INTO suivi_insertion (etudiant_id, statut, entreprise, poste, date_insertion, bilan_stage, partenaire_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [etudiant_id, statut, entreprise || '', poste || '',
       date_insertion || null, bilan_stage || '', partenaire_id || null],
    );

    logger.info(`Suivi insertion créé : étudiant ${etudiant_id} -> ${statut}`);
    return created(res, result.rows[0], 'Suivi insertion créé');
  } catch (err) {
    next(err);
  }
};

const updateSuivi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut, entreprise, poste, date_insertion, bilan_stage, partenaire_id } = req.body;

    const result = await query(
      `UPDATE suivi_insertion SET
         statut        = COALESCE($1, statut),
         entreprise    = COALESCE($2, entreprise),
         poste         = COALESCE($3, poste),
         date_insertion= COALESCE($4, date_insertion),
         bilan_stage   = COALESCE($5, bilan_stage),
         partenaire_id = COALESCE($6, partenaire_id),
         mis_a_jour    = NOW()
       WHERE id = $7 RETURNING *`,
      [statut, entreprise, poste, date_insertion, bilan_stage,
       partenaire_id || null, id],
    );

    if (result.rowCount === 0) return error(res, 'Suivi introuvable', 404);
    return success(res, result.rows[0], 'Suivi mis à jour');
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════════════
// STATISTIQUES INSERTION
// ════════════════════════════════════════════════════════════════════

const getStatistiques = async (req, res, next) => {
  try {
    // Stats par année de promotion
    const parPromo = await query(
      `SELECT
         e.promo as annee_promo,
         COUNT(e.id) as total_diplomes,
         COUNT(s.id) FILTER (WHERE s.statut = 'emploi-salarie')  as emploi_salarie,
         COUNT(s.id) FILTER (WHERE s.statut = 'auto-emploi')     as auto_emploi,
         COUNT(s.id) FILTER (WHERE s.statut = 'poursuite-etudes')as poursuite_etudes,
         COUNT(s.id) FILTER (WHERE s.statut = 'en-recherche')    as en_recherche,
         COUNT(s.id) FILTER (WHERE s.statut = 'stage')           as en_stage
       FROM etudiants e
       LEFT JOIN suivi_insertion s ON s.etudiant_id = e.id
       WHERE e.statut IN ('actif','diplome')
       GROUP BY e.promo
       ORDER BY e.promo DESC`,
    );

    // Taux d'insertion global
    const global = await query(
      `SELECT
         COUNT(e.id) as total,
         COUNT(s.id) FILTER (WHERE s.statut IN ('emploi-salarie','auto-emploi')) as inseres,
         CASE WHEN COUNT(e.id) > 0
           THEN ROUND(COUNT(s.id) FILTER (WHERE s.statut IN ('emploi-salarie','auto-emploi'))::numeric
                / COUNT(e.id) * 100, 1)
           ELSE 0 END as taux_insertion
       FROM etudiants e
       LEFT JOIN suivi_insertion s ON s.etudiant_id = e.id`,
    );

    // Top secteurs partenaires
    const secteurs = await query(
      `SELECT p.secteur, COUNT(s.id) as nb_inseres
       FROM suivi_insertion s
       JOIN partenaires p ON p.id = s.partenaire_id
       WHERE s.statut IN ('emploi-salarie','stage')
       GROUP BY p.secteur
       ORDER BY nb_inseres DESC
       LIMIT 5`,
    );

    return success(res, {
      parPromo:  parPromo.rows,
      global:    global.rows[0],
      secteurs:  secteurs.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPartenaires, getOnePartenaire, createPartenaire, updatePartenaire, removePartenaire,
  getAllSuivi, createSuivi, updateSuivi,
  getStatistiques,
};
