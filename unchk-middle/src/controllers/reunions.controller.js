const { query }          = require('../config/database');
const { success, created, paginated, error } = require('../utils/response');
const { getPagination }  = require('../utils/pagination');
const logger             = require('../config/logger');

// ── GET /reunions ─────────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { type, statut, search } = req.query;

    let where  = ['r.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (type)   { where.push(`r.type = $${idx}`);       params.push(type);          idx++; }
    if (statut) { where.push(`r.statut = $${idx}`);     params.push(statut);        idx++; }
    if (search) { where.push(`r.titre ILIKE $${idx}`);  params.push(`%${search}%`); idx++; }

    // Tuteur ne voit que les réunions de tutorat
    if (req.user.role === 'TUTEUR') {
      where.push(`r.type = 'tutorat'`);
    }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM reunions r ${whereClause}`, params,
    );

    const result = await query(
      `SELECT r.id, r.titre, r.type, r.date_reunion, r.heure,
              r.participants, r.notes, r.statut,
              u.nom as cree_par_nom, u.prenom as cree_par_prenom
       FROM reunions r
       LEFT JOIN utilisateurs u ON u.id = r.cree_par
       ${whereClause}
       ORDER BY r.date_reunion DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

// ── GET /reunions/:id ─────────────────────────────────────────────────────────
const getOne = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, u.nom as cree_par_nom, u.prenom as cree_par_prenom
       FROM reunions r
       LEFT JOIN utilisateurs u ON u.id = r.cree_par
       WHERE r.id = $1`,
      [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Réunion introuvable', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── POST /reunions ────────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const { titre, type, date_reunion, heure, participants, notes } = req.body;

    const result = await query(
      `INSERT INTO reunions (titre, type, date_reunion, heure, participants, notes, cree_par)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [titre.trim(), type, date_reunion, heure, participants || '', notes || '', req.user.id],
    );

    // Notification aux participants concernés
    const roles = type === 'tutorat'
      ? ['TUTEUR', 'RESPONSABLE_FORMATION']
      : type === 'preparation-cours'
      ? ['ENSEIGNANT', 'ENSEIGNANT_ASSOCIE', 'RESPONSABLE_FORMATION']
      : ['ENSEIGNANT', 'ENSEIGNANT_ASSOCIE', 'RESPONSABLE_FORMATION', 'ADMINISTRATIF'];

    await query(
      `INSERT INTO notifications (destinataire_id, message, type, lien_ref)
       SELECT id, $1, 'reunion', $2
       FROM utilisateurs
       WHERE role = ANY($3::text[]) AND actif = true AND id != $4`,
      [
        `Réunion planifiée : ${titre} le ${date_reunion} à ${heure}`,
        `/formations?reunion=${result.rows[0].id}`,
        roles,
        req.user.id,
      ],
    );

    logger.info(`Réunion créée : ${titre} (${type})`);
    return created(res, result.rows[0], 'Réunion planifiée');
  } catch (err) {
    next(err);
  }
};

// ── PUT /reunions/:id ─────────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titre, type, date_reunion, heure, participants, notes, statut } = req.body;

    const result = await query(
      `UPDATE reunions SET
         titre       = COALESCE($1, titre),
         type        = COALESCE($2, type),
         date_reunion= COALESCE($3, date_reunion),
         heure       = COALESCE($4, heure),
         participants= COALESCE($5, participants),
         notes       = COALESCE($6, notes),
         statut      = COALESCE($7, statut)
       WHERE id = $8 RETURNING *`,
      [titre, type, date_reunion, heure, participants, notes, statut, id],
    );

    if (result.rowCount === 0) return error(res, 'Réunion introuvable', 404);
    return success(res, result.rows[0], 'Réunion mise à jour');
  } catch (err) {
    next(err);
  }
};

// ── DELETE /reunions/:id ──────────────────────────────────────────────────────
const remove = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE reunions SET statut = 'annulee' WHERE id = $1 RETURNING id`,
      [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Réunion introuvable', 404);
    return success(res, {}, 'Réunion annulée');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
