const { query }          = require('../config/database');
const { success, paginated, error } = require('../utils/response');
const { getPagination }  = require('../utils/pagination');

// ── GET /utilisateurs ─────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { role, actif, search } = req.query;

    let where  = ['u.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (role)   { where.push(`u.role = $${idx}`);   params.push(role);          idx++; }
    if (actif !== undefined) { where.push(`u.actif = $${idx}`); params.push(actif === 'true'); idx++; }
    if (search) {
      where.push(`(u.nom ILIKE $${idx} OR u.prenom ILIKE $${idx} OR u.email ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM utilisateurs u ${whereClause}`, params,
    );

    const result = await query(
      `SELECT u.id, u.ine, u.matricule, u.nom, u.prenom, u.email,
              u.role, u.telephone, u.actif, u.date_creation, u.derniere_connexion
       FROM utilisateurs u
       ${whereClause}
       ORDER BY u.nom, u.prenom
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

// ── GET /utilisateurs/:id ─────────────────────────────────────────────────────
const getOne = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.ine, u.matricule, u.nom, u.prenom, u.email,
              u.role, u.telephone, u.avatar_url, u.actif,
              u.date_creation, u.derniere_connexion
       FROM utilisateurs u WHERE u.id = $1`,
      [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Utilisateur introuvable', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── PUT /utilisateurs/:id ─────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Un utilisateur ne peut modifier que son propre profil (sauf admin)
    if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(id)) {
      return error(res, 'Accès non autorisé', 403);
    }

    const { nom, prenom, telephone } = req.body;
    const avatar_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const result = await query(
      `UPDATE utilisateurs SET
         nom        = COALESCE($1, nom),
         prenom     = COALESCE($2, prenom),
         telephone  = COALESCE($3, telephone),
         avatar_url = COALESCE($4, avatar_url)
       WHERE id = $5
       RETURNING id, nom, prenom, email, role, telephone, avatar_url`,
      [nom, prenom, telephone, avatar_url, id],
    );

    if (result.rowCount === 0) return error(res, 'Utilisateur introuvable', 404);
    return success(res, result.rows[0], 'Profil mis à jour');
  } catch (err) {
    next(err);
  }
};

// ── PUT /utilisateurs/:id/actif ───────────────────────────────────────────────
const toggleActif = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE utilisateurs SET actif = NOT actif WHERE id = $1
       RETURNING id, nom, prenom, actif`,
      [id],
    );
    if (result.rowCount === 0) return error(res, 'Utilisateur introuvable', 404);
    const user = result.rows[0];
    return success(res, user, `Compte ${user.actif ? 'activé' : 'désactivé'}`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, update, toggleActif };
