const { query }          = require('../config/database');
const { success, created, paginated, error } = require('../utils/response');
const { getPagination }  = require('../utils/pagination');
const logger             = require('../config/logger');

// ════════════════════════════════════════════════════════════════════
// COMPTES RENDUS
// ════════════════════════════════════════════════════════════════════

const getAllCR = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { type, search }        = req.query;

    let where  = ['cr.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (type)   { where.push(`cr.type = $${idx}`);            params.push(type);          idx++; }
    if (search) { where.push(`cr.titre ILIKE $${idx}`);       params.push(`%${search}%`); idx++; }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM comptes_rendus cr ${whereClause}`, params,
    );

    const result = await query(
      `SELECT cr.id, cr.titre, cr.type, cr.date_cr, cr.participants,
              cr.resume, cr.fichier_url, cr.cree_le,
              u.nom as auteur_nom, u.prenom as auteur_prenom
       FROM comptes_rendus cr
       LEFT JOIN utilisateurs u ON u.id = cr.auteur_id
       ${whereClause}
       ORDER BY cr.date_cr DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

const getOneCR = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT cr.*, u.nom as auteur_nom, u.prenom as auteur_prenom
       FROM comptes_rendus cr
       LEFT JOIN utilisateurs u ON u.id = cr.auteur_id
       WHERE cr.id = $1`,
      [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Compte rendu introuvable', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const createCR = async (req, res, next) => {
  try {
    const { titre, type, date_cr, participants, resume } = req.body;
    const fichier_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      `INSERT INTO comptes_rendus (titre, type, date_cr, participants, resume, fichier_url, auteur_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [titre.trim(), type, date_cr, participants || '', resume || '', fichier_url, req.user.id],
    );

    // Créer une notification pour tous les utilisateurs actifs
    await query(
      `INSERT INTO notifications (destinataire_id, message, type, lien_ref)
       SELECT id, $1, 'compte-rendu', $2
       FROM utilisateurs WHERE actif = true AND id != $3`,
      [
        `Nouveau compte rendu : ${titre}`,
        `/communication?cr=${result.rows[0].id}`,
        req.user.id,
      ],
    );

    logger.info(`CR créé : ${titre} par ${req.user.email}`);
    return created(res, result.rows[0], 'Compte rendu créé');
  } catch (err) {
    next(err);
  }
};

const updateCR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titre, type, date_cr, participants, resume } = req.body;
    const fichier_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const result = await query(
      `UPDATE comptes_rendus SET
         titre       = COALESCE($1, titre),
         type        = COALESCE($2, type),
         date_cr     = COALESCE($3, date_cr),
         participants= COALESCE($4, participants),
         resume      = COALESCE($5, resume),
         fichier_url = COALESCE($6, fichier_url)
       WHERE id = $7 RETURNING *`,
      [titre, type, date_cr, participants, resume, fichier_url, id],
    );

    if (result.rowCount === 0) return error(res, 'Compte rendu introuvable', 404);
    return success(res, result.rows[0], 'Compte rendu mis à jour');
  } catch (err) {
    next(err);
  }
};

const removeCR = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM comptes_rendus WHERE id = $1 RETURNING id', [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Compte rendu introuvable', 404);
    return success(res, {}, 'Compte rendu supprimé');
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════════════
// CIRCULAIRES
// ════════════════════════════════════════════════════════════════════

const getAllCirc = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, source }      = req.query;

    let where  = ['c.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (search) { where.push(`(c.titre ILIKE $${idx} OR c.numero ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (source) { where.push(`c.source = $${idx}`); params.push(source); idx++; }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM circulaires c ${whereClause}`, params,
    );

    const result = await query(
      `SELECT c.id, c.numero, c.titre, c.source, c.fichier_url, c.publie_le,
              u.nom as publie_par_nom, u.prenom as publie_par_prenom
       FROM circulaires c
       LEFT JOIN utilisateurs u ON u.id = c.publie_par
       ${whereClause}
       ORDER BY c.publie_le DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

const getOneCirc = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, u.nom as publie_par_nom, u.prenom as publie_par_prenom
       FROM circulaires c
       LEFT JOIN utilisateurs u ON u.id = c.publie_par
       WHERE c.id = $1`,
      [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Circulaire introuvable', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const createCirc = async (req, res, next) => {
  try {
    const { numero, titre, contenu, source } = req.body;
    const fichier_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      `INSERT INTO circulaires (numero, titre, contenu, source, fichier_url, publie_par)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [numero.trim(), titre.trim(), contenu || '', source, fichier_url, req.user.id],
    );

    // Notification automatique
    await query(
      `INSERT INTO notifications (destinataire_id, message, type, lien_ref)
       SELECT id, $1, 'circulaire', $2
       FROM utilisateurs WHERE actif = true AND id != $3`,
      [`Nouvelle circulaire ${numero} : ${titre}`, `/communication?circ=${result.rows[0].id}`, req.user.id],
    );

    logger.info(`Circulaire créée : ${numero} - ${titre}`);
    return created(res, result.rows[0], 'Circulaire publiée');
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════════════

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { lu }                  = req.query;

    let where  = [`n.destinataire_id = $1`];
    let params = [req.user.id];
    let idx    = 2;

    if (lu !== undefined) {
      where.push(`n.lu = $${idx}`);
      params.push(lu === 'true');
      idx++;
    }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM notifications n ${whereClause}`, params,
    );

    const result = await query(
      `SELECT n.id, n.message, n.type, n.lien_ref, n.lu, n.cree_le
       FROM notifications n
       ${whereClause}
       ORDER BY n.cree_le DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    const unreadCount = await query(
      'SELECT COUNT(*) FROM notifications WHERE destinataire_id = $1 AND lu = false',
      [req.user.id],
    );

    return paginated(
      res,
      result.rows,
      parseInt(countResult.rows[0].count),
      page,
      limit,
      `${unreadCount.rows[0].count} non lue(s)`,
    );
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(
      'UPDATE notifications SET lu = true WHERE id = $1 AND destinataire_id = $2',
      [id, req.user.id],
    );
    return success(res, {}, 'Notification marquée comme lue');
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE notifications SET lu = true WHERE destinataire_id = $1 AND lu = false RETURNING id',
      [req.user.id],
    );
    return success(res, { updated: result.rowCount }, 'Toutes les notifications lues');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCR, getOneCR, createCR, updateCR, removeCR,
  getAllCirc, getOneCirc, createCirc,
  getNotifications, markAsRead, markAllRead,
};
