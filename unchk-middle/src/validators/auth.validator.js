const { body } = require('express-validator');

const loginRules = [
  body('email')
    .notEmpty().withMessage('Email requis')
    .isEmail().withMessage('Format email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mot de passe requis')
    .isLength({ min: 6 }).withMessage('Minimum 6 caractères'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .notEmpty().withMessage('Nouveau mot de passe requis')
    .isLength({ min: 8 }).withMessage('Minimum 8 caractères')
    .matches(/[A-Z]/).withMessage('Au moins une majuscule')
    .matches(/[0-9]/).withMessage('Au moins un chiffre'),
  body('confirmPassword')
    .custom((val, { req }) => val === req.body.newPassword)
    .withMessage('Les mots de passe ne correspondent pas'),
];

module.exports = { loginRules, changePasswordRules };
