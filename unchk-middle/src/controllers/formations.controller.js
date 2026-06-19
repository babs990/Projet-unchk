const { query }          = require('../config/database');
const { success, created, paginated, error } = require('../utils/response');
const { getPagination }  = require('../utils/pagination');
const logger             = require('../config/logger');

// ── GET /formations ───────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { type, statut, search } = req.query;

    let where  = ['f.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (type)   { where.push(`f.type = $${idx}`);          params.push(type);           idx++; }
    if (statut) { where.push(`f.statut = $${idx}`);        params.push(statut);         idx++; }
    if (search) { where.push(`f.intitule ILIKE $${idx}`);  params.push(`%${search}%`);  idx++; }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM formations f ${whereClause}`, params,
    );

    const result = await query(
      `SELECT f.id, f.intitule, f.type, f.niveau, f.date_debut, f.date_fin,
              f.nb_formes_homme, f.nb_formes_femme, f.financement, f.montant, f.statut,
              u.nom as responsable_nom, u.prenom as responsable_prenom,
              (f.nb_formes_homme + f.nb_formes_femme) as total_formes
       FROM formations f
       LEFT JOIN utilisateurs u ON u.id = f.responsable_id
       ${whereClause}
       ORDER BY f.date_debut DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

// ── GET /formations/:id ───────────────────────────────────────────────────────
const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT f.*, u.nom as responsable_nom, u.prenom as responsable_prenom
       FROM formations f
       LEFT JOIN utilisateurs u ON u.id = f.responsable_id
       WHERE f.id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      return error(res, 'Formation introuvable', 404);
    }

    // Formateurs liés
    const formateurs = await query(
      `SELECT DISTINCT u.id, u.nom, u.prenom, u.role, u.email
       FROM creneaux c
       JOIN utilisateurs u ON u.id = c.formateur_id
       WHERE c.formation_id = $1`,
      [id],
    );

    // Nombre d'étudiants inscrits
    const etudiants = await query(
      'SELECT COUNT(*) as nb FROM etudiants WHERE formation_id = $1', [id],
    );

    return success(res, {
      ...result.rows[0],
      formateurs:    formateurs.rows,
      nb_etudiants:  parseInt(etudiants.rows[0].nb),
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /formations ──────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const {
      intitule, type, niveau, date_debut, date_fin,
      responsable_id, nb_formes_homme, nb_formes_femme,
      financement, montant,
    } = req.body;

    const result = await query(
      `INSERT INTO formations
         (intitule, type, niveau, date_debut, date_fin, responsable_id,
          nb_formes_homme, nb_formes_femme, financement, montant)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [intitule.trim(), type, niveau, date_debut, date_fin,
       responsable_id || null, nb_formes_homme || 0, nb_formes_femme || 0,
       financement, montant || null],
    );

    logger.info(`Formation créée : ${intitule}`);
    return created(res, result.rows[0], 'Formation créée');
  } catch (err) {
    next(err);
  }
};

// ── PUT /formations/:id ───────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      intitule, type, niveau, date_debut, date_fin,
      responsable_id, nb_formes_homme, nb_formes_femme,
      financement, montant, statut,
    } = req.body;

    const result = await query(
      `UPDATE formations SET
         intitule       = COALESCE($1, intitule),
         type           = COALESCE($2, type),
         niveau         = COALESCE($3, niveau),
         date_debut     = COALESCE($4, date_debut),
         date_fin       = COALESCE($5, date_fin),
         responsable_id = COALESCE($6, responsable_id),
         nb_formes_homme= COALESCE($7, nb_formes_homme),
         nb_formes_femme= COALESCE($8, nb_formes_femme),
         financement    = COALESCE($9, financement),
         montant        = COALESCE($10, montant),
         statut         = COALESCE($11, statut)
       WHERE id = $12 RETURNING *`,
      [intitule, type, niveau, date_debut, date_fin, responsable_id,
       nb_formes_homme, nb_formes_femme, financement, montant, statut, id],
    );

    if (result.rowCount === 0) return error(res, 'Formation introuvable', 404);
    return success(res, result.rows[0], 'Formation mise à jour');
  } catch (err) {
    next(err);
  }
};

// ── DELETE /formations/:id ────────────────────────────────────────────────────
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE formations SET statut = 'terminee' WHERE id = $1 RETURNING id`, [id],
    );
    if (result.rowCount === 0) return error(res, 'Formation introuvable', 404);
    return success(res, {}, 'Formation archivée');
  } catch (err) {
    next(err);
  }
};

// ── GET /formations/:id/creneaux ──────────────────────────────────────────────
const getCreneaux = async (req, res, next) => {
  try {
    const { id }  = req.params;
    const { jour } = req.query;

    let sql    = `SELECT c.*, u.nom as formateur_nom, u.prenom as formateur_prenom
                  FROM creneaux c
                  JOIN utilisateurs u ON u.id = c.formateur_id
                  WHERE c.formation_id = $1`;
    const params = [id];
    if (jour) { sql += ` AND c.jour = $2`; params.push(jour); }
    sql += ' ORDER BY c.jour, c.heure_debut';

    const result = await query(sql, params);
    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove, getCreneaux };
