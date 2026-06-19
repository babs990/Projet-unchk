const jwt    = require('jsonwebtoken');
const { query } = require('../config/database');

// ── Vérification JWT ──────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier si le token est révoqué
    const tokenCheck = await query(
      'SELECT id FROM sessions_token WHERE token = $1 AND revoque = false AND expire_le > NOW()',
      [token],
    );
    if (tokenCheck.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Session expirée, veuillez vous reconnecter' });
    }

    // Récupérer l'utilisateur
    const userResult = await query(
      'SELECT id, nom, prenom, email, role, telephone, avatar_url, actif FROM utilisateurs WHERE id = $1',
      [decoded.sub],
    );
    if (userResult.rowCount === 0 || !userResult.rows[0].actif) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable ou désactivé' });
    }

    req.user  = userResult.rows[0];
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expiré' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token invalide' });
    }
    next(err);
  }
};

// ── Vérification des rôles ────────────────────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Accès refusé. Rôles autorisés : ${roles.join(', ')}`,
    });
  }
  next();
};

// ── Rôles prédéfinis ──────────────────────────────────────────────────────────
const ROLES = {
  ADMIN:                 'ADMIN',
  ADMINISTRATIF:         'ADMINISTRATIF',
  ENSEIGNANT:            'ENSEIGNANT',
  ENSEIGNANT_ASSOCIE:    'ENSEIGNANT_ASSOCIE',
  RESPONSABLE_FORMATION: 'RESPONSABLE_FORMATION',
  TUTEUR:                'TUTEUR',
  ETUDIANT:              'ETUDIANT',
  APPUI_INSERTION:       'APPUI_INSERTION',
};

const isStaff       = authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF);
const isStaffOrTeacher = authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.ENSEIGNANT_ASSOCIE, ROLES.RESPONSABLE_FORMATION, ROLES.TUTEUR);
const isNotEtudiant = authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.ENSEIGNANT_ASSOCIE, ROLES.RESPONSABLE_FORMATION, ROLES.TUTEUR, ROLES.APPUI_INSERTION);

module.exports = { authenticate, authorize, ROLES, isStaff, isStaffOrTeacher, isNotEtudiant };
