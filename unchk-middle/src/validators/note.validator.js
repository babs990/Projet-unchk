const { body } = require('express-validator');

const createRules = [
  body('etudiant_id').isInt({ min: 1 }).withMessage('ID étudiant invalide'),
  body('matiere').notEmpty().withMessage('Matière requise').trim(),
  body('note')
    .isFloat({ min: 0, max: 20 }).withMessage('Note doit être entre 0 et 20'),
  body('credit')
    .isInt({ min: 1, max: 10 }).withMessage('Crédit invalide (1-10)'),
  body('semestre').notEmpty().withMessage('Semestre requis'),
];

const updateRules = [
  body('note').optional().isFloat({ min: 0, max: 20 }).withMessage('Note doit être entre 0 et 20'),
  body('credit').optional().isInt({ min: 1, max: 10 }).withMessage('Crédit invalide (1-10)'),
];

module.exports = { createRules, updateRules };
