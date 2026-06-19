const { query }          = require('../config/database');
const { success, created, error } = require('../utils/response');
const logger             = require('../config/logger');

// ── GET /etudiants/:id/notes ──────────────────────────────────────────────────
const getByEtudiant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { semestre } = req.query;

    let sql    = `SELECT n.id, n.matiere, n.note, n.credit, n.semestre, n.saisie_le,
                         u.nom as enseignant_nom, u.prenom as enseignant_prenom
                  FROM notes n
                  LEFT JOIN utilisateurs u ON u.id = n.enseignant_id
                  WHERE n.etudiant_id = $1`;
    const params = [id];

    if (semestre) { sql += ` AND n.semestre = $2`; params.push(semestre); }
    sql += ' ORDER BY n.semestre, n.matiere';

    const result = await query(sql, params);

    // Calculer la moyenne pondérée
    let moyenne = 0;
    if (result.rows.length > 0) {
      const pts = result.rows.reduce((s, n) => s + n.note * n.credit, 0);
      const cr  = result.rows.reduce((s, n) => s + n.credit, 0);
      moyenne   = cr ? Math.round((pts / cr) * 10) / 10 : 0;
    }

    return success(res, { notes: result.rows, moyenne, total: result.rowCount });
  } catch (err) {
    next(err);
  }
};

// ── POST /notes ───────────────────────────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const { etudiant_id, matiere, note, credit, semestre } = req.body;

    // Vérifier que l'étudiant existe
    const et = await query('SELECT id FROM etudiants WHERE id = $1', [etudiant_id]);
    if (et.rowCount === 0) {
      return error(res, 'Étudiant introuvable', 404);
    }

    // Vérifier si la note existe déjà pour cette matière/semestre
    const existing = await query(
      'SELECT id FROM notes WHERE etudiant_id = $1 AND matiere = $2 AND semestre = $3',
      [etudiant_id, matiere, semestre],
    );
    if (existing.rowCount > 0) {
      return error(res, 'Note déjà saisie pour cette matière et ce semestre. Utilisez PUT pour modifier.', 409);
    }

    const result = await query(
      `INSERT INTO notes (etudiant_id, matiere, note, credit, semestre, enseignant_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [etudiant_id, matiere.trim(), parseFloat(note), parseInt(credit), semestre, req.user.id],
    );

    // Recalculer et mettre à jour la moyenne de l'étudiant
    logger.info(`Note ajoutée : étudiant ${etudiant_id}, matière ${matiere}, note ${note}`);
    return created(res, result.rows[0], 'Note enregistrée');
  } catch (err) {
    next(err);
  }
};

// ── PUT /notes/:id ────────────────────────────────────────────────────────────
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, credit } = req.body;

    const result = await query(
      `UPDATE notes SET
         note   = COALESCE($1, note),
         credit = COALESCE($2, credit)
       WHERE id = $3 RETURNING *`,
      [parseFloat(note), parseInt(credit), id],
    );

    if (result.rowCount === 0) {
      return error(res, 'Note introuvable', 404);
    }
    return success(res, result.rows[0], 'Note modifiée');
  } catch (err) {
    next(err);
  }
};

// ── DELETE /notes/:id ─────────────────────────────────────────────────────────
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return error(res, 'Note introuvable', 404);
    }
    return success(res, {}, 'Note supprimée');
  } catch (err) {
    next(err);
  }
};

module.exports = { getByEtudiant, create, update, remove };
