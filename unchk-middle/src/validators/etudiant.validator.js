const { body } = require('express-validator');

const createRules = [
  body('nom').notEmpty().withMessage('Nom requis').trim(),
  body('prenom').notEmpty().withMessage('Prénom requis').trim(),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('date_naissance').isDate().withMessage('Date de naissance invalide'),
  body('lieu_naissance').notEmpty().withMessage('Lieu de naissance requis'),
  body('sexe').isIn(['M','F']).withMessage('Sexe doit être M ou F'),
  body('promo').notEmpty().withMessage('Promotion requise'),
  body('annee_debut').notEmpty().withMessage('Année de début requise'),
];

const updateRules = [
  body('statut').optional()
    .isIn(['actif','diplome','abandonne','suspendu'])
    .withMessage('Statut invalide'),
];

module.exports = { createRules, updateRules };
