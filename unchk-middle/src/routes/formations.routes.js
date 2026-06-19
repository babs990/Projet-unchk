const router = require('express').Router();
const ctrl   = require('../controllers/formations.controller');
const crCtrl = require('../controllers/creneaux.controller');
const rnCtrl = require('../controllers/reunions.controller');
const { authenticate, isStaff, isStaffOrTeacher, authorize, ROLES } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createRules, updateRules } = require('../validators/formation.validator');

router.use(authenticate);

// Formations
router.get('/',        ctrl.getAll);
router.post('/',       authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.RESPONSABLE_FORMATION), createRules, validate, ctrl.create);
router.get('/:id',     ctrl.getOne);
router.put('/:id',     authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.RESPONSABLE_FORMATION), updateRules, validate, ctrl.update);
router.delete('/:id',  isStaff, ctrl.remove);

// Créneaux d'une formation
router.get('/:id/creneaux', ctrl.getCreneaux);

// Créneaux (emploi du temps)
router.get('/creneaux',       ctrl.getCreneaux);
router.post('/creneaux',      authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.RESPONSABLE_FORMATION), crCtrl.create);
router.put('/creneaux/:id',   authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.RESPONSABLE_FORMATION), crCtrl.update);
router.delete('/creneaux/:id', isStaff, crCtrl.remove);

// Réunions
router.get('/reunions',       rnCtrl.getAll);
router.post('/reunions',      authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.ENSEIGNANT_ASSOCIE, ROLES.RESPONSABLE_FORMATION, ROLES.TUTEUR), rnCtrl.create);
router.get('/reunions/:id',   rnCtrl.getOne);
router.put('/reunions/:id',   isStaffOrTeacher, rnCtrl.update);
router.delete('/reunions/:id', isStaffOrTeacher, rnCtrl.remove);

module.exports = router;
