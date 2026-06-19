const { body } = require('express-validator');

const partenaireRules = [
  body('nom').notEmpty().withMessage('Nom requis').trim(),
  body('secteur').notEmpty().withMessage('Secteur requis'),
  body('type')
    .isIn(['entreprise','ong','institution','startup'])
    .withMessage('Type invalide'),
  body('contact').notEmpty().withMessage('Contact requis'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('date_partenariat').isDate().withMessage('Date invalide'),
];

const suiviRules = [
  body('etudiant_id').isInt({ min: 1 }).withMessage('ID étudiant invalide'),
  body('statut')
    .isIn(['emploi-salarie','auto-emploi','stage','poursuite-etudes','en-recherche'])
    .withMessage('Statut invalide'),
];

module.exports = { partenaireRules, suiviRules };
