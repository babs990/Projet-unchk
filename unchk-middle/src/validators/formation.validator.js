const { body } = require('express-validator');

const createRules = [
  body('intitule').notEmpty().withMessage('Intitulé requis').trim(),
  body('type')
    .isIn(['licence','master','certification','formation-continue'])
    .withMessage('Type invalide'),
  body('niveau').notEmpty().withMessage('Niveau requis'),
  body('date_debut').isDate().withMessage('Date de début invalide'),
  body('date_fin').isDate().withMessage('Date de fin invalide'),
  body('financement')
    .isIn(['public','prive','bourse'])
    .withMessage('Financement invalide'),
];

const updateRules = [
  body('statut').optional()
    .isIn(['active','terminee','a-venir'])
    .withMessage('Statut invalide'),
  body('type').optional()
    .isIn(['licence','master','certification','formation-continue'])
    .withMessage('Type invalide'),
];

module.exports = { createRules, updateRules };
