const { query }  = require('../config/database');
const { success, created, error } = require('../utils/response');
const logger     = require('../config/logger');

// ── GET /creneaux ─────────────────────────────────────────────────────────────
const getAll = async (req, res, next) => {
  try {
    const { jour, formation_id, formateur_id } = req.query;

    let where  = ['c.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (jour)         { where.push(`c.jour = $${idx}`);           params.push(jour);         idx++; }
    if (formation_id) { where.push(`c.formation_id = $${idx}`);   params.push(formation_id); idx++; }
    if (formateur_id) { where.push(`c.formateur_id = $${idx}`);   params.push(formateur_id); idx++; }

    const result = await query(
      `SELECT c.id, c.jour, c.heure_debut, c.heure_fin, c.matiere, c.salle, c.type_cours,
              c.formation_id, f.intitule as formation_nom,
              c.formateur_id, u.nom as formateur_nom, u.prenom as formateur_prenom
       FROM creneaux c
       JOIN formations f ON f.id = c.formation_id
       JOIN utilisateurs u ON u.id = c.formateur_id
       WHERE ${where.join(' AND ')}
       ORDER BY CASE c.jour
         WHEN 'Lundi' THEN 1 WHEN 'Mardi' THEN 2 WHEN 'Mercredi' THEN 3
         WHEN 'Jeudi' THEN 4 WHEN 'Vendredi' THEN 5 WHEN 'Samedi' THEN 6 END,
         c.heure_debut`,
      params,
    );

    return success(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// ── POST /creneaux ────────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const { formation_id, formateur_id, jour, heure_debut, heure_fin, matiere, salle, type_cours } = req.body;

    // Vérifier conflit de salle
    const conflict = await query(
      `SELECT id FROM creneaux
       WHERE salle = $1 AND jour = $2
         AND ((heure_debut < $4 AND heure_fin > $3))`,
      [salle, jour, heure_debut, heure_fin],
    );
    if (conflict.rowCount > 0) {
      return error(res, `Conflit : la salle ${salle} est déjà occupée sur ce créneau`, 409);
    }

    const result = await query(
      `INSERT INTO creneaux (formation_id, formateur_id, jour, heure_debut, heure_fin, matiere, salle, type_cours)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [formation_id, formateur_id, jour, heure_debut, heure_fin, matiere.trim(), salle, type_cours],
    );

    logger.info(`Créneau créé : ${jour} ${heure_debut}-${heure_fin} - ${matiere}`);
    return created(res, result.rows[0], 'Créneau ajouté');
  } catch (err) {
    next(err);
  }
};

// ── PUT /creneaux/:id ─────────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jour, heure_debut, heure_fin, matiere, salle, type_cours, formateur_id } = req.body;

    const result = await query(
      `UPDATE creneaux SET
         jour        = COALESCE($1, jour),
         heure_debut = COALESCE($2, heure_debut),
         heure_fin   = COALESCE($3, heure_fin),
         matiere     = COALESCE($4, matiere),
         salle       = COALESCE($5, salle),
         type_cours  = COALESCE($6, type_cours),
         formateur_id= COALESCE($7, formateur_id)
       WHERE id = $8 RETURNING *`,
      [jour, heure_debut, heure_fin, matiere, salle, type_cours, formateur_id, id],
    );

    if (result.rowCount === 0) return error(res, 'Créneau introuvable', 404);
    return success(res, result.rows[0], 'Créneau mis à jour');
  } catch (err) {
    next(err);
  }
};

// ── DELETE /creneaux/:id ──────────────────────────────────────────────────────
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM creneaux WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return error(res, 'Créneau introuvable', 404);
    return success(res, {}, 'Créneau supprimé');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove };
