const logger = require('../config/logger');

// ── Gestionnaire d'erreurs global ────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    stack:  err.stack,
    method: req.method,
    url:    req.originalUrl,
    user:   req.user?.id,
  });

  // Erreur de validation Postgres
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Cette valeur existe déjà (contrainte unique)',
      field:   err.detail,
    });
  }
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Référence introuvable (contrainte clé étrangère)',
    });
  }

  // Erreur multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Fichier trop volumineux (max 10 Mo)',
    });
  }

  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// ── Route non trouvée ────────────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} introuvable`,
  });
};

module.exports = { errorHandler, notFound };
