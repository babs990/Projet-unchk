const { query }          = require('../config/database');
const { success, created, paginated, error } = require('../utils/response');
const { getPagination }  = require('../utils/pagination');
const logger             = require('../config/logger');

// ════════════════════════════════════════════════════════════════════
// COURRIERS
// ════════════════════════════════════════════════════════════════════

const getAllCourriers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { type, statut, search } = req.query;

    let where  = ['c.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (type)   { where.push(`c.type = $${idx}`);         params.push(type);          idx++; }
    if (statut) { where.push(`c.statut = $${idx}`);       params.push(statut);        idx++; }
    if (search) { where.push(`(c.objet ILIKE $${idx} OR c.reference ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM courriers c ${whereClause}`, params,
    );

    const result = await query(
      `SELECT c.id, c.reference, c.objet, c.expediteur, c.type,
              c.statut, c.date_courrier, c.fichier_url,
              u.nom as traite_par_nom, u.prenom as traite_par_prenom
       FROM courriers c
       LEFT JOIN utilisateurs u ON u.id = c.traite_par
       ${whereClause}
       ORDER BY c.date_courrier DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

const getOneCourrier = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, u.nom as traite_par_nom, u.prenom as traite_par_prenom
       FROM courriers c
       LEFT JOIN utilisateurs u ON u.id = c.traite_par
       WHERE c.id = $1`,
      [req.params.id],
    );
    if (result.rowCount === 0) return error(res, 'Courrier introuvable', 404);
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const createCourrier = async (req, res, next) => {
  try {
    const { objet, expediteur, type, date_courrier, description } = req.body;
    const fichier_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Générer la référence automatique
    const year  = new Date().getFullYear();
    const count = await query(
      'SELECT COUNT(*) FROM courriers WHERE EXTRACT(YEAR FROM date_courrier) = $1', [year],
    );
    const num       = String(parseInt(count.rows[0].count) + 1).padStart(3, '0');
    const reference = `C${type === 'arrivee' ? 'A' : 'D'}-${year}-${num}`;

    const result = await query(
      `INSERT INTO courriers (reference, objet, expediteur, type, date_courrier, description, fichier_url, traite_par)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [reference, objet.trim(), expediteur.trim(), type, date_courrier, description || '', fichier_url, req.user.id],
    );

    logger.info(`Courrier créé : ${reference} - ${objet}`);
    return created(res, result.rows[0], 'Courrier enregistré');
  } catch (err) {
    next(err);
  }
};

const updateCourrierStatut = async (req, res, next) => {
  try {
    const { id }    = req.params;
    const { statut } = req.body;

    const result = await query(
      `UPDATE courriers SET statut = $1, traite_par = $2 WHERE id = $3 RETURNING *`,
      [statut, req.user.id, id],
    );
    if (result.rowCount === 0) return error(res, 'Courrier introuvable', 404);
    return success(res, result.rows[0], 'Statut mis à jour');
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════════════
// NOTES DE SERVICE
// ════════════════════════════════════════════════════════════════════

const getAllNotes = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { type, search }        = req.query;

    let where  = ['n.id IS NOT NULL'];
    let params = [];
    let idx    = 1;

    if (type)   { where.push(`n.type = $${idx}`);       params.push(type);          idx++; }
    if (search) { where.push(`n.objet ILIKE $${idx}`);  params.push(`%${search}%`); idx++; }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM notes_service n ${whereClause}`, params,
    );

    const result = await query(
      `SELECT n.id, n.reference, n.objet, n.destinataire, n.type, n.cree_le,
              u.nom as auteur_nom, u.prenom as auteur_prenom
       FROM notes_service n
       LEFT JOIN utilisateurs u ON u.id = n.auteur_id
       ${whereClause}
       ORDER BY n.cree_le DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return paginated(res, result.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    next(err);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { objet, destinataire, type, contenu } = req.body;

    // Générer la référence
    const year  = new Date().getFullYear();
    const count = await query(
      'SELECT COUNT(*) FROM notes_service WHERE EXTRACT(YEAR FROM cree_le) = $1', [year],
    );
    const num       = String(parseInt(count.rows[0].count) + 1).padStart(3, '0');
    const prefix    = type === 'administrative' ? 'NA' : 'NS';
    const reference = `${prefix}-${year}-${num}`;

    const result = await query(
      `INSERT INTO notes_service (reference, objet, destinataire, type, contenu, auteur_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [reference, objet.trim(), destinataire.trim(), type, contenu || '', req.user.id],
    );

    logger.info(`Note de service créée : ${reference}`);
    return created(res, result.rows[0], 'Note de service publiée');
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════════════
// BUDGET
// ════════════════════════════════════════════════════════════════════

const getBudget = async (req, res, next) => {
  try {
    const exercice = req.query.exercice || new Date().getFullYear().toString();

    const result = await query(
      `SELECT id, exercice, intitule, categorie, prevu, realise,
              CASE WHEN prevu > 0 THEN ROUND((realise / prevu * 100)::numeric, 1) ELSE 0 END as taux_execution
       FROM budget_lignes
       WHERE exercice = $1
       ORDER BY categorie, intitule`,
      [exercice],
    );

    // Totaux
    const totaux = await query(
      `SELECT
         SUM(prevu)   as total_prevu,
         SUM(realise) as total_realise,
         CASE WHEN SUM(prevu) > 0
           THEN ROUND((SUM(realise) / SUM(prevu) * 100)::numeric, 1)
           ELSE 0 END as taux_global
       FROM budget_lignes WHERE exercice = $1`,
      [exercice],
    );

    // Par catégorie
    const parCategorie = await query(
      `SELECT categorie,
         SUM(prevu)   as prevu,
         SUM(realise) as realise
       FROM budget_lignes WHERE exercice = $1
       GROUP BY categorie ORDER BY prevu DESC`,
      [exercice],
    );

    return success(res, {
      exercice,
      lignes:       result.rows,
      totaux:       totaux.rows[0],
      parCategorie: parCategorie.rows,
    });
  } catch (err) {
    next(err);
  }
};

const createBudgetLigne = async (req, res, next) => {
  try {
    const { exercice, intitule, categorie, prevu, realise } = req.body;

    const result = await query(
      `INSERT INTO budget_lignes (exercice, intitule, categorie, prevu, realise)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [exercice, intitule.trim(), categorie, parseFloat(prevu), parseFloat(realise || 0)],
    );

    return created(res, result.rows[0], 'Ligne budgétaire créée');
  } catch (err) {
    next(err);
  }
};

const updateBudgetLigne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { prevu, realise, intitule, categorie } = req.body;

    const result = await query(
      `UPDATE budget_lignes SET
         intitule  = COALESCE($1, intitule),
         categorie = COALESCE($2, categorie),
         prevu     = COALESCE($3, prevu),
         realise   = COALESCE($4, realise)
       WHERE id = $5 RETURNING *`,
      [intitule, categorie, prevu ? parseFloat(prevu) : null, realise ? parseFloat(realise) : null, id],
    );

    if (result.rowCount === 0) return error(res, 'Ligne budgétaire introuvable', 404);
    return success(res, result.rows[0], 'Ligne mise à jour');
  } catch (err) {
    next(err);
  }
};

// ════════════════════════════════════════════════════════════════════
// PERSONNEL (RH)
// ════════════════════════════════════════════════════════════════════

const getPersonnel = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { type, statut, search } = req.query;

    let where  = [`u.role != 'ETUDIANT'`];
    let params = [];
    let idx    = 1;

    if (type)   { where.push(`u.role = $${idx}`);   params.push(type);          idx++; }
    if (statut) { where.push(`u.actif = $${idx}`);  params.push(statut === 'actif'); idx++; }
    if (search) {
      where.push(`(u.nom ILIKE $${idx} OR u.prenom ILIKE $${idx} OR u.matricule ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const whereClause = `WHERE ${where.join(' AND ')}`;

    const countResult = await query(
      `SELECT COUNT(*) FROM utilisateurs u ${whereClause}`, params,
    );

    const result = await query(
      `SELECT u.id, u.matricule, u.nom, u.prenom, u.email, u.telephone,
              u.role, u.actif, u.date_creation as date_recrutement
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

const createPersonnel = async (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, role, specialite, diplome } = req.body;

    // Générer le matricule
    const prefix  = { ADMINISTRATIF: 'ADM', ENSEIGNANT: 'ENS', ENSEIGNANT_ASSOCIE: 'ENS', TUTEUR: 'TUT', RESPONSABLE_FORMATION: 'RF' }[role] || 'ADM';
    const count   = await query('SELECT COUNT(*) FROM utilisateurs WHERE role = $1', [role]);
    const mat     = `${prefix}-${String(parseInt(count.rows[0].count) + 1).padStart(3, '0')}`;

    const hashed  = await require('bcryptjs').hash('unchk2026', 12);

    const result = await query(
      `INSERT INTO utilisateurs (matricule, nom, prenom, email, mot_de_passe, role, telephone)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, matricule, nom, prenom, email, role`,
      [mat, nom.trim(), prenom.trim(), email.toLowerCase().trim(), hashed, role, telephone || ''],
    );

    logger.info(`Personnel créé : ${prenom} ${nom} (${role}) - ${mat}`);
    return created(res, result.rows[0], 'Dossier personnel créé');
  } catch (err) {
    next(err);
  }
};

const updatePersonnel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { telephone, actif } = req.body;

    const result = await query(
      `UPDATE utilisateurs SET
         telephone = COALESCE($1, telephone),
         actif     = COALESCE($2, actif)
       WHERE id = $3 AND role != 'ETUDIANT' RETURNING id, nom, prenom, email, role, actif`,
      [telephone, actif !== undefined ? actif : null, id],
    );

    if (result.rowCount === 0) return error(res, 'Personnel introuvable', 404);
    return success(res, result.rows[0], 'Dossier mis à jour');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCourriers, getOneCourrier, createCourrier, updateCourrierStatut,
  getAllNotes, createNote,
  getBudget, createBudgetLigne, updateBudgetLigne,
  getPersonnel, createPersonnel, updatePersonnel,
};
