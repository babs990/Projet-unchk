const bcrypt              = require('bcryptjs');
const { query }           = require('../config/database');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { success, error }  = require('../utils/response');
const logger              = require('../config/logger');

// ── POST /auth/login ──────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const result = await query(
      'SELECT id, nom, prenom, email, mot_de_passe, role, telephone, avatar_url, actif FROM utilisateurs WHERE email = $1',
      [email.toLowerCase().trim()],
    );

    if (result.rowCount === 0) {
      return error(res, 'Identifiants incorrects', 401);
    }

    const user = result.rows[0];

    if (!user.actif) {
      return error(res, 'Compte désactivé, contactez l\'administration', 403);
    }

    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.mot_de_passe);
    if (!valid) {
      return error(res, 'Identifiants incorrects', 401);
    }

    // Générer les tokens
    const token        = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Stocker le token en base
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
    await query(
      'INSERT INTO sessions_token (utilisateur_id, token, expire_le) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt],
    );

    // Mettre à jour la dernière connexion
    await query(
      'UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = $1',
      [user.id],
    );

    logger.info(`Login réussi : ${user.email} (${user.role})`);

    const { mot_de_passe, ...userSafe } = user;

    return success(res, {
      token,
      refreshToken,
      user: userSafe,
    }, 'Connexion réussie');

  } catch (err) {
    next(err);
  }
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    await query(
      'UPDATE sessions_token SET revoque = true WHERE token = $1',
      [req.token],
    );
    logger.info(`Logout : ${req.user.email}`);
    return success(res, {}, 'Déconnexion réussie');
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/refresh ────────────────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return error(res, 'Refresh token manquant', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);

    const result = await query(
      'SELECT id, nom, prenom, email, role, actif FROM utilisateurs WHERE id = $1',
      [decoded.sub],
    );
    if (result.rowCount === 0 || !result.rows[0].actif) {
      return error(res, 'Utilisateur introuvable', 401);
    }

    const user     = result.rows[0];
    const newToken = generateToken(user.id, user.role);
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);

    await query(
      'INSERT INTO sessions_token (utilisateur_id, token, expire_le) VALUES ($1, $2, $3)',
      [user.id, newToken, expiresAt],
    );

    return success(res, { token: newToken }, 'Token renouvelé');
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Refresh token expiré, reconnectez-vous', 401);
    }
    next(err);
  }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────
const me = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.nom, u.prenom, u.email, u.role, u.telephone, u.avatar_url,
              u.actif, u.date_creation, u.derniere_connexion,
              e.ine, e.formation_id, e.promo, e.statut as etudiant_statut
       FROM utilisateurs u
       LEFT JOIN etudiants e ON e.utilisateur_id = u.id
       WHERE u.id = $1`,
      [req.user.id],
    );
    return success(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── PUT /auth/password ────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await query(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = $1',
      [req.user.id],
    );

    const valid = await bcrypt.compare(currentPassword, result.rows[0].mot_de_passe);
    if (!valid) {
      return error(res, 'Mot de passe actuel incorrect', 400);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await query(
      'UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2',
      [hashed, req.user.id],
    );

    // Révoquer toutes les sessions actives
    await query(
      'UPDATE sessions_token SET revoque = true WHERE utilisateur_id = $1 AND token != $2',
      [req.user.id, req.token],
    );

    logger.info(`Mot de passe changé : ${req.user.email}`);
    return success(res, {}, 'Mot de passe modifié avec succès');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, logout, refresh, me, changePassword };
