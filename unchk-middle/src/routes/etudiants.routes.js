const router = require('express').Router();
const ctrl   = require('../controllers/etudiants.controller');
const notesCtrl = require('../controllers/notes.controller');
const { authenticate, isStaff, isStaffOrTeacher, authorize, ROLES } = require('../middleware/auth.middleware');
const { validate }   = require('../middleware/validate.middleware');
const { upload }     = require('../middleware/upload.middleware');
const { createRules, updateRules } = require('../validators/etudiant.validator');
const { createRules: noteCreate, updateRules: noteUpdate } = require('../validators/note.validator');

// Tous les routes nécessitent authentification
router.use(authenticate);

// Statistiques (admin/staff)
router.get('/statistiques', isStaff, ctrl.statistiques);

// CRUD étudiants
router.get('/',    isStaffOrTeacher, ctrl.getAll);
router.post('/',   isStaff, createRules, validate, ctrl.create);
router.get('/:id', ctrl.getOne);          // étudiant peut voir son propre dossier
router.put('/:id', isStaff, updateRules, validate, ctrl.update);
router.delete('/:id', isStaff, ctrl.remove);

// Notes d'un étudiant
router.get('/:id/notes', ctrl.getOne);    // incluses dans getOne

// CRUD notes
router.post('/notes',     authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.ENSEIGNANT_ASSOCIE, ROLES.RESPONSABLE_FORMATION), noteCreate, validate, notesCtrl.create);
router.put('/notes/:id',  authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.ENSEIGNANT_ASSOCIE), noteUpdate, validate, notesCtrl.update);
router.delete('/notes/:id', isStaff, notesCtrl.remove);

module.exports = router;
