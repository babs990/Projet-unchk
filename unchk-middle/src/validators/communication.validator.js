const { body } = require('express-validator');

const crRules = [
  body('titre').notEmpty().withMessage('Titre requis').trim(),
  body('type')
    .isIn(['Conseil','Réunion','Séminaire','Webinaire','Rencontre'])
    .withMessage('Type invalide'),
  body('date_cr').isDate().withMessage('Date invalide'),
];

const circRules = [
  body('numero').notEmpty().withMessage('Numéro requis').trim(),
  body('titre').notEmpty().withMessage('Titre requis').trim(),
  body('source')
    .isIn(['Niveau central','Administration'])
    .withMessage('Source invalide'),
];

module.exports = { crRules, circRules };
